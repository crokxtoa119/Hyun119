import { PRESET_TOOLS, type PresetTool } from "./presetRegistry";
import { MAX_PRESETS, isRecord, readPresets, writePresets, type Preset } from "./usePresets";

export const BACKUP_APP = "sketchcraft-presets";
export const BACKUP_VERSION = 1;
/** 가져올 파일의 최대 크기(글자 수). 이보다 크면 열어 보지 않는다. */
export const MAX_BACKUP_CHARS = 1_000_000;
/** 프리셋 하나의 데이터 최대 크기(JSON 글자 수) */
export const MAX_PRESET_JSON = 10_000;
/** 프리셋 이름 최대 길이. 프리셋 저장 입력칸의 maxLength와 같다. */
export const MAX_NAME = 20;

export type BackupEntry = { name: string; data: unknown };
export type BackupFile = {
  app: typeof BACKUP_APP;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  /** 도구 슬러그 → 프리셋 목록 (비어 있는 도구는 넣지 않는다) */
  tools: Record<string, BackupEntry[]>;
};

/** 저장된 프리셋을 내보내기 파일 내용으로 만든다. id는 가져올 때 새로 매기므로 빼 둔다. */
export function buildBackup(
  read: (t: PresetTool) => Preset<unknown>[],
  now: Date,
  tools: PresetTool[] = PRESET_TOOLS,
): BackupFile {
  const out: Record<string, BackupEntry[]> = {};
  for (const t of tools) {
    const list = read(t);
    if (list.length) out[t.slug] = list.map((p) => ({ name: p.name, data: p.data }));
  }
  return { app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: now.toISOString(), tools: out };
}

export function serializeBackup(b: BackupFile): string {
  return JSON.stringify(b, null, 2);
}

export function backupFilename(now: Date): string {
  return `sketchcraft-presets-${now.toISOString().slice(0, 10)}.json`;
}

export function countBackup(b: Pick<BackupFile, "tools">): number {
  return Object.values(b.tools).reduce((n, list) => n + list.length, 0);
}

export type ParseResult =
  | {
      ok: true;
      tools: Record<string, BackupEntry[]>;
      /** 가져올 수 있는 프리셋 수 */
      accepted: number;
      /** 형식이 맞지 않거나 너무 커서 건너뛴 수 */
      skipped: number;
    }
  | { ok: false; reason: string };

/**
 * 파일 내용을 읽어 검증한다. 믿지 않는 입력이라서 크기를 먼저 보고,
 * 도구마다 가진 타입 가드를 통과한 항목만 받는다. 알 수 없는 도구와 형식이 틀린 항목은 건너뛴다.
 */
export function parseBackup(text: string, tools: PresetTool[] = PRESET_TOOLS): ParseResult {
  if (text.length > MAX_BACKUP_CHARS) return { ok: false, reason: "파일이 너무 큽니다." };

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, reason: "JSON 파일이 아니거나 내용이 깨졌습니다." };
  }
  if (!isRecord(raw) || raw.app !== BACKUP_APP) {
    return { ok: false, reason: "SketchCraft 프리셋 백업 파일이 아닙니다." };
  }
  if (raw.version !== BACKUP_VERSION) {
    return { ok: false, reason: "지원하지 않는 백업 파일 버전입니다." };
  }
  if (!isRecord(raw.tools)) return { ok: false, reason: "가져올 프리셋이 없습니다." };

  const bySlug = new Map(tools.map((t) => [t.slug, t]));
  const out: Record<string, BackupEntry[]> = {};
  let accepted = 0;
  let skipped = 0;

  for (const [slug, list] of Object.entries(raw.tools)) {
    if (!Array.isArray(list)) continue;
    const t = bySlug.get(slug);
    if (!t) {
      skipped += list.length;
      continue;
    }
    const good: BackupEntry[] = [];
    for (const item of list) {
      const ok =
        good.length < MAX_PRESETS &&
        isRecord(item) &&
        typeof item.name === "string" &&
        t.validate(item.data) &&
        JSON.stringify(item.data).length <= MAX_PRESET_JSON;
      if (ok) {
        good.push({ name: (item.name as string).trim().slice(0, MAX_NAME), data: item.data });
      } else {
        skipped += 1;
      }
    }
    if (good.length) {
      out[slug] = good;
      accepted += good.length;
    }
  }

  if (accepted === 0) return { ok: false, reason: "가져올 수 있는 프리셋이 없습니다." };
  return { ok: true, tools: out, accepted, skipped };
}

export type ImportMode = "merge" | "replace";

export type ApplyResult = {
  next: Preset<unknown>[];
  added: number;
  /** 이름과 내용이 같아 건너뛴 수(합치기에서만) */
  duplicate: number;
  /** 12개 한도를 넘어 못 넣은 수 */
  overflow: number;
};

/** 한 도구의 기존 프리셋에 가져온 프리셋을 합치거나 덮어쓴 결과를 만든다. 저장은 하지 않는다. */
export function applyImport(
  existing: Preset<unknown>[],
  incoming: BackupEntry[],
  mode: ImportMode,
): ApplyResult {
  const next = mode === "replace" ? [] : [...existing];
  let nextId = Math.max(0, ...next.map((p) => Number(p.id) || 0)) + 1;
  let added = 0;
  let duplicate = 0;
  let overflow = 0;

  for (const e of incoming) {
    const dup = next.some(
      (p) => p.name === e.name && JSON.stringify(p.data) === JSON.stringify(e.data),
    );
    if (dup) {
      duplicate += 1;
    } else if (next.length >= MAX_PRESETS) {
      overflow += 1;
    } else {
      const id = String(nextId++);
      next.push({ id, name: e.name || `프리셋 ${id}`, data: e.data });
      added += 1;
    }
  }
  return { next, added, duplicate, overflow };
}

export type ImportSummary = {
  added: number;
  duplicate: number;
  overflow: number;
  /** 저장소가 막혀 쓰지 못한 도구 수 */
  failed: number;
};

/** 파일에 들어 있던 도구만 저장소에 반영한다. 파일에 없는 도구의 프리셋은 건드리지 않는다. */
export function importBackup(
  tools: Record<string, BackupEntry[]>,
  mode: ImportMode,
  registry: PresetTool[] = PRESET_TOOLS,
): ImportSummary {
  const sum: ImportSummary = { added: 0, duplicate: 0, overflow: 0, failed: 0 };
  for (const t of registry) {
    const incoming = tools[t.slug];
    if (!incoming) continue;
    const r = applyImport(readPresets(t.key, t.validate), incoming, mode);
    if (writePresets(t.key, r.next)) {
      sum.added += r.added;
      sum.duplicate += r.duplicate;
      sum.overflow += r.overflow;
    } else {
      sum.failed += 1;
    }
  }
  return sum;
}

/** 지금 저장된 프리셋 전체를 내보내기 파일 내용으로 만든다. */
export function exportAll(now: Date = new Date()): BackupFile {
  return buildBackup((t) => readPresets(t.key, t.validate), now);
}

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_BLEND } from "./blend";
import { DEFAULT_FLEX } from "./flex";
import {
  BACKUP_APP,
  BACKUP_VERSION,
  MAX_BACKUP_CHARS,
  MAX_NAME,
  applyImport,
  backupFilename,
  buildBackup,
  countBackup,
  exportAll,
  importBackup,
  parseBackup,
  serializeBackup,
  type BackupEntry,
} from "./presetBackup";
import { MAX_PRESETS, readPresets, writePresets, type Preset } from "./usePresets";
import { PRESET_TOOLS } from "./presetRegistry";

const tool = (slug: string) => PRESET_TOOLS.find((t) => t.slug === slug)!;
const flex = tool("flexbox");
const blend = tool("blend");

const preset = (id: string, name: string, data: unknown): Preset<unknown> => ({ id, name, data });
const file = (tools: unknown, extra: Record<string, unknown> = {}) =>
  JSON.stringify({ app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: "x", tools, ...extra });

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe("buildBackup / serializeBackup", () => {
  it("프리셋이 있는 도구만 담고 id는 빼며 이름과 데이터를 유지한다", () => {
    const store: Record<string, Preset<unknown>[]> = {
      [flex.key]: [preset("3", "내 설정", DEFAULT_FLEX)],
    };
    const b = buildBackup((t) => store[t.key] ?? [], new Date("2026-10-20T01:02:03Z"));
    expect(b.app).toBe(BACKUP_APP);
    expect(b.exportedAt).toBe("2026-10-20T01:02:03.000Z");
    expect(Object.keys(b.tools)).toEqual(["flexbox"]);
    expect(b.tools.flexbox).toEqual([{ name: "내 설정", data: DEFAULT_FLEX }]);
    expect(countBackup(b)).toBe(1);
    expect(serializeBackup(b)).toContain('"flexbox"');
  });

  it("파일 이름에 날짜가 들어간다", () => {
    expect(backupFilename(new Date("2026-10-20T23:59:59Z"))).toBe("sketchcraft-presets-2026-10-20.json");
  });
});

describe("parseBackup", () => {
  it("내보낸 내용을 그대로 읽는다(왕복)", () => {
    const b = buildBackup(
      (t) => (t.slug === "blend" ? [preset("1", "섞기", DEFAULT_BLEND)] : []),
      new Date(),
    );
    const r = parseBackup(serializeBackup(b));
    expect(r).toMatchObject({ ok: true, accepted: 1, skipped: 0 });
    if (r.ok) expect(r.tools.blend).toEqual([{ name: "섞기", data: DEFAULT_BLEND }]);
  });

  it("너무 큰 파일은 열어 보지 않는다", () => {
    const r = parseBackup("x".repeat(MAX_BACKUP_CHARS + 1));
    expect(r).toEqual({ ok: false, reason: "파일이 너무 큽니다." });
  });

  it("JSON이 아니거나 다른 앱의 파일이거나 버전이 다르면 거부한다", () => {
    expect(parseBackup("{깨짐").ok).toBe(false);
    expect(parseBackup("[]").ok).toBe(false);
    expect(parseBackup(JSON.stringify({ app: "other", version: 1, tools: {} })).ok).toBe(false);
    const wrongVersion = parseBackup(file({}, { version: 2 }));
    expect(wrongVersion.ok).toBe(false);
    if (!wrongVersion.ok) expect(wrongVersion.reason).toContain("버전");
  });

  it("tools가 없거나 유효한 프리셋이 하나도 없으면 거부한다", () => {
    expect(parseBackup(file(null)).ok).toBe(false);
    expect(parseBackup(file({})).ok).toBe(false);
    expect(parseBackup(file({ flexbox: [{ name: "x", data: { direction: "diagonal" } }] })).ok).toBe(false);
  });

  it("알 수 없는 도구와 형식이 틀린 항목은 건너뛰고 나머지는 받는다", () => {
    const r = parseBackup(
      file({
        flexbox: [
          { name: "정상", data: DEFAULT_FLEX },
          { name: "나쁨", data: { ...DEFAULT_FLEX, align: "left" } },
          { data: DEFAULT_FLEX },
          "문자열",
        ],
        unknown_tool: [{ name: "a", data: {} }, { name: "b", data: {} }],
        blend: "배열 아님",
      }),
    );
    expect(r).toMatchObject({ ok: true, accepted: 1, skipped: 5 });
    if (r.ok) expect(Object.keys(r.tools)).toEqual(["flexbox"]);
  });

  it("이름은 다듬고 20자로 자른다", () => {
    const r = parseBackup(file({ flexbox: [{ name: `  ${"가".repeat(50)}  `, data: DEFAULT_FLEX }] }));
    if (!r.ok) throw new Error("expected ok");
    expect(r.tools.flexbox[0].name).toBe("가".repeat(MAX_NAME));
  });

  it("도구당 12개까지만 받고 나머지는 건너뛴 수에 센다", () => {
    const many = Array.from({ length: 15 }, (_, i) => ({ name: `p${i}`, data: DEFAULT_FLEX }));
    const r = parseBackup(file({ flexbox: many }));
    expect(r).toMatchObject({ ok: true, accepted: MAX_PRESETS, skipped: 3 });
  });

  it("프리셋 하나가 너무 크면 건너뛴다", () => {
    const typography = {
      fontKey: "geist",
      text: "가".repeat(20_000),
      size: 10,
      weight: 400,
      tracking: 0,
      leading: 1,
      align: "left",
    };
    const r = parseBackup(file({ typography: [{ name: "긴 글", data: typography }], flexbox: [{ name: "ok", data: DEFAULT_FLEX }] }));
    expect(r).toMatchObject({ ok: true, accepted: 1, skipped: 1 });
  });

  it("__proto__ 같은 키가 들어 있어도 전역 객체를 오염시키지 않는다", () => {
    const r = parseBackup(
      `{"app":"${BACKUP_APP}","version":1,"tools":{"__proto__":[{"name":"x","data":{}}],"flexbox":[{"name":"a","data":${JSON.stringify(DEFAULT_FLEX)}}]}}`,
    );
    expect(r.ok).toBe(true);
    expect(({} as Record<string, unknown>).name).toBeUndefined();
  });
});

describe("applyImport", () => {
  const entry = (name: string, g = 12): BackupEntry => ({ name, data: { ...DEFAULT_FLEX, gap: g } });

  it("합치기: 기존 뒤에 붙이고 id를 이어서 매긴다", () => {
    const r = applyImport([preset("5", "기존", DEFAULT_FLEX)], [entry("새것")], "merge");
    expect(r).toMatchObject({ added: 1, duplicate: 0, overflow: 0 });
    expect(r.next.map((p) => [p.id, p.name])).toEqual([
      ["5", "기존"],
      ["6", "새것"],
    ]);
  });

  it("합치기: 이름과 내용이 같으면 건너뛴다", () => {
    const e = entry("같음");
    const r = applyImport([preset("1", "같음", e.data)], [e, entry("같음", 20)], "merge");
    expect(r).toMatchObject({ added: 1, duplicate: 1 });
  });

  it("합치기: 12개 한도를 넘으면 못 넣은 수에 센다", () => {
    const existing = Array.from({ length: 11 }, (_, i) => preset(String(i + 1), `p${i}`, DEFAULT_FLEX));
    const r = applyImport(existing, [entry("a", 1), entry("b", 2), entry("c", 3)], "merge");
    expect(r.next).toHaveLength(MAX_PRESETS);
    expect(r).toMatchObject({ added: 1, overflow: 2 });
  });

  it("덮어쓰기: 기존을 버리고 가져온 것만 남긴다", () => {
    const r = applyImport([preset("9", "버려짐", DEFAULT_FLEX)], [entry("a", 1), entry("b", 2)], "replace");
    expect(r.next.map((p) => [p.id, p.name])).toEqual([
      ["1", "a"],
      ["2", "b"],
    ]);
    expect(r.added).toBe(2);
  });

  it("이름이 비면 자동 이름을 붙인다", () => {
    const r = applyImport([], [{ name: "", data: DEFAULT_FLEX }], "merge");
    expect(r.next[0].name).toBe("프리셋 1");
  });
});

describe("importBackup / exportAll (저장소 연동)", () => {
  it("내보낸 뒤 비우고 가져오면 같은 프리셋이 복원된다", () => {
    writePresets(flex.key, [preset("1", "하나", DEFAULT_FLEX), preset("2", "둘", { ...DEFAULT_FLEX, gap: 30 })]);
    writePresets(blend.key, [preset("1", "섞기", DEFAULT_BLEND)]);

    const text = serializeBackup(exportAll(new Date()));
    localStorage.clear();
    expect(readPresets(flex.key, flex.validate)).toHaveLength(0);

    const parsed = parseBackup(text);
    if (!parsed.ok) throw new Error("expected ok");
    const sum = importBackup(parsed.tools, "merge");
    expect(sum).toMatchObject({ added: 3, duplicate: 0, overflow: 0, failed: 0 });
    expect(readPresets(flex.key, flex.validate).map((p) => p.name)).toEqual(["하나", "둘"]);
    expect(readPresets(blend.key, blend.validate)).toHaveLength(1);
  });

  it("덮어쓰기는 파일에 있는 도구만 바꾸고 나머지는 그대로 둔다", () => {
    writePresets(flex.key, [preset("1", "옛것", DEFAULT_FLEX)]);
    writePresets(blend.key, [preset("1", "남아야 함", DEFAULT_BLEND)]);

    const parsed = parseBackup(file({ flexbox: [{ name: "새것", data: DEFAULT_FLEX }] }));
    if (!parsed.ok) throw new Error("expected ok");
    importBackup(parsed.tools, "replace");

    expect(readPresets(flex.key, flex.validate).map((p) => p.name)).toEqual(["새것"]);
    expect(readPresets(blend.key, blend.validate).map((p) => p.name)).toEqual(["남아야 함"]);
  });

  it("같은 파일을 두 번 합쳐도 중복이 생기지 않는다", () => {
    const parsed = parseBackup(file({ flexbox: [{ name: "a", data: DEFAULT_FLEX }] }));
    if (!parsed.ok) throw new Error("expected ok");
    importBackup(parsed.tools, "merge");
    const second = importBackup(parsed.tools, "merge");
    expect(second).toMatchObject({ added: 0, duplicate: 1 });
    expect(readPresets(flex.key, flex.validate)).toHaveLength(1);
  });

  it("저장소가 막혀 있으면 failed로 센다", () => {
    const parsed = parseBackup(file({ flexbox: [{ name: "a", data: DEFAULT_FLEX }] }));
    if (!parsed.ok) throw new Error("expected ok");
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error("blocked");
    };
    try {
      expect(importBackup(parsed.tools, "merge")).toMatchObject({ added: 0, failed: 1 });
    } finally {
      Storage.prototype.setItem = original;
    }
  });
});

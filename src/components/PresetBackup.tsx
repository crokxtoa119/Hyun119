"use client";

import { useState } from "react";
import {
  MAX_BACKUP_CHARS,
  backupFilename,
  countBackup,
  exportAll,
  importBackup,
  parseBackup,
  serializeBackup,
  type ImportMode,
} from "@/lib/presetBackup";

// 한글은 글자당 최대 3바이트라서, 글자 수 상한의 3배를 넘는 파일은 읽지도 않는다
const MAX_FILE_BYTES = MAX_BACKUP_CHARS * 3;

const MODES: { value: ImportMode; label: string; note: string }[] = [
  { value: "merge", label: "합치기", note: "지금 프리셋은 두고, 파일 것을 더합니다. 같은 것은 건너뜁니다." },
  {
    value: "replace",
    label: "덮어쓰기",
    note: "파일에 들어 있는 도구의 프리셋을 파일 내용으로 바꿉니다. 파일에 없는 도구는 그대로입니다.",
  },
];

const buttonClass =
  "rounded-full border border-foreground/20 px-4 py-1.5 text-sm transition-colors hover:border-foreground/50";

/** 프리셋 전체를 JSON 파일로 내려받고, 내려받은 파일로 복원하는 영역. 모두 브라우저 안에서만 처리한다. */
export default function PresetBackup() {
  const [mode, setMode] = useState<ImportMode>("merge");
  const [message, setMessage] = useState("");

  const exportFile = () => {
    const now = new Date();
    const backup = exportAll(now);
    const count = countBackup(backup);
    if (count === 0) {
      setMessage("내려받을 프리셋이 없습니다. 먼저 실험 페이지에서 프리셋을 저장해 보세요.");
      return;
    }
    const url = URL.createObjectURL(
      new Blob([serializeBackup(backup)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = backupFilename(now);
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setMessage(`프리셋 ${count}개를 ${a.download} 파일로 내려받았습니다.`);
  };

  const importFile = async (file: File) => {
    if (file.size > MAX_FILE_BYTES) {
      setMessage("파일이 너무 큽니다.");
      return;
    }
    let text: string;
    try {
      text = await file.text();
    } catch {
      setMessage("파일을 읽지 못했습니다.");
      return;
    }

    const parsed = parseBackup(text);
    if (!parsed.ok) {
      setMessage(parsed.reason);
      return;
    }
    if (
      mode === "replace" &&
      !window.confirm(
        `파일에 들어 있는 ${Object.keys(parsed.tools).length}개 도구의 프리셋을 파일 내용으로 바꿉니다. 지금 저장된 해당 도구의 프리셋은 사라지고 되돌릴 수 없습니다. 계속할까요?`,
      )
    ) {
      setMessage("가져오기를 취소했습니다.");
      return;
    }

    const r = importBackup(parsed.tools, mode);
    const parts = [`프리셋 ${r.added}개를 가져왔습니다.`];
    if (r.duplicate) parts.push(`같은 것 ${r.duplicate}개는 건너뛰었습니다.`);
    if (r.overflow) parts.push(`도구당 12개 한도를 넘어 ${r.overflow}개는 넣지 못했습니다.`);
    if (parsed.skipped) parts.push(`형식이 맞지 않는 ${parsed.skipped}개는 건너뛰었습니다.`);
    if (r.failed) parts.push(`${r.failed}개 도구는 저장하지 못했습니다(브라우저 저장소가 막혀 있을 수 있습니다).`);
    setMessage(parts.join(" "));
  };

  return (
    <section className="flex flex-col gap-3" aria-labelledby="backup-title">
      <div>
        <h3 id="backup-title" className="text-sm font-medium">
          프리셋 백업
        </h3>
        <p className="mt-1 text-xs text-foreground/60">
          저장한 프리셋을 파일로 내려받아 다른 브라우저나 기기에서 복원할 수 있습니다. 파일은 이
          브라우저 안에서만 처리하고 어디로도 보내지 않습니다.
        </p>
      </div>

      <fieldset>
        <legend className="mb-2 text-xs font-medium">가져오기 방식</legend>
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <label
              key={m.value}
              className="cursor-pointer rounded-full border border-foreground/20 px-4 py-1.5 text-sm transition-colors hover:border-foreground/50 has-[:checked]:border-foreground has-[:checked]:bg-foreground has-[:checked]:text-background has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foreground"
            >
              <input
                type="radio"
                name="import-mode"
                value={m.value}
                checked={mode === m.value}
                onChange={() => setMode(m.value)}
                className="sr-only"
              />
              {m.label}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-foreground/60">{MODES.find((m) => m.value === mode)?.note}</p>
      </fieldset>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={exportFile} className={buttonClass}>
          내보내기
        </button>
        <label
          className={`${buttonClass} cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foreground`}
        >
          가져오기
          <input
            type="file"
            accept=".json,application/json"
            className="sr-only"
            onChange={(e) => {
              const file = e.currentTarget.files?.[0];
              // 같은 파일을 다시 골라도 change가 일어나도록 비운다
              e.currentTarget.value = "";
              if (file) void importFile(file);
            }}
          />
        </label>
      </div>

      <p role="status" className="min-h-4 text-xs text-foreground/70">
        {message}
      </p>
    </section>
  );
}

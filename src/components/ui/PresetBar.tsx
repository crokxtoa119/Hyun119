"use client";

import { useState } from "react";
import { MAX_PRESETS, type Preset } from "@/lib/usePresets";

type PresetBarProps<T> = {
  presets: Preset<T>[];
  isFull: boolean;
  onSave: (name: string) => void;
  onLoad: (data: T) => void;
  onRemove: (id: string) => void;
};

/** 현재 설정을 이름 붙여 저장하고, 저장한 프리셋을 눌러 불러오는 영역. */
export default function PresetBar<T>({
  presets,
  isFull,
  onSave,
  onLoad,
  onRemove,
}: PresetBarProps<T>) {
  const [name, setName] = useState("");
  // 화면 읽기 프로그램용 결과 안내(눈에는 보이지 않는다)
  const [status, setStatus] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name);
    setStatus(`프리셋을 저장했습니다. ${name.trim() ? `이름: ${name.trim()}` : ""}`);
    setName("");
  };

  return (
    <div>
      <p className="mb-2 text-sm font-medium">
        프리셋{" "}
        <span className="font-mono text-xs text-foreground/60">
          {presets.length}/{MAX_PRESETS}
        </span>
      </p>

      <form onSubmit={submit} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          placeholder="이름 (비워두면 자동)"
          aria-label="프리셋 이름"
          className="min-w-0 flex-1 rounded-lg border border-foreground/20 bg-transparent px-3 py-1.5 text-sm placeholder:text-foreground/60 focus-visible:outline-2 focus-visible:outline-foreground"
        />
        <button
          type="submit"
          disabled={isFull}
          className="shrink-0 rounded-lg border border-foreground/20 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-foreground/5 disabled:opacity-40"
        >
          저장
        </button>
      </form>
      {isFull && (
        <p className="mt-2 text-xs text-foreground/60">
          프리셋은 최대 {MAX_PRESETS}개까지 저장할 수 있습니다. 하나를 삭제하면 다시 저장할 수 있어요.
        </p>
      )}

      {presets.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {presets.map((p) => (
            <li
              key={p.id}
              className="flex items-center overflow-hidden rounded-full border border-foreground/20 text-sm"
            >
              <button
                type="button"
                onClick={() => {
                  onLoad(p.data);
                  setStatus(`프리셋 ${p.name}을(를) 불러왔습니다.`);
                }}
                className="px-3 py-1 transition-colors hover:bg-foreground/5"
              >
                {p.name}
              </button>
              <button
                type="button"
                onClick={() => {
                  onRemove(p.id);
                  setStatus(`프리셋 ${p.name}을(를) 삭제했습니다.`);
                }}
                aria-label={`${p.name} 삭제`}
                className="border-l border-foreground/20 px-2 py-1 text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-foreground/60">
          저장한 프리셋이 없습니다. 이 브라우저에만 저장됩니다.
        </p>
      )}

      <p role="status" className="sr-only">
        {status}
      </p>
    </div>
  );
}

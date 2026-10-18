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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name);
    setName("");
  };

  return (
    <div>
      <p className="mb-2 text-sm font-medium">
        프리셋{" "}
        <span className="font-mono text-xs text-foreground/50">
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
          className="min-w-0 flex-1 rounded-lg border border-foreground/20 bg-transparent px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-foreground/50"
        />
        <button
          type="submit"
          disabled={isFull}
          className="shrink-0 rounded-lg border border-foreground/20 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-foreground/5 disabled:opacity-40"
        >
          저장
        </button>
      </form>

      {presets.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {presets.map((p) => (
            <li
              key={p.id}
              className="flex items-center overflow-hidden rounded-full border border-foreground/20 text-sm"
            >
              <button
                type="button"
                onClick={() => onLoad(p.data)}
                className="px-3 py-1 transition-colors hover:bg-foreground/5"
              >
                {p.name}
              </button>
              <button
                type="button"
                onClick={() => onRemove(p.id)}
                aria-label={`${p.name} 삭제`}
                className="border-l border-foreground/20 px-2 py-1 text-foreground/50 transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-foreground/50">
          저장한 프리셋이 없습니다. 이 브라우저에만 저장됩니다.
        </p>
      )}
    </div>
  );
}

"use client";

import { useCopy } from "@/lib/useCopy";

type CodeBlockProps = {
  title: string;
  code: string;
  copyLabel?: string;
};

/** 제목 + 복사 버튼이 달린 코드 출력 영역. */
export default function CodeBlock({ title, code, copyLabel = "복사" }: CodeBlockProps) {
  const { copied, copy } = useCopy();

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium">{title}</p>
        <button
          type="button"
          onClick={() => copy(code)}
          className="text-xs text-foreground/60 underline hover:text-foreground"
        >
          {copied === code ? "Copied!" : copyLabel}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-xl bg-foreground/5 p-4 font-mono text-xs leading-relaxed">
        {code}
      </pre>
    </div>
  );
}

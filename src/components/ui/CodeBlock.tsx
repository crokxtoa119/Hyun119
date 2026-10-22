"use client";

import { useState } from "react";
import { codeFilename, downloadText, type CodeExt } from "@/lib/download";
import { haptic } from "@/lib/haptics";
import { useCopy } from "@/lib/useCopy";

type CodeBlockProps = {
  title: string;
  code: string;
  copyLabel?: string;
  /** 주면 "저장" 버튼이 생기고, `<name>-날짜.<ext>` 파일로 내려받는다. */
  file?: { name: string; ext: CodeExt };
};

const linkButton = "-my-1.5 px-1 py-1.5 text-xs text-foreground/60 underline hover:text-foreground";

/** 제목 + 복사(·저장) 버튼이 달린 코드 출력 영역. */
export default function CodeBlock({ title, code, copyLabel = "복사", file }: CodeBlockProps) {
  const { copied, copy } = useCopy();
  const [saved, setSaved] = useState("");

  const save = () => {
    if (!file) return;
    const filename = codeFilename(file.name, file.ext, new Date());
    downloadText(filename, code, file.ext);
    haptic("success");
    setSaved(`${filename} 파일로 저장했습니다.`);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium">{title}</p>
        <div className="flex items-center gap-3">
          {file && (
            <button type="button" onClick={save} className={linkButton}>
              저장
            </button>
          )}
          <button type="button" onClick={() => copy(code)} className={linkButton}>
            {copied === code ? "Copied!" : copyLabel}
          </button>
        </div>
        <span role="status" className="sr-only">
          {copied === code ? "클립보드에 복사했습니다." : saved}
        </span>
      </div>
      {/* 긴 줄은 가로로 스크롤되므로 키보드 사용자도 포커스를 줘서 방향키로 읽을 수 있게 한다 */}
      <pre
        tabIndex={0}
        role="region"
        aria-label={title.endsWith("코드") ? title : `${title} 코드`}
        className="overflow-x-auto rounded-xl bg-foreground/5 p-4 font-mono text-xs leading-relaxed"
      >
        {code}
      </pre>
    </div>
  );
}

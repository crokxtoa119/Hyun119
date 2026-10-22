"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { haptic } from "@/lib/haptics";

/** 클립보드 복사 + 잠깐 동안 "복사됨" 상태를 돌려주는 훅. copied는 마지막으로 복사한 텍스트. */
export function useCopy(resetMs = 1200) {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(text);
        haptic("success");
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(null), resetMs);
      } catch {
        // 클립보드 권한이 없는 환경에서는 조용히 무시
      }
    },
    [resetMs],
  );

  return { copied, copy };
}

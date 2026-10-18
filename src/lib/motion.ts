"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/** 이벤트 핸들러 안에서 쓰는 즉시 확인용. 사용자가 "움직임 줄이기"를 켰는지 알려준다. */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(QUERY).matches;
}

/** 렌더에서 쓰는 반응형 버전. 서버 렌더링 때는 false라 hydration 불일치가 없다. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia(QUERY);
      mq.addEventListener("change", callback);
      return () => mq.removeEventListener("change", callback);
    },
    prefersReducedMotion,
    () => false,
  );
}

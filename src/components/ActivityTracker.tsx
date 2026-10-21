"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackVisit } from "@/lib/activity";
import { EXPERIMENTS } from "@/lib/experiments";

/** 도구 페이지로 들어올 때마다 이 브라우저에만 방문 기록을 남긴다. 화면에는 아무것도 그리지 않는다. */
export default function ActivityTracker() {
  const pathname = usePathname();
  // 개발 모드에서 효과가 두 번 돌아도 한 번만 센다
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (last.current === pathname) return;
    last.current = pathname;
    const tool = EXPERIMENTS.find((e) => e.href === pathname);
    if (tool) trackVisit(tool.slug);
  }, [pathname]);

  return null;
}

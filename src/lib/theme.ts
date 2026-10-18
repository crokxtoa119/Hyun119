"use client";

import { useSyncExternalStore } from "react";
import { prefersReducedMotion } from "./motion";
import { readTransitionsEnabled } from "./settings";

export type Theme = "system" | "light" | "dark";

export const THEMES: { value: Theme; label: string }[] = [
  { value: "system", label: "Auto" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const KEY = "theme";
const REVEAL_MS = 500;
const listeners = new Set<() => void>();

export type ThemeOrigin = { x: number; y: number };

export function readTheme(): Theme {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function commit(theme: Theme) {
  try {
    if (theme === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, theme);
  } catch {
    // 저장이 막힌 환경에서는 이번 방문 동안만 적용된다
  }
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
  listeners.forEach((l) => l());
}

/**
 * 테마를 바로 화면에 적용하고 localStorage에 저장한다. Auto는 저장값을 지워 시스템 설정을 따른다.
 * origin(보통 누른 버튼의 중심)을 주면, View Transitions를 지원하는 브라우저에서 그 지점에서
 * 새 테마가 원형으로 퍼져 나간다. 지원하지 않거나 "움직임 줄이기"가 켜져 있거나 설정에서
 * 전환 효과를 껐으면 효과 없이 바로 바뀐다.
 */
export function setTheme(theme: Theme, origin?: ThemeOrigin) {
  if (
    typeof document.startViewTransition !== "function" ||
    prefersReducedMotion() ||
    !readTransitionsEnabled()
  ) {
    commit(theme);
    return;
  }

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? window.innerHeight / 2;
  // 클릭 지점에서 가장 먼 화면 모서리까지 닿는 반지름
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  const transition = document.startViewTransition(() => commit(theme));
  transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        {
          duration: REVEAL_MS,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    // 전환이 건너뛰어져도(탭 전환 등) 테마는 이미 적용된다
    .catch(() => {});
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, readTheme, () => "system" as Theme);
}

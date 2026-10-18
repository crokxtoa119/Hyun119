"use client";

import { useSyncExternalStore } from "react";

type Theme = "system" | "light" | "dark";

const KEY = "theme";
const ORDER: Theme[] = ["system", "light", "dark"];
const LABEL: Record<Theme, string> = { system: "Auto", light: "Light", dark: "Dark" };

const listeners = new Set<() => void>();

function read(): Theme {
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

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

/** Auto(시스템) → Light → Dark 순으로 바꾸는 테마 토글. 선택은 localStorage에 저장된다. */
export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, read, () => "system" as Theme);

  const cycle = () => {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    try {
      if (next === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    } catch {
      // 저장이 막힌 환경에서는 이번 방문 동안만 적용된다
    }
    apply(next);
    listeners.forEach((l) => l());
  };

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`테마: ${LABEL[theme]} (눌러서 변경)`}
      className="rounded-full border border-foreground/20 px-3 py-1 font-mono text-xs transition-colors hover:border-foreground/50"
    >
      {LABEL[theme]}
    </button>
  );
}

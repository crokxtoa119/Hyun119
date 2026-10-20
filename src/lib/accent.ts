"use client";

import { useSyncExternalStore } from "react";
import { isAccentId, type AccentId } from "./accentPalette";

const KEY = "sc-accent";
const listeners = new Set<() => void>();

export function readAccent(): AccentId {
  try {
    const v = localStorage.getItem(KEY);
    return isAccentId(v) ? v : "default";
  } catch {
    return "default";
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

/** 강조 컬러를 바로 화면에 적용하고 저장한다. default는 저장값을 지운다. */
export function setAccent(id: AccentId) {
  try {
    if (id === "default") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, id);
  } catch {
    // 저장이 막힌 환경에서는 이번 방문 동안만 적용된다
  }
  const root = document.documentElement;
  if (id === "default") root.removeAttribute("data-accent");
  else root.setAttribute("data-accent", id);
  listeners.forEach((l) => l());
}

export function useAccent(): AccentId {
  return useSyncExternalStore(subscribe, readAccent, () => "default" as AccentId);
}

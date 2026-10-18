"use client";

import { useSyncExternalStore } from "react";

const TRANSITIONS_KEY = "sc-transitions";
const listeners = new Set<() => void>();

/** 페이지 전환 효과가 켜져 있는지. 저장된 값이 없으면 켜짐(기본값)이다. */
export function readTransitionsEnabled(): boolean {
  try {
    return localStorage.getItem(TRANSITIONS_KEY) !== "off";
  } catch {
    return true;
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

export function setTransitionsEnabled(on: boolean) {
  try {
    if (on) localStorage.removeItem(TRANSITIONS_KEY);
    else localStorage.setItem(TRANSITIONS_KEY, "off");
  } catch {
    // 저장이 막힌 환경에서는 설정이 유지되지 않는다
    return;
  }
  listeners.forEach((l) => l());
}

export function useTransitionsEnabled(): boolean {
  return useSyncExternalStore(subscribe, readTransitionsEnabled, () => true);
}

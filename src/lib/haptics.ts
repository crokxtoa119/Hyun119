"use client";

import { useSyncExternalStore } from "react";

const HAPTICS_KEY = "sc-haptics";
const listeners = new Set<() => void>();

/** 진동 패턴(ms). 번갈아 진동, 쉼, 진동 순서다. */
const PATTERNS = {
  light: 10,
  success: [10, 40, 10],
  warn: 30,
} as const;

export type HapticKind = keyof typeof PATTERNS;

/** 이 기기가 Vibration API를 지원하는지. iPhone의 Safari와 데스크톱은 지원하지 않는다. */
export function hapticsSupported(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

/** 햅틱 피드백이 켜져 있는지. 저장된 값이 없으면 켜짐(기본값)이다. */
export function readHapticsEnabled(): boolean {
  try {
    return localStorage.getItem(HAPTICS_KEY) !== "off";
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

export function setHapticsEnabled(on: boolean) {
  try {
    if (on) localStorage.removeItem(HAPTICS_KEY);
    else localStorage.setItem(HAPTICS_KEY, "off");
  } catch {
    // 저장이 막힌 환경에서는 설정이 유지되지 않는다
    return;
  }
  listeners.forEach((l) => l());
}

export function useHapticsEnabled(): boolean {
  return useSyncExternalStore(subscribe, readHapticsEnabled, () => true);
}

/** 설정 화면에서 지원 여부를 안내할 때 쓴다. 서버 렌더링에서는 지원하는 것으로 본다. */
export function useHapticsSupported(): boolean {
  return useSyncExternalStore(
    () => () => {},
    hapticsSupported,
    () => true,
  );
}

/**
 * 짧게 진동한다. 지원하지 않는 기기, 설정에서 끈 경우, "움직임 줄이기"가 켜진 경우에는 아무 일도 하지 않는다.
 * 사용자의 동작에 대한 응답으로만 부르고, 슬라이더처럼 연속으로 바뀌는 곳에서는 부르지 않는다.
 */
export function haptic(kind: HapticKind = "light") {
  if (!hapticsSupported() || !readHapticsEnabled()) return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  try {
    navigator.vibrate(PATTERNS[kind] as number | number[]);
  } catch {
    // 브라우저 정책으로 막히면 조용히 넘어간다
  }
}

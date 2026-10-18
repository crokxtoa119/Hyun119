"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Preset<T> = { id: string; name: string; data: T };

export const MAX_PRESETS = 12;

/** 프리셋 validate 함수에서 쓰는 작은 타입 확인 도우미 */
export const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export const isFiniteNumber = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);

const EMPTY: never[] = [];
const listeners = new Set<() => void>();

// useSyncExternalStore는 값이 같으면 같은 참조를 돌려줘야 하므로 원문 문자열 기준으로 캐시한다
const cache = new Map<string, { raw: string | null; value: Preset<unknown>[] }>();

function parse(raw: string | null, validate: (d: unknown) => boolean): Preset<unknown>[] {
  if (!raw) return EMPTY;
  try {
    const arr: unknown = JSON.parse(raw);
    if (!Array.isArray(arr)) return EMPTY;
    return arr
      .filter(
        (p): p is Preset<unknown> =>
          !!p &&
          typeof p.id === "string" &&
          typeof p.name === "string" &&
          validate(p.data),
      )
      .slice(0, MAX_PRESETS);
  } catch {
    return EMPTY;
  }
}

function snapshot(key: string, validate: (d: unknown) => boolean): Preset<unknown>[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    // 저장소 접근이 막힌 환경에서는 빈 목록으로 동작한다
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value;
  const value = parse(raw, validate);
  cache.set(key, { raw, value });
  return value;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

/** 해당 키에 저장된 프리셋을 모두 지운다. 같은 키를 쓰는 usePresets 훅도 함께 갱신된다. */
export function clearPresets(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    return;
  }
  listeners.forEach((l) => l());
}

function readCount(key: string): number {
  try {
    const arr: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(arr) ? Math.min(arr.length, MAX_PRESETS) : 0;
  } catch {
    return 0;
  }
}

/** 저장된 프리셋 개수(설정 화면용). 항목 형식은 검사하지 않고 배열 길이만 센다. */
export function usePresetCount(key: string): number {
  return useSyncExternalStore(
    subscribe,
    () => readCount(key),
    () => 0,
  );
}

/**
 * localStorage에 프리셋 목록을 저장하는 훅.
 * validate는 저장된 값이 손상됐거나 옛 형식일 때 걸러내는 타입 가드다.
 */
export function usePresets<T>(key: string, validate: (d: unknown) => d is T) {
  const presets = useSyncExternalStore(
    subscribe,
    () => snapshot(key, validate),
    () => EMPTY,
  ) as Preset<T>[];

  const write = useCallback(
    (next: Preset<T>[]) => {
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // 저장 실패(용량 초과, 차단)는 조용히 무시한다
        return;
      }
      listeners.forEach((l) => l());
    },
    [key],
  );

  const save = useCallback(
    (name: string, data: T) => {
      if (presets.length >= MAX_PRESETS) return false;
      const nextId = String(Math.max(0, ...presets.map((p) => Number(p.id) || 0)) + 1);
      write([...presets, { id: nextId, name: name.trim() || `프리셋 ${nextId}`, data }]);
      return true;
    },
    [presets, write],
  );

  const remove = useCallback(
    (id: string) => write(presets.filter((p) => p.id !== id)),
    [presets, write],
  );

  return { presets, save, remove, isFull: presets.length >= MAX_PRESETS };
}

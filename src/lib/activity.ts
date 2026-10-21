"use client";

import { useSyncExternalStore } from "react";
import { localDateStamp } from "./download";
import { EMPTY_ACTIVITY, recordVisit, sanitizeActivity, type Activity } from "./activityLog";

export const ACTIVITY_KEY = "sc-activity";

const listeners = new Set<() => void>();

// useSyncExternalStore는 값이 같으면 같은 참조를 돌려줘야 하므로 원문 문자열 기준으로 캐시한다
let cache: { raw: string | null; value: Activity } | null = null;

function snapshot(): Activity {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(ACTIVITY_KEY);
  } catch {
    // 저장소 접근이 막힌 환경에서는 기록이 없는 것으로 동작한다
  }
  if (cache && cache.raw === raw) return cache.value;
  let value = EMPTY_ACTIVITY;
  if (raw) {
    try {
      value = sanitizeActivity(JSON.parse(raw));
    } catch {
      value = EMPTY_ACTIVITY;
    }
  }
  cache = { raw, value };
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

/** 도구 페이지를 연 것을 기록한다. 저장이 막혀 있으면 조용히 건너뛴다. */
export function trackVisit(slug: string, now: Date = new Date()) {
  try {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(recordVisit(snapshot(), slug, now)));
  } catch {
    return;
  }
  listeners.forEach((l) => l());
}

/** 기록을 모두 지운다. */
export function clearActivity() {
  try {
    localStorage.removeItem(ACTIVITY_KEY);
  } catch {
    return;
  }
  listeners.forEach((l) => l());
}

export function useActivity(): Activity {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY_ACTIVITY);
}

const noopSubscribe = () => () => {};

/**
 * 오늘 날짜("YYYY-MM-DD"). 서버 렌더링 중에는 현재 시각을 읽지 않도록 빈 문자열을 돌려주고,
 * 브라우저에서만 실제 날짜가 된다.
 */
export function useToday(): string {
  return useSyncExternalStore(noopSubscribe, () => localDateStamp(new Date()), () => "");
}

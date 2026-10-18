"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const PREFIX = "#share=";
// 주소창에 붙는 값이라 너무 긴 데이터는 읽지 않는다
const MAX_ENCODED_LENGTH = 4000;

/** 객체를 JSON → UTF-8 → base64url 문자열로 바꾼다. */
export function encodeShare(data: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** encodeShare의 반대. 형식이 틀리거나 너무 길면 null. */
export function decodeShare(encoded: string): unknown {
  if (!encoded || encoded.length > MAX_ENCODED_LENGTH) return null;
  try {
    const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

export function buildShareUrl(data: unknown): string {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}${PREFIX}${encodeShare(data)}`;
}

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("hashchange", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("hashchange", callback);
  };
}

/**
 * 주소의 #share= 값을 읽어 validate를 통과한 데이터만 돌려준다.
 * 서버 렌더링 때는 항상 null이라 hydration 불일치가 생기지 않는다.
 */
export function useSharedData<T>(validate: (d: unknown) => d is T) {
  const hash = useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => "",
  );

  const shared = useMemo<T | null>(() => {
    if (!hash.startsWith(PREFIX)) return null;
    const data = decodeShare(hash.slice(PREFIX.length));
    return validate(data) ? data : null;
  }, [hash, validate]);

  const dismiss = useCallback(() => {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    listeners.forEach((l) => l());
  }, []);

  return { shared, dismiss };
}

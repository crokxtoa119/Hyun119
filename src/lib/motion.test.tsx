import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { prefersReducedMotion, useReducedMotion } from "@/lib/motion";

// jsdom에는 matchMedia가 없어서, 값을 바꾸고 변경 이벤트를 보낼 수 있는 가짜를 만든다
function installMatchMedia(initial: boolean) {
  let matches = initial;
  const listeners = new Set<() => void>();
  window.matchMedia = ((query: string) => ({
    get matches() {
      return matches;
    },
    media: query,
    addEventListener: (_: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
  })) as unknown as typeof window.matchMedia;

  return {
    set(next: boolean) {
      matches = next;
      listeners.forEach((l) => l());
    },
    listenerCount: () => listeners.size,
  };
}

const original = window.matchMedia;
afterEach(() => {
  window.matchMedia = original;
});

describe("prefersReducedMotion", () => {
  it("움직임 줄이기가 꺼져 있으면 false", () => {
    installMatchMedia(false);
    expect(prefersReducedMotion()).toBe(false);
  });

  it("켜져 있으면 true", () => {
    installMatchMedia(true);
    expect(prefersReducedMotion()).toBe(true);
  });
});

describe("useReducedMotion", () => {
  let media: ReturnType<typeof installMatchMedia>;
  beforeEach(() => {
    media = installMatchMedia(false);
  });

  it("현재 설정을 돌려준다", () => {
    media.set(true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it("실행 중에 설정이 바뀌면 따라간다", () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    act(() => media.set(true));
    expect(result.current).toBe(true);

    act(() => media.set(false));
    expect(result.current).toBe(false);
  });

  it("언마운트하면 이벤트 리스너를 정리한다", () => {
    const { unmount } = renderHook(() => useReducedMotion());
    expect(media.listenerCount()).toBeGreaterThan(0);
    unmount();
    expect(media.listenerCount()).toBe(0);
  });
});

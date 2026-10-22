import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  haptic,
  hapticsSupported,
  readHapticsEnabled,
  setHapticsEnabled,
  useHapticsEnabled,
} from "./haptics";

let vibrate: ReturnType<typeof vi.fn>;
let reduced = false;

beforeEach(() => {
  localStorage.clear();
  vibrate = vi.fn(() => true);
  Object.defineProperty(navigator, "vibrate", { value: vibrate, configurable: true });
  reduced = false;
  window.matchMedia = ((q: string) => ({
    matches: reduced && q.includes("prefers-reduced-motion"),
  })) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  // @ts-expect-error 테스트에서 넣은 속성을 지운다
  delete navigator.vibrate;
});

describe("haptic", () => {
  it("종류에 맞는 패턴으로 진동한다", () => {
    haptic("light");
    haptic("success");
    haptic("warn");
    expect(vibrate.mock.calls).toEqual([[10], [[10, 40, 10]], [30]]);
  });

  it("종류를 주지 않으면 light다", () => {
    haptic();
    expect(vibrate).toHaveBeenCalledWith(10);
  });

  it("설정에서 끄면 진동하지 않고, 다시 켜면 진동한다", () => {
    setHapticsEnabled(false);
    haptic();
    expect(vibrate).not.toHaveBeenCalled();
    setHapticsEnabled(true);
    haptic();
    expect(vibrate).toHaveBeenCalledTimes(1);
  });

  it("움직임 줄이기가 켜져 있으면 진동하지 않는다", () => {
    reduced = true;
    haptic("success");
    expect(vibrate).not.toHaveBeenCalled();
  });

  it("지원하지 않는 기기에서는 오류 없이 아무것도 하지 않는다", () => {
    // @ts-expect-error 지원하지 않는 환경을 흉내 낸다
    delete navigator.vibrate;
    expect(hapticsSupported()).toBe(false);
    expect(() => haptic("success")).not.toThrow();
  });

  it("브라우저가 진동을 막아 예외를 던져도 조용히 넘어간다", () => {
    vibrate.mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => haptic()).not.toThrow();
  });
});

describe("햅틱 설정", () => {
  it("저장된 값이 없으면 켜짐이고, 끄면 저장된다", () => {
    expect(readHapticsEnabled()).toBe(true);
    setHapticsEnabled(false);
    expect(localStorage.getItem("sc-haptics")).toBe("off");
    expect(readHapticsEnabled()).toBe(false);
    setHapticsEnabled(true);
    expect(localStorage.getItem("sc-haptics")).toBeNull();
  });

  it("훅은 설정이 바뀌면 따라간다", () => {
    const { result } = renderHook(() => useHapticsEnabled());
    expect(result.current).toBe(true);
    act(() => setHapticsEnabled(false));
    expect(result.current).toBe(false);
  });
});

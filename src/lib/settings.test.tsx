import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { readTransitionsEnabled, setTransitionsEnabled, useTransitionsEnabled } from "./settings";
import { readTheme, setTheme, useTheme } from "./theme";
import { clearPresets, usePresetCount } from "./usePresets";

afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  vi.restoreAllMocks();
});

describe("페이지 전환 설정", () => {
  it("저장값이 없으면 켜짐이고, 끄면 'off'를 저장한다", () => {
    expect(readTransitionsEnabled()).toBe(true);
    setTransitionsEnabled(false);
    expect(localStorage.getItem("sc-transitions")).toBe("off");
    expect(readTransitionsEnabled()).toBe(false);
    setTransitionsEnabled(true);
    expect(localStorage.getItem("sc-transitions")).toBeNull();
  });

  it("훅이 변경에 반응한다", () => {
    const { result } = renderHook(() => useTransitionsEnabled());
    expect(result.current).toBe(true);
    act(() => setTransitionsEnabled(false));
    expect(result.current).toBe(false);
  });

  it("localStorage가 막혀도 던지지 않고 켜짐으로 읽는다", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(readTransitionsEnabled()).toBe(true);
  });
});

describe("테마", () => {
  it("light/dark는 저장하고 data-theme을 적용한다", () => {
    setTheme("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(readTheme()).toBe("dark");
  });

  it("Auto는 저장값과 data-theme을 지운다", () => {
    setTheme("light");
    setTheme("system");
    expect(localStorage.getItem("theme")).toBeNull();
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
    expect(readTheme()).toBe("system");
  });

  it("알 수 없는 저장값은 Auto로 취급하고, 훅이 변경에 반응한다", () => {
    localStorage.setItem("theme", "purple");
    const { result } = renderHook(() => useTheme());
    expect(result.current).toBe("system");
    act(() => setTheme("dark"));
    expect(result.current).toBe("dark");
  });
});

describe("프리셋 개수와 전체 삭제", () => {
  it("배열 길이를 세고 손상된 값은 0으로 본다", () => {
    localStorage.setItem("k", JSON.stringify([{}, {}, {}]));
    const { result } = renderHook(() => usePresetCount("k"));
    expect(result.current).toBe(3);
    act(() => {
      localStorage.setItem("k", "{broken");
      window.dispatchEvent(new Event("storage"));
    });
    expect(result.current).toBe(0);
  });

  it("clearPresets가 키를 지우고 훅을 갱신한다", () => {
    localStorage.setItem("k", JSON.stringify([{}, {}]));
    localStorage.setItem("other", JSON.stringify([{}]));
    const { result } = renderHook(() => usePresetCount("k"));
    expect(result.current).toBe(2);
    act(() => clearPresets("k"));
    expect(result.current).toBe(0);
    expect(localStorage.getItem("k")).toBeNull();
    expect(localStorage.getItem("other")).not.toBeNull();
  });
});

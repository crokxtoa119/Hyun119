import { describe, expect, it } from "vitest";
import {
  DEFAULT_FLUID,
  FLUID_LIMITS,
  clampFluid,
  fluidSizeAt,
  fluidToCss,
  fluidValue,
  intercept,
  isFluidState,
  slope,
} from "./fluidType";

describe("slope / intercept", () => {
  it("두 점(최소 너비, 최소 크기)·(최대 너비, 최대 크기)를 지나는 직선이다", () => {
    const s = DEFAULT_FLUID;
    expect(intercept(s) + slope(s) * s.minVw).toBeCloseTo(s.minSize, 10);
    expect(intercept(s) + slope(s) * s.maxVw).toBeCloseTo(s.maxSize, 10);
  });
});

describe("fluidValue / fluidToCss", () => {
  it("알려진 값: 16→24px, 320→1200px", () => {
    expect(fluidValue(DEFAULT_FLUID)).toBe("clamp(1rem, 0.8182rem + 0.9091vw, 1.5rem)");
    expect(fluidToCss(DEFAULT_FLUID)).toBe("font-size: clamp(1rem, 0.8182rem + 0.9091vw, 1.5rem);");
  });

  it("절편이 음수여도 올바른 식을 만든다", () => {
    // 16→64px, 320→640px: 기울기 0.15, 절편 16 - 48 = -32px = -2rem
    expect(fluidValue({ minSize: 16, maxSize: 64, minVw: 320, maxVw: 640 })).toBe(
      "clamp(1rem, -2rem + 15vw, 4rem)",
    );
  });

  it("최소와 최대 크기가 같으면 고정 크기다", () => {
    expect(fluidValue({ ...DEFAULT_FLUID, minSize: 20, maxSize: 20 })).toBe("1.25rem");
  });
});

describe("fluidSizeAt", () => {
  it("범위 밖에서는 최소·최대 크기로 멈추고 안에서는 비례한다", () => {
    const s = DEFAULT_FLUID;
    expect(fluidSizeAt(s, 100)).toBe(16);
    expect(fluidSizeAt(s, 320)).toBeCloseTo(16, 10);
    expect(fluidSizeAt(s, 760)).toBeCloseTo(20, 10);
    expect(fluidSizeAt(s, 1200)).toBeCloseTo(24, 10);
    expect(fluidSizeAt(s, 2000)).toBe(24);
  });
});

describe("clampFluid", () => {
  it("범위 밖의 값은 한도로, 소수는 반올림한다", () => {
    const r = clampFluid({ minSize: 1, maxSize: 1000, minVw: 10, maxVw: 99999 });
    expect(r.minSize).toBe(FLUID_LIMITS.minSize.min);
    expect(r.maxSize).toBe(FLUID_LIMITS.maxSize.max);
    expect(r.minVw).toBe(FLUID_LIMITS.minVw.min);
    expect(r.maxVw).toBe(FLUID_LIMITS.maxVw.max);
    expect(clampFluid({ ...DEFAULT_FLUID, minSize: 16.6 }).minSize).toBe(17);
  });

  it("최대 크기는 최소 크기보다 작아지지 않는다", () => {
    expect(clampFluid({ ...DEFAULT_FLUID, minSize: 30, maxSize: 20 })).toMatchObject({
      minSize: 30,
      maxSize: 30,
    });
  });

  it("최대 너비는 최소 너비보다 커야 한다", () => {
    const r = clampFluid({ ...DEFAULT_FLUID, minVw: 1000, maxVw: 500 });
    expect(r.maxVw).toBe(1001);
    expect(Number.isFinite(slope(r))).toBe(true);
  });

  it("기본값은 그대로 통과한다", () => {
    expect(clampFluid(DEFAULT_FLUID)).toEqual(DEFAULT_FLUID);
  });
});

describe("isFluidState", () => {
  it("올바른 값을 받아들이고 이상한 값을 거부한다", () => {
    expect(isFluidState(DEFAULT_FLUID)).toBe(true);
    expect(isFluidState(null)).toBe(false);
    expect(isFluidState({})).toBe(false);
    expect(isFluidState({ ...DEFAULT_FLUID, maxVw: "1200" })).toBe(false);
    expect(isFluidState({ ...DEFAULT_FLUID, minSize: NaN })).toBe(false);
  });
});

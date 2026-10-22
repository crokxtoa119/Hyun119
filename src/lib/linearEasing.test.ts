import { describe, expect, it } from "vitest";
import {
  DEFAULT_EASING,
  EASING_LIMITS,
  clampEasing,
  curveAt,
  isLinearEasingState,
  linearEasingToCss,
  linearValue,
  sampleEasing,
  type LinearEasingState,
} from "./linearEasing";

const easing = (patch: Partial<LinearEasingState> = {}): LinearEasingState => ({
  ...DEFAULT_EASING,
  ...patch,
});

describe("clampEasing", () => {
  it("기본값은 그대로 둔다", () => {
    expect(clampEasing(DEFAULT_EASING)).toEqual(DEFAULT_EASING);
  });

  it("각 값을 범위 안으로 맞추고 재생 시간은 0.1초 단위로 맞춘다", () => {
    const r = clampEasing(easing({ count: 99, damping: -5, points: 1000, duration: 0.84 }));
    expect(r.count).toBe(EASING_LIMITS.count.max);
    expect(r.damping).toBe(EASING_LIMITS.damping.min);
    expect(r.points).toBe(EASING_LIMITS.points.max);
    expect(r.duration).toBe(0.8);
    expect(clampEasing(easing({ duration: 99 })).duration).toBe(2);
  });

  it("알 수 없는 곡선은 기본값으로 되돌린다", () => {
    expect(clampEasing({ ...DEFAULT_EASING, curve: "wobble" } as unknown as LinearEasingState).curve).toBe(
      "bounce",
    );
  });
});

describe("curveAt", () => {
  it("모든 곡선이 0에서 시작해 1에서 끝난다", () => {
    for (const curve of ["bounce", "spring"] as const) {
      for (const count of [1, 3, 6]) {
        for (const damping of [0, 50, 100]) {
          const s = easing({ curve, count, damping });
          expect(curveAt(s, 0)).toBeCloseTo(0, 9);
          expect(curveAt(s, 1)).toBeCloseTo(1, 9);
        }
      }
    }
  });

  it("범위 밖 진행도는 0~1로 제한한다", () => {
    expect(curveAt(DEFAULT_EASING, -1)).toBeCloseTo(0, 9);
    expect(curveAt(DEFAULT_EASING, 5)).toBeCloseTo(1, 9);
  });

  it("바운스는 1을 넘지 않고, 처음 낙하는 시간의 제곱으로 늘어난다", () => {
    const s = easing({ curve: "bounce" });
    for (let i = 0; i <= 200; i++) expect(curveAt(s, i / 200)).toBeLessThanOrEqual(1 + 1e-9);
    // 첫 낙하는 전체 시간의 1/total 동안이며, 그 안에서는 tau^2다
    const e = 0.8 - 0.25;
    const total = 1 + 2 * (e + e ** 2 + e ** 3);
    expect(curveAt(s, 0.5 / total)).toBeCloseTo(0.25, 9);
    expect(curveAt(s, 1 / total)).toBeCloseTo(1, 9);
  });

  it("바운스는 튄 횟수만큼 바닥(1)에 닿는다", () => {
    const s = easing({ curve: "bounce", count: 3, damping: 50 });
    const e = 0.55;
    const total = 1 + 2 * (e + e ** 2 + e ** 3);
    // 첫 낙하 끝, 첫 튐 끝, 둘째 튐 끝, 셋째(마지막) 튐 끝
    const ends = [1, 1 + 2 * e, 1 + 2 * (e + e ** 2), total];
    for (const tau of ends) expect(curveAt(s, tau / total)).toBeCloseTo(1, 9);
  });

  it("스프링은 1을 넘었다가 돌아온다", () => {
    const s = easing({ curve: "spring", count: 2, damping: 0 });
    const peak = Math.max(...Array.from({ length: 201 }, (_, i) => curveAt(s, i / 200)));
    expect(peak).toBeGreaterThan(1.1);
  });

  it("감쇠가 클수록 스프링의 넘침이 작다", () => {
    const peak = (damping: number) =>
      Math.max(...Array.from({ length: 401 }, (_, i) => curveAt(easing({ curve: "spring", count: 3, damping }), i / 400)));
    expect(peak(100)).toBeLessThan(peak(0));
  });
});

describe("sampleEasing / linearValue", () => {
  it("점 개수만큼 뽑고 처음은 0, 끝은 1이다", () => {
    for (const points of [8, 32, 64]) {
      const v = sampleEasing(easing({ points }));
      expect(v).toHaveLength(points);
      expect(v[0]).toBe(0);
      expect(v[points - 1]).toBe(1);
    }
  });

  it("알려진 값: 점 8개의 바운스(손으로 계산해 확인한 값)", () => {
    // 반발 0.55, 전체 길이 3.03775. t=1/7이면 tau=0.434이고 첫 낙하라 tau^2=0.188이다
    expect(linearValue(easing({ points: 8 }))).toBe(
      "linear(0, 0.188, 0.753, 0.759, 0.732, 0.963, 0.949, 1)",
    );
  });

  it("음수 0이나 지수 표기가 나오지 않는다", () => {
    for (const curve of ["bounce", "spring"] as const) {
      expect(linearValue(easing({ curve, points: 64 }))).not.toMatch(/-0(?![.\d])|e[-+]/);
    }
  });
});

describe("linearEasingToCss", () => {
  it("transition 한 줄로 코드를 만든다", () => {
    const css = linearEasingToCss(easing({ points: 8, duration: 1.2 }));
    expect(css).toBe(
      ".box {\n  transition: transform 1.2s linear(0, 0.188, 0.753, 0.759, 0.732, 0.963, 0.949, 1);\n}",
    );
  });
});

describe("isLinearEasingState", () => {
  it("올바른 값만 통과시킨다", () => {
    expect(isLinearEasingState(DEFAULT_EASING)).toBe(true);
    expect(isLinearEasingState({ ...DEFAULT_EASING, curve: "wobble" })).toBe(false);
    expect(isLinearEasingState({ ...DEFAULT_EASING, points: "8" })).toBe(false);
    expect(isLinearEasingState({ ...DEFAULT_EASING, duration: Infinity })).toBe(false);
    expect(isLinearEasingState(null)).toBe(false);
  });
});

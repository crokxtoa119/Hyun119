import { describe, expect, it } from "vitest";
import {
  DEFAULT_TRANSFORM,
  TRANSFORM_SPECS,
  clampTransform,
  isTransformState,
  transformToCss,
  transformValue,
} from "./transform";

describe("transformValue", () => {
  it("모두 기본값이면 none이다", () => {
    expect(transformValue(DEFAULT_TRANSFORM)).toBe("none");
    expect(transformToCss(DEFAULT_TRANSFORM)).toBe("transform: none;");
  });
  it("바뀐 함수만 정의된 순서대로 쓴다", () => {
    expect(
      transformValue({ ...DEFAULT_TRANSFORM, skewX: 10, translateX: 20, rotate: 45, scale: 1.5 }),
    ).toBe("translateX(20px) rotate(45deg) scale(1.5) skewX(10deg)");
  });
  it("3D 회전이 있을 때만 perspective를 맨 앞에 붙인다", () => {
    expect(transformValue({ ...DEFAULT_TRANSFORM, rotateY: 30 })).toBe(
      "perspective(600px) rotateY(30deg)",
    );
    expect(transformValue({ ...DEFAULT_TRANSFORM, rotate: 30 })).toBe("rotate(30deg)");
  });
  it("perspective가 0이면 3D 회전이 있어도 붙이지 않는다", () => {
    expect(transformValue({ ...DEFAULT_TRANSFORM, perspective: 0, rotateX: 20 })).toBe("rotateX(20deg)");
  });
  it("scale은 단위가 없다", () => {
    expect(transformValue({ ...DEFAULT_TRANSFORM, scale: 0.5 })).toBe("scale(0.5)");
  });
});

describe("clampTransform", () => {
  it("범위를 벗어난 값을 맞춘다", () => {
    const out = clampTransform({
      ...DEFAULT_TRANSFORM,
      translateX: 999,
      rotate: -999,
      scale: 9,
      rotateX: 200,
      perspective: 99999,
    });
    expect(out).toMatchObject({ translateX: 150, rotate: -180, scale: 2, rotateX: 80, perspective: 1200 });
  });
  it("눈금에 맞추고 부동소수점 오차를 없앤다", () => {
    expect(clampTransform({ ...DEFAULT_TRANSFORM, scale: 0.3 }).scale).toBe(0.3);
    expect(clampTransform({ ...DEFAULT_TRANSFORM, scale: 1.04 }).scale).toBe(1.05);
    expect(clampTransform({ ...DEFAULT_TRANSFORM, perspective: 620 }).perspective).toBe(600);
  });
});

describe("isTransformState", () => {
  it("올바른 값을 통과시킨다", () => {
    expect(isTransformState(DEFAULT_TRANSFORM)).toBe(true);
  });
  it("빠졌거나 숫자가 아닌 값은 거부한다", () => {
    const { perspective: _p, ...rest } = DEFAULT_TRANSFORM;
    void _p;
    expect(isTransformState(rest)).toBe(false);
    expect(isTransformState({ ...DEFAULT_TRANSFORM, rotate: "1" })).toBe(false);
    expect(isTransformState({ ...DEFAULT_TRANSFORM, scale: NaN })).toBe(false);
    expect(isTransformState(null)).toBe(false);
  });
});

describe("TRANSFORM_SPECS", () => {
  it("기본값은 범위 안에 있다", () => {
    for (const s of TRANSFORM_SPECS) {
      expect(s.neutral).toBeGreaterThanOrEqual(s.min);
      expect(s.neutral).toBeLessThanOrEqual(s.max);
    }
  });
});

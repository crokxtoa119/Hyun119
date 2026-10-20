import { describe, expect, it } from "vitest";
import {
  DEFAULT_KEYFRAMES,
  FRAME_LIMITS,
  animationDeclaration,
  clampKeyframes,
  isKeyframesState,
  keyframesRule,
  keyframesToCss,
} from "./keyframes";

describe("keyframesRule", () => {
  it("0%, 가운데, 100% 세 키프레임을 만든다", () => {
    const css = keyframesRule(DEFAULT_KEYFRAMES, "move");
    expect(css.split("\n")).toHaveLength(5);
    expect(css).toContain("0% { transform: translateX(-100px) rotate(0deg) scale(1); opacity: 1; }");
    expect(css).toContain("50% { transform: translateX(0px) rotate(180deg) scale(1.5); opacity: 0.6; }");
    expect(css).toContain("100% { transform: translateX(100px) rotate(360deg) scale(1); opacity: 1; }");
  });
  it("가운데 위치를 반영한다", () => {
    expect(keyframesRule({ ...DEFAULT_KEYFRAMES, midAt: 30 }, "m")).toContain("  30% {");
  });
});

describe("animationDeclaration", () => {
  it("시간, 이징, 반복, 방향 순서로 쓴다", () => {
    expect(animationDeclaration(DEFAULT_KEYFRAMES, "move")).toBe(
      "animation: move 2s ease-in-out infinite normal;",
    );
  });
});

describe("keyframesToCss", () => {
  it("규칙과 .box 선언을 함께 낸다", () => {
    const css = keyframesToCss(DEFAULT_KEYFRAMES);
    expect(css).toContain("@keyframes move {");
    expect(css).toContain(".box {\n  animation: move 2s");
  });
});

describe("clampKeyframes", () => {
  it("범위를 벗어난 값을 맞추고 정수로 만든다", () => {
    const out = clampKeyframes({
      ...DEFAULT_KEYFRAMES,
      from: { x: -999, rotate: 9999, scale: 1, opacity: 500 },
      midAt: 0,
      duration: 99,
    });
    expect(out.from).toEqual({
      x: FRAME_LIMITS.x.min,
      rotate: FRAME_LIMITS.rotate.max,
      scale: FRAME_LIMITS.scale.min,
      opacity: FRAME_LIMITS.opacity.max,
    });
    expect(out.midAt).toBe(10);
    expect(out.duration).toBe(5);
  });
  it("시간은 소수 첫째 자리로 맞춘다", () => {
    expect(clampKeyframes({ ...DEFAULT_KEYFRAMES, duration: 1.26 }).duration).toBe(1.3);
    expect(clampKeyframes({ ...DEFAULT_KEYFRAMES, duration: 0 }).duration).toBe(0.2);
  });
});

describe("isKeyframesState", () => {
  it("올바른 값을 통과시킨다", () => {
    expect(isKeyframesState(DEFAULT_KEYFRAMES)).toBe(true);
  });
  it("잘못된 값은 거부한다", () => {
    expect(isKeyframesState({ ...DEFAULT_KEYFRAMES, easing: "bounce" })).toBe(false);
    expect(isKeyframesState({ ...DEFAULT_KEYFRAMES, iterations: "5" })).toBe(false);
    expect(isKeyframesState({ ...DEFAULT_KEYFRAMES, duration: "2" })).toBe(false);
    expect(isKeyframesState({ ...DEFAULT_KEYFRAMES, from: { x: 0 } })).toBe(false);
    expect(isKeyframesState({ ...DEFAULT_KEYFRAMES, mid: null })).toBe(false);
    expect(isKeyframesState(null)).toBe(false);
  });
});

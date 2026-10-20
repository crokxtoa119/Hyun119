import { describe, expect, it } from "vitest";
import {
  DEFAULT_TEXT_EFFECT,
  clampTextEffect,
  isTextEffectState,
  normalizeColor,
  textEffectDeclarations,
  textEffectToCss,
} from "./textEffect";

describe("normalizeColor", () => {
  it("6자리, 3자리, 알파 8자리를 대문자로 정리한다", () => {
    expect(normalizeColor("#abc")).toBe("#AABBCC");
    expect(normalizeColor("00000066")).toBe("#00000066");
    expect(normalizeColor("#ff8800")).toBe("#FF8800");
  });
  it("잘못된 형식은 null이다", () => {
    for (const bad of ["", "#12", "#1234567", "#gggggg", "red"]) {
      expect(normalizeColor(bad)).toBeNull();
    }
  });
});

describe("textEffectToCss", () => {
  it("shadow는 text-shadow 한 줄을 만든다", () => {
    expect(textEffectToCss(DEFAULT_TEXT_EFFECT)).toBe("text-shadow: 3px 4px 8px #00000066;");
  });
  it("gradient는 clip과 투명 글자색을 함께 쓴다", () => {
    const css = textEffectToCss({ ...DEFAULT_TEXT_EFFECT, mode: "gradient" });
    expect(css).toBe(
      [
        "background: linear-gradient(90deg, #F97316, #6366F1);",
        "-webkit-background-clip: text;",
        "background-clip: text;",
        "color: transparent;",
      ].join("\n"),
    );
  });
  it("clamp는 접두사 있는 속성과 표준 속성을 함께 쓴다", () => {
    const css = textEffectToCss({ ...DEFAULT_TEXT_EFFECT, mode: "clamp", lines: 2 });
    expect(css).toContain("-webkit-line-clamp: 2;");
    expect(css).toContain("line-clamp: 2;");
    expect(css).toContain("overflow: hidden;");
  });
  it("선언 목록과 CSS 문자열이 같은 내용이다", () => {
    const s = { ...DEFAULT_TEXT_EFFECT, mode: "gradient" as const };
    expect(textEffectDeclarations(s).map(([k, v]) => `${k}: ${v};`).join("\n")).toBe(textEffectToCss(s));
  });
});

describe("clampTextEffect", () => {
  it("범위를 벗어난 값을 맞춘다", () => {
    const out = clampTextEffect({
      ...DEFAULT_TEXT_EFFECT,
      shadowX: 99,
      shadowY: -99,
      shadowBlur: 999,
      gradAngle: 720,
      lines: 0,
    });
    expect(out).toMatchObject({ shadowX: 20, shadowY: -20, shadowBlur: 30, gradAngle: 360, lines: 1 });
  });
  it("잘못된 색은 기본값으로 되돌린다", () => {
    const out = clampTextEffect({ ...DEFAULT_TEXT_EFFECT, gradFrom: "nope", shadowColor: "x" });
    expect(out.gradFrom).toBe(DEFAULT_TEXT_EFFECT.gradFrom);
    expect(out.shadowColor).toBe(DEFAULT_TEXT_EFFECT.shadowColor);
  });
});

describe("isTextEffectState", () => {
  it("올바른 값을 통과시킨다", () => {
    expect(isTextEffectState(DEFAULT_TEXT_EFFECT)).toBe(true);
  });
  it("잘못된 값은 거부한다", () => {
    expect(isTextEffectState({ ...DEFAULT_TEXT_EFFECT, mode: "glow" })).toBe(false);
    expect(isTextEffectState({ ...DEFAULT_TEXT_EFFECT, gradTo: "blue" })).toBe(false);
    expect(isTextEffectState({ ...DEFAULT_TEXT_EFFECT, shadowColor: "#12" })).toBe(false);
    expect(isTextEffectState({ ...DEFAULT_TEXT_EFFECT, lines: NaN })).toBe(false);
    expect(isTextEffectState(null)).toBe(false);
  });
});

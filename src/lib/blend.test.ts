import { describe, expect, it } from "vitest";
import {
  BLEND_MODES,
  BLEND_NOTES,
  DEFAULT_BLEND,
  blendToCss,
  clampBlend,
  isBlendState,
} from "./blend";

describe("BLEND_NOTES", () => {
  it("모든 모드에 설명이 있다", () => {
    for (const m of BLEND_MODES) expect(BLEND_NOTES[m].length).toBeGreaterThan(0);
    expect(Object.keys(BLEND_NOTES).sort()).toEqual([...BLEND_MODES].sort());
  });
});

describe("blendToCss", () => {
  it("불투명도 100이면 opacity를 생략한다", () => {
    expect(blendToCss(DEFAULT_BLEND)).toBe(
      ".top {\n  background: #F97316;\n  mix-blend-mode: multiply;\n}\n\n.bottom {\n  background: #6366F1;\n}",
    );
  });
  it("불투명도가 낮으면 opacity를 쓴다", () => {
    expect(blendToCss({ ...DEFAULT_BLEND, mode: "screen", opacity: 60 })).toContain("  opacity: 0.6;");
  });
});

describe("clampBlend", () => {
  it("불투명도를 범위로 맞춘다", () => {
    expect(clampBlend({ ...DEFAULT_BLEND, opacity: 500 }).opacity).toBe(100);
    expect(clampBlend({ ...DEFAULT_BLEND, opacity: -3 }).opacity).toBe(0);
    expect(clampBlend({ ...DEFAULT_BLEND, opacity: 33.6 }).opacity).toBe(34);
  });
  it("색을 정리하고 잘못된 색은 기본값으로 되돌린다", () => {
    expect(clampBlend({ ...DEFAULT_BLEND, top: "#abc" }).top).toBe("#AABBCC");
    expect(clampBlend({ ...DEFAULT_BLEND, bottom: "nope" }).bottom).toBe(DEFAULT_BLEND.bottom);
  });
});

describe("isBlendState", () => {
  it("올바른 값을 통과시킨다", () => {
    expect(isBlendState(DEFAULT_BLEND)).toBe(true);
  });
  it("잘못된 값은 거부한다", () => {
    expect(isBlendState({ ...DEFAULT_BLEND, mode: "plus" })).toBe(false);
    expect(isBlendState({ ...DEFAULT_BLEND, top: "red" })).toBe(false);
    expect(isBlendState({ ...DEFAULT_BLEND, opacity: "100" })).toBe(false);
    expect(isBlendState({ ...DEFAULT_BLEND, opacity: NaN })).toBe(false);
    expect(isBlendState(null)).toBe(false);
  });
});

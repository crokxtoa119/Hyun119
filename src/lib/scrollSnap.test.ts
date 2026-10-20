import { describe, expect, it } from "vitest";
import {
  DEFAULT_SCROLL_SNAP,
  LIMITS,
  Y_HEIGHT,
  clampScrollSnap,
  containerDeclarations,
  isScrollSnapState,
  itemDeclarations,
  scrollSnapToCss,
} from "./scrollSnap";

describe("scrollSnapToCss", () => {
  it("가로 기본값은 overflow-x와 x mandatory를 쓴다", () => {
    expect(scrollSnapToCss(DEFAULT_SCROLL_SNAP)).toBe(
      [
        ".scroller {",
        "  display: flex;",
        "  flex-direction: row;",
        "  overflow-x: auto;",
        "  scroll-snap-type: x mandatory;",
        "  gap: 16px;",
        "}",
        "",
        ".item {",
        "  flex: 0 0 60%;",
        "  scroll-snap-align: center;",
        "}",
      ].join("\n"),
    );
  });
  it("세로는 높이를 함께 쓴다", () => {
    const css = scrollSnapToCss({ ...DEFAULT_SCROLL_SNAP, axis: "y", type: "proximity" });
    expect(css).toContain("flex-direction: column;");
    expect(css).toContain("overflow-y: auto;");
    expect(css).toContain("scroll-snap-type: y proximity;");
    expect(css).toContain(`height: ${Y_HEIGHT}px;`);
  });
  it("간격과 scroll-padding이 0이면 생략한다", () => {
    const css = scrollSnapToCss({ ...DEFAULT_SCROLL_SNAP, gap: 0, padding: 0 });
    expect(css).not.toContain("gap");
    expect(css).not.toContain("scroll-padding");
  });
  it("scroll-padding이 있으면 쓴다", () => {
    expect(scrollSnapToCss({ ...DEFAULT_SCROLL_SNAP, padding: 24 })).toContain("scroll-padding: 24px;");
  });
});

describe("declarations", () => {
  it("선언 목록을 정해진 순서로 돌려준다", () => {
    expect(containerDeclarations(DEFAULT_SCROLL_SNAP).map(([k]) => k)).toEqual([
      "display",
      "flex-direction",
      "overflow-x",
      "scroll-snap-type",
      "gap",
    ]);
    expect(itemDeclarations({ ...DEFAULT_SCROLL_SNAP, size: 80, align: "end" })).toEqual([
      ["flex", "0 0 80%"],
      ["scroll-snap-align", "end"],
    ]);
  });
});

describe("clampScrollSnap", () => {
  it("범위를 벗어난 값을 맞춘다", () => {
    const out = clampScrollSnap({ ...DEFAULT_SCROLL_SNAP, items: 99, size: 1, gap: -4, padding: 999 });
    expect(out).toMatchObject({
      items: LIMITS.items.max,
      size: LIMITS.size.min,
      gap: 0,
      padding: LIMITS.padding.max,
    });
  });
});

describe("isScrollSnapState", () => {
  it("올바른 값을 통과시킨다", () => {
    expect(isScrollSnapState(DEFAULT_SCROLL_SNAP)).toBe(true);
  });
  it("잘못된 값은 거부한다", () => {
    expect(isScrollSnapState({ ...DEFAULT_SCROLL_SNAP, axis: "z" })).toBe(false);
    expect(isScrollSnapState({ ...DEFAULT_SCROLL_SNAP, type: "loose" })).toBe(false);
    expect(isScrollSnapState({ ...DEFAULT_SCROLL_SNAP, align: "left" })).toBe(false);
    expect(isScrollSnapState({ ...DEFAULT_SCROLL_SNAP, gap: "1" })).toBe(false);
    expect(isScrollSnapState({ ...DEFAULT_SCROLL_SNAP, items: NaN })).toBe(false);
    expect(isScrollSnapState(null)).toBe(false);
  });
});

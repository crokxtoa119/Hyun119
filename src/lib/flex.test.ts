import { describe, expect, it } from "vitest";
import {
  DEFAULT_FLEX,
  GAP_MAX,
  ITEMS_MAX,
  ITEMS_MIN,
  clampFlex,
  flexToCss,
  isFlexState,
} from "./flex";

describe("flexToCss", () => {
  it("기본값이면 display만 쓰고 gap은 기본 12px를 포함한다", () => {
    expect(flexToCss(DEFAULT_FLEX)).toBe("display: flex;\ngap: 12px;");
  });
  it("바뀐 속성만 순서대로 쓴다", () => {
    const css = flexToCss({
      direction: "column",
      wrap: "wrap",
      justify: "space-between",
      align: "center",
      gap: 0,
      items: 3,
    });
    expect(css).toBe(
      "display: flex;\nflex-direction: column;\nflex-wrap: wrap;\njustify-content: space-between;\nalign-items: center;",
    );
  });
});

describe("clampFlex", () => {
  it("gap과 items를 범위로 맞추고 정수로 만든다", () => {
    expect(clampFlex({ ...DEFAULT_FLEX, gap: 999, items: 99 })).toMatchObject({
      gap: GAP_MAX,
      items: ITEMS_MAX,
    });
    expect(clampFlex({ ...DEFAULT_FLEX, gap: -5, items: 0 })).toMatchObject({
      gap: 0,
      items: ITEMS_MIN,
    });
    expect(clampFlex({ ...DEFAULT_FLEX, gap: 3.6 }).gap).toBe(4);
  });
});

describe("isFlexState", () => {
  it("올바른 값을 통과시킨다", () => {
    expect(isFlexState(DEFAULT_FLEX)).toBe(true);
  });
  it("알 수 없는 키워드나 숫자가 아닌 값은 거부한다", () => {
    expect(isFlexState({ ...DEFAULT_FLEX, direction: "diagonal" })).toBe(false);
    expect(isFlexState({ ...DEFAULT_FLEX, justify: "left" })).toBe(false);
    expect(isFlexState({ ...DEFAULT_FLEX, gap: "12" })).toBe(false);
    expect(isFlexState({ ...DEFAULT_FLEX, items: NaN })).toBe(false);
    expect(isFlexState(null)).toBe(false);
    expect(isFlexState({})).toBe(false);
  });
});

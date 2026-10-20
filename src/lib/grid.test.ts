import { describe, expect, it } from "vitest";
import {
  DEFAULT_GRID,
  LIMITS,
  MIN_COLUMN,
  clampGrid,
  gapValue,
  gridToCss,
  isGridState,
  templateColumns,
} from "./grid";

describe("templateColumns", () => {
  it("fixed는 열 개수를 고정한다", () => {
    expect(templateColumns({ ...DEFAULT_GRID, columns: 4 })).toBe("repeat(4, 1fr)");
  });
  it("auto-fit은 최소 너비를 기준으로 한다", () => {
    expect(templateColumns({ ...DEFAULT_GRID, mode: "auto-fit" })).toBe(
      `repeat(auto-fit, minmax(${MIN_COLUMN}px, 1fr))`,
    );
  });
});

describe("gapValue", () => {
  it("같으면 하나, 다르면 행 열 순서로 쓴다", () => {
    expect(gapValue({ ...DEFAULT_GRID, rowGap: 8, columnGap: 8 })).toBe("8px");
    expect(gapValue({ ...DEFAULT_GRID, rowGap: 8, columnGap: 20 })).toBe("8px 20px");
  });
});

describe("gridToCss", () => {
  it("기본값은 정렬 속성을 생략한다", () => {
    expect(gridToCss(DEFAULT_GRID)).toBe(
      ".container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  grid-auto-rows: 72px;\n  gap: 12px;\n}",
    );
  });
  it("정렬과 span을 반영한다", () => {
    const css = gridToCss({ ...DEFAULT_GRID, justify: "center", align: "end", span: true });
    expect(css).toContain("  justify-items: center;");
    expect(css).toContain("  align-items: end;");
    expect(css).toContain(".item:first-child {\n  grid-column: span 2;\n}");
  });
  it("간격이 모두 0이면 gap을 쓰지 않는다", () => {
    expect(gridToCss({ ...DEFAULT_GRID, rowGap: 0, columnGap: 0 })).not.toContain("gap");
  });
});

describe("clampGrid", () => {
  it("범위를 벗어난 값을 맞추고 정수로 만든다", () => {
    const out = clampGrid({
      ...DEFAULT_GRID,
      columns: 99,
      rowHeight: 1,
      columnGap: -4,
      rowGap: 999,
      items: 0,
    });
    expect(out).toMatchObject({
      columns: LIMITS.columns.max,
      rowHeight: LIMITS.rowHeight.min,
      columnGap: 0,
      rowGap: LIMITS.gap.max,
      items: LIMITS.items.min,
    });
    expect(clampGrid({ ...DEFAULT_GRID, columns: 2.6 }).columns).toBe(3);
  });
});

describe("isGridState", () => {
  it("올바른 값을 통과시킨다", () => {
    expect(isGridState(DEFAULT_GRID)).toBe(true);
  });
  it("잘못된 값은 거부한다", () => {
    expect(isGridState({ ...DEFAULT_GRID, mode: "masonry" })).toBe(false);
    expect(isGridState({ ...DEFAULT_GRID, justify: "left" })).toBe(false);
    expect(isGridState({ ...DEFAULT_GRID, span: "yes" })).toBe(false);
    expect(isGridState({ ...DEFAULT_GRID, columns: Infinity })).toBe(false);
    expect(isGridState(null)).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import {
  DEFAULT_FILTER,
  FILTER_SPECS,
  clampFilter,
  filterToCss,
  filterValue,
  isFilterState,
} from "./filter";

describe("filterValue", () => {
  it("모두 기본값이면 none이다", () => {
    expect(filterValue(DEFAULT_FILTER)).toBe("none");
    expect(filterToCss(DEFAULT_FILTER)).toBe("filter: none;");
  });
  it("바뀐 함수만 정의된 순서대로 쓴다", () => {
    expect(filterValue({ ...DEFAULT_FILTER, sepia: 40, blur: 3, brightness: 120 })).toBe(
      "blur(3px) brightness(120%) sepia(40%)",
    );
  });
  it("hue-rotate는 deg 단위를 쓴다", () => {
    expect(filterValue({ ...DEFAULT_FILTER, hueRotate: 90 })).toBe("hue-rotate(90deg)");
  });
  it("밝기를 0으로 낮추는 것도 효과로 취급한다", () => {
    expect(filterValue({ ...DEFAULT_FILTER, brightness: 0 })).toBe("brightness(0%)");
  });
});

describe("clampFilter", () => {
  it("범위를 벗어난 값을 맞추고 정수로 만든다", () => {
    const out = clampFilter({ ...DEFAULT_FILTER, blur: 99, brightness: -5, hueRotate: 999, sepia: 12.6 });
    expect(out).toMatchObject({ blur: 20, brightness: 0, hueRotate: 360, sepia: 13 });
  });
});

describe("isFilterState", () => {
  it("올바른 값을 통과시킨다", () => {
    expect(isFilterState(DEFAULT_FILTER)).toBe(true);
  });
  it("빠졌거나 숫자가 아닌 값은 거부한다", () => {
    const { blur: _blur, ...rest } = DEFAULT_FILTER;
    void _blur;
    expect(isFilterState(rest)).toBe(false);
    expect(isFilterState({ ...DEFAULT_FILTER, sepia: "1" })).toBe(false);
    expect(isFilterState({ ...DEFAULT_FILTER, invert: NaN })).toBe(false);
    expect(isFilterState(null)).toBe(false);
  });
});

describe("FILTER_SPECS", () => {
  it("기본값은 모두 범위 안에 있다", () => {
    for (const s of FILTER_SPECS) {
      expect(s.neutral).toBeGreaterThanOrEqual(s.min);
      expect(s.neutral).toBeLessThanOrEqual(s.max);
    }
  });
});

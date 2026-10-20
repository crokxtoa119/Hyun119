import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  formatRatio,
  gradeContrast,
  hexToRgb,
  isContrastState,
  normalizeHex,
  relativeLuminance,
  rgbToHex,
  suggestForeground,
} from "./contrast";

describe("normalizeHex", () => {
  it("3자리와 # 생략을 6자리 대문자로 바꾼다", () => {
    expect(normalizeHex("#abc")).toBe("#AABBCC");
    expect(normalizeHex("1a2b3c")).toBe("#1A2B3C");
    expect(normalizeHex(" #fff ")).toBe("#FFFFFF");
  });
  it("잘못된 형식은 null이다", () => {
    for (const bad of ["", "#12", "#12345", "#gggggg", "red", "#1234567"]) {
      expect(normalizeHex(bad)).toBeNull();
    }
  });
});

describe("변환", () => {
  it("hex와 rgb를 오간다", () => {
    expect(hexToRgb("#FF8000")).toEqual([255, 128, 0]);
    expect(rgbToHex([255, 128, 0])).toBe("#FF8000");
    expect(rgbToHex([300, -5, 0.4])).toBe("#FF0000");
  });
  it("잘못된 hex는 던진다", () => {
    expect(() => hexToRgb("nope")).toThrow();
  });
});

describe("contrastRatio", () => {
  it("흑백은 21:1이다", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
  });
  it("같은 색은 1:1이고 순서와 무관하다", () => {
    expect(contrastRatio("#336699", "#336699")).toBeCloseTo(1, 5);
    expect(contrastRatio("#123456", "#FEDCBA")).toBeCloseTo(contrastRatio("#FEDCBA", "#123456"), 10);
  });
  it("알려진 값과 맞는다 (#767676 on white ≈ 4.54)", () => {
    expect(contrastRatio("#767676", "#FFFFFF")).toBeCloseTo(4.54, 2);
  });
  it("휘도는 0~1이다", () => {
    expect(relativeLuminance("#000000")).toBe(0);
    expect(relativeLuminance("#FFFFFF")).toBeCloseTo(1, 10);
  });
});

describe("gradeContrast", () => {
  it("경계값에서 등급이 나뉜다", () => {
    expect(gradeContrast(4.49)).toMatchObject({ aa: false, aaLarge: true, aaaLarge: false });
    expect(gradeContrast(4.5)).toMatchObject({ aa: true, aaaLarge: true, aaa: false });
    expect(gradeContrast(7)).toMatchObject({ aaa: true });
    expect(gradeContrast(2.99)).toMatchObject({ aaLarge: false, ui: false });
  });
});

describe("formatRatio", () => {
  it("내림해서 기준 미달을 통과로 보이지 않게 한다", () => {
    expect(formatRatio(4.499)).toBe("4.49:1");
    expect(formatRatio(21)).toBe("21.00:1");
  });
});

describe("suggestForeground", () => {
  it("이미 충분하면 그대로(정규화만) 돌려준다", () => {
    expect(suggestForeground("#000", "#FFFFFF")).toBe("#000000");
  });
  it("밝은 배경에서는 어둡게, 어두운 배경에서는 밝게 조절해 기준을 넘긴다", () => {
    const light = suggestForeground("#AAAAAA", "#FFFFFF");
    expect(contrastRatio(light, "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
    const dark = suggestForeground("#555555", "#111111");
    expect(contrastRatio(dark, "#111111")).toBeGreaterThanOrEqual(4.5);
  });
  it("목표를 7로 높일 수 있다", () => {
    expect(contrastRatio(suggestForeground("#999999", "#FFFFFF", 7), "#FFFFFF")).toBeGreaterThanOrEqual(7);
  });
});

describe("isContrastState", () => {
  it("두 색이 유효할 때만 통과한다", () => {
    expect(isContrastState({ fg: "#fff", bg: "#000000" })).toBe(true);
    expect(isContrastState({ fg: "red", bg: "#000000" })).toBe(false);
    expect(isContrastState({ fg: "#fff" })).toBe(false);
    expect(isContrastState(null)).toBe(false);
  });
});

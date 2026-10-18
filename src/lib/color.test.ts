import { afterEach, describe, expect, it, vi } from "vitest";
import {
  HARMONIES,
  generatePalette,
  hexToRgba,
  hslToHex,
  randomBase,
  readableTextColor,
  type Harmony,
} from "@/lib/color";

describe("hslToHex", () => {
  it("원색을 정확한 HEX로 바꾼다", () => {
    expect(hslToHex({ h: 0, s: 100, l: 50 })).toBe("#FF0000");
    expect(hslToHex({ h: 60, s: 100, l: 50 })).toBe("#FFFF00");
    expect(hslToHex({ h: 120, s: 100, l: 50 })).toBe("#00FF00");
    expect(hslToHex({ h: 180, s: 100, l: 50 })).toBe("#00FFFF");
    expect(hslToHex({ h: 240, s: 100, l: 50 })).toBe("#0000FF");
    expect(hslToHex({ h: 300, s: 100, l: 50 })).toBe("#FF00FF");
  });

  it("흰색, 검정, 회색을 처리한다 (채도 0이면 색상값은 영향이 없다)", () => {
    expect(hslToHex({ h: 0, s: 0, l: 100 })).toBe("#FFFFFF");
    expect(hslToHex({ h: 200, s: 0, l: 100 })).toBe("#FFFFFF");
    expect(hslToHex({ h: 0, s: 0, l: 0 })).toBe("#000000");
    // 127.5는 반올림되어 128(0x80)
    expect(hslToHex({ h: 0, s: 0, l: 50 })).toBe("#808080");
  });

  it("360도는 0도와 같다", () => {
    expect(hslToHex({ h: 360, s: 100, l: 50 })).toBe(hslToHex({ h: 0, s: 100, l: 50 }));
  });

  it("항상 대문자 #RRGGBB 형식이다", () => {
    for (let h = 0; h < 360; h += 37) {
      expect(hslToHex({ h, s: 63, l: 41 })).toMatch(/^#[0-9A-F]{6}$/);
    }
  });
});

describe("readableTextColor", () => {
  it("밝은 배경에는 검정, 어두운 배경에는 흰색을 고른다", () => {
    expect(readableTextColor("#FFFFFF")).toBe("#000000");
    expect(readableTextColor("#FFFF00")).toBe("#000000");
    expect(readableTextColor("#000000")).toBe("#FFFFFF");
    expect(readableTextColor("#0000FF")).toBe("#FFFFFF");
    expect(readableTextColor("#808080")).toBe("#FFFFFF");
  });

  it("경계(상대 휘도 0.4) 양쪽에서 갈린다", () => {
    expect(readableTextColor("#A0A0A0")).toBe("#FFFFFF"); // 휘도 약 0.35
    expect(readableTextColor("#B0B0B0")).toBe("#000000"); // 휘도 약 0.43
  });
});

describe("hexToRgba", () => {
  it("HEX와 알파를 rgba 문자열로 바꾼다", () => {
    expect(hexToRgba("#FF8000", 0.5)).toBe("rgba(255, 128, 0, 0.5)");
    expect(hexToRgba("#000000", 1)).toBe("rgba(0, 0, 0, 1)");
    expect(hexToRgba("#FFFFFF", 0)).toBe("rgba(255, 255, 255, 0)");
  });

  it("알파는 소수 둘째 자리까지만 남긴다", () => {
    expect(hexToRgba("#102030", 0.3333)).toBe("rgba(16, 32, 48, 0.33)");
  });

  it("소문자 HEX도 읽는다", () => {
    expect(hexToRgba("#ff00ff", 1)).toBe("rgba(255, 0, 255, 1)");
  });
});

describe("generatePalette", () => {
  const base = { h: 10, s: 60, l: 50 };

  it("모든 배색 규칙이 정확히 5색을 만든다", () => {
    for (const { value } of HARMONIES) {
      expect(generatePalette(base, value)).toHaveLength(5);
    }
  });

  it("모든 색상값(h/s/l)이 유효 범위 안이다 (끝값 경계 포함)", () => {
    const edges = [
      { h: 0, s: 0, l: 0 },
      { h: 359, s: 100, l: 100 },
      { h: 180, s: 10, l: 95 },
      { h: 5, s: 100, l: 5 },
    ];
    for (const b of edges) {
      for (const { value } of HARMONIES) {
        for (const c of generatePalette(b, value)) {
          expect(c.h).toBeGreaterThanOrEqual(0);
          expect(c.h).toBeLessThan(360);
          expect(c.s).toBeGreaterThanOrEqual(0);
          expect(c.s).toBeLessThanOrEqual(100);
          expect(c.l).toBeGreaterThanOrEqual(0);
          expect(c.l).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it("유사색: 기준 ±30, ±60도이며 0도를 넘으면 360 안으로 되감긴다", () => {
    expect(generatePalette(base, "analogous").map((c) => c.h)).toEqual([310, 340, 10, 40, 70]);
  });

  it("유사색: 채도와 명도는 그대로다", () => {
    for (const c of generatePalette(base, "analogous")) {
      expect(c.s).toBe(60);
      expect(c.l).toBe(50);
    }
  });

  it("보색: 기준색과 180도 반대 색상이 포함된다", () => {
    const hues = generatePalette(base, "complementary").map((c) => c.h);
    expect(hues).toContain(10);
    expect(hues).toContain(190);
  });

  it("삼각 배색: 120도 간격의 세 색상이 나온다", () => {
    const hues = new Set(generatePalette(base, "triadic").map((c) => c.h));
    expect([...hues].sort((a, b) => a - b)).toEqual([10, 130, 250]);
  });

  it("분할 보색: 기준색과 150, 210도 색상이 나온다", () => {
    const hues = new Set(generatePalette(base, "split").map((c) => c.h));
    expect([...hues].sort((a, b) => a - b)).toEqual([10, 160, 220]);
  });

  it("단색 명도: 같은 색상에서 명도만 20~80으로 달라진다", () => {
    const palette = generatePalette(base, "monochrome");
    expect(palette.map((c) => c.l)).toEqual([20, 35, 50, 65, 80]);
    for (const c of palette) {
      expect(c.h).toBe(10);
      expect(c.s).toBe(60);
    }
  });

  it("기준값이 같으면 항상 같은 결과를 낸다 (순수 함수)", () => {
    const rules: Harmony[] = ["analogous", "complementary", "triadic", "split", "monochrome"];
    for (const rule of rules) {
      expect(generatePalette(base, rule)).toEqual(generatePalette(base, rule));
    }
  });

  it("입력 객체를 바꾸지 않는다", () => {
    const input = { h: 10, s: 60, l: 50 };
    generatePalette(input, "complementary");
    expect(input).toEqual({ h: 10, s: 60, l: 50 });
  });
});

describe("randomBase", () => {
  afterEach(() => vi.restoreAllMocks());

  it("난수가 최솟값일 때의 범위 하한", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(randomBase()).toEqual({ h: 0, s: 55, l: 45 });
  });

  it("난수가 최댓값에 가까울 때의 범위 상한", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.999999);
    expect(randomBase()).toEqual({ h: 359, s: 89, l: 59 });
  });

  it("실제 난수로 여러 번 뽑아도 항상 범위 안이다", () => {
    for (let i = 0; i < 200; i++) {
      const { h, s, l } = randomBase();
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(360);
      expect(s).toBeGreaterThanOrEqual(55);
      expect(s).toBeLessThanOrEqual(89);
      expect(l).toBeGreaterThanOrEqual(45);
      expect(l).toBeLessThanOrEqual(59);
    }
  });
});

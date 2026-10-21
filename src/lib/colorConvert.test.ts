import { describe, expect, it } from "vitest";
import { convertColor, convToCss, isConvState, parseColor } from "./colorConvert";

describe("parseColor", () => {
  it("hex 3자리, 6자리, # 생략을 읽는다", () => {
    expect(parseColor("#f00")).toEqual({ r: 255, g: 0, b: 0 });
    expect(parseColor("00FF00")).toEqual({ r: 0, g: 255, b: 0 });
  });

  it("rgb()를 쉼표와 공백 표기 모두 읽고 퍼센트도 허용한다", () => {
    expect(parseColor("rgb(10, 20, 30)")).toEqual({ r: 10, g: 20, b: 30 });
    expect(parseColor("rgb(10 20 30 / 0.5)")).toEqual({ r: 10, g: 20, b: 30 });
    expect(parseColor("rgb(100%, 0%, 0%)")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("범위를 넘는 rgb 값은 잘라 낸다", () => {
    expect(parseColor("rgb(300, -5, 0)")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("hsl()을 읽는다", () => {
    const c = parseColor("hsl(120, 100%, 50%)")!;
    expect([c.r, c.g, c.b].map(Math.round)).toEqual([0, 255, 0]);
  });

  it("oklch()를 소수와 퍼센트 밝기 모두 읽는다", () => {
    expect(parseColor("oklch(0.5 0.1 200)")).not.toBeNull();
    const a = parseColor("oklch(50% 0.1 200)")!;
    const b = parseColor("oklch(0.5 0.1 200)")!;
    expect(a.r).toBeCloseTo(b.r, 6);
  });

  it("형식이 틀리면 null이다", () => {
    for (const bad of ["", "red", "#12", "rgb(1, 2)", "hsl(1, 2, 3, 4)", "oklch(2 0 0)", "rgb(a, b, c)"]) {
      expect(parseColor(bad)).toBeNull();
    }
  });
});

describe("convertColor", () => {
  it("빨강을 네 표기로 바꾼다(OKLCH 기준값 포함)", () => {
    expect(convertColor("#FF0000")).toEqual({
      hex: "#FF0000",
      rgb: "rgb(255, 0, 0)",
      hsl: "hsl(0, 100%, 50%)",
      oklch: "oklch(62.8% 0.2577 29.2)",
      inGamut: true,
    });
  });

  it("흰색과 검정은 무채색이라 채도와 색상이 0이다", () => {
    expect(convertColor("#FFFFFF")!.oklch).toBe("oklch(100% 0 0)");
    expect(convertColor("#000")!.oklch).toBe("oklch(0% 0 0)");
    expect(convertColor("#808080")!.hsl).toBe("hsl(0, 0%, 50%)");
  });

  it("어느 표기로 입력해도 같은 색이면 같은 결과다", () => {
    const base = convertColor("#4F46E5")!;
    expect(convertColor(base.rgb)!.hex).toBe("#4F46E5");
    expect(convertColor(base.oklch)!.hex).toBe("#4F46E5");
  });

  it("hsl은 정수로 반올림해 표시하므로 되돌리면 채널당 몇 단계 어긋날 수 있다", () => {
    const back = parseColor(convertColor("#4F46E5")!.hsl)!;
    expect(Math.abs(back.r - 0x4f)).toBeLessThan(4);
    expect(Math.abs(back.g - 0x46)).toBeLessThan(4);
    expect(Math.abs(back.b - 0xe5)).toBeLessThan(4);
  });

  it("sRGB 밖의 OKLCH는 hex를 잘라 내고 inGamut이 false다", () => {
    const f = convertColor("oklch(70% 0.4 30)")!;
    expect(f.inGamut).toBe(false);
    expect(f.hex).toMatch(/^#[0-9A-F]{6}$/);
  });

  it("잘못된 입력은 null이다", () => {
    expect(convertColor("nope")).toBeNull();
  });
});

describe("convToCss / isConvState", () => {
  it("네 줄의 color 선언을 만든다", () => {
    const css = convToCss(convertColor("#FF0000")!);
    expect(css.split("\n")).toHaveLength(4);
    expect(css).toContain("color: oklch(62.8% 0.2577 29.2);");
  });

  it("프리셋 검증은 읽을 수 있는 색만 통과시킨다", () => {
    expect(isConvState({ input: "#abc" })).toBe(true);
    expect(isConvState({ input: "nope" })).toBe(false);
    expect(isConvState({})).toBe(false);
    expect(isConvState(null)).toBe(false);
  });
});

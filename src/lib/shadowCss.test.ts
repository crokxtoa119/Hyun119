import { describe, expect, it } from "vitest";
import { boxShadowValue } from "./shadowCss";

const base = { x: 0, y: 8, blur: 24, spread: 0, shadowColor: "#000000", shadowAlpha: 0.12, inset: false };

describe("boxShadowValue", () => {
  it("가로, 세로, 흐림, 번짐과 rgba 색을 차례로 쓴다", () => {
    expect(boxShadowValue(base)).toBe("0px 8px 24px 0px rgba(0, 0, 0, 0.12)");
  });

  it("안쪽 그림자는 앞에 inset을 붙인다", () => {
    expect(boxShadowValue({ ...base, inset: true })).toBe("inset 0px 8px 24px 0px rgba(0, 0, 0, 0.12)");
  });

  it("음수 값과 다른 색도 그대로 쓴다", () => {
    expect(boxShadowValue({ ...base, x: -4, spread: -2, shadowColor: "#6366F1", shadowAlpha: 0.5 })).toBe(
      "-4px 8px 24px -2px rgba(99, 102, 241, 0.5)",
    );
  });
});

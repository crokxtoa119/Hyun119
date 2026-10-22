import { describe, expect, it } from "vitest";
import { gradientCss } from "./gradient";

const stops = [
  { color: "#6366F1", pos: 0 },
  { color: "#EC4899", pos: 100 },
];

describe("gradientCss", () => {
  it("선형은 각도와 정지점을 쓴다", () => {
    expect(gradientCss("linear", 135, stops)).toBe("linear-gradient(135deg, #6366F1 0%, #EC4899 100%)");
  });

  it("원형은 각도를 쓰지 않는다", () => {
    expect(gradientCss("radial", 90, stops)).toBe("radial-gradient(circle, #6366F1 0%, #EC4899 100%)");
  });

  it("원뿔은 from 각도를 쓴다", () => {
    expect(gradientCss("conic", 45, stops)).toBe("conic-gradient(from 45deg, #6366F1 0%, #EC4899 100%)");
  });

  it("정지점은 위치 순서로 정렬하고 원래 배열은 바꾸지 않는다", () => {
    const shuffled = [
      { color: "#00F", pos: 100 },
      { color: "#0F0", pos: 50 },
      { color: "#F00", pos: 0 },
    ];
    expect(gradientCss("linear", 0, shuffled)).toBe("linear-gradient(0deg, #F00 0%, #0F0 50%, #00F 100%)");
    expect(shuffled[0].pos).toBe(100);
  });
});

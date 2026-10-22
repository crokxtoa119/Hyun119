import { describe, expect, it } from "vitest";
import {
  DEFAULT_MASK,
  MASK_LIMITS,
  MIN_GAP,
  clampMask,
  isMaskState,
  maskToCss,
  maskValue,
  type MaskState,
} from "./mask";

const mask = (patch: Partial<MaskState> = {}): MaskState => ({ ...DEFAULT_MASK, ...patch });

describe("clampMask", () => {
  it("기본값은 그대로 둔다", () => {
    expect(clampMask(DEFAULT_MASK)).toEqual(DEFAULT_MASK);
  });

  it("각 값을 범위 안의 정수로 맞춘다", () => {
    const r = clampMask(mask({ angle: 999, solid: -5, end: 500 }));
    expect(r.angle).toBe(MASK_LIMITS.angle.max);
    expect(r.solid).toBe(MASK_LIMITS.solid.min);
    expect(r.end).toBe(100);
  });

  it("사라지는 지점은 그대로 보이는 지점보다 MIN_GAP 이상 뒤로 밀어낸다", () => {
    expect(clampMask(mask({ solid: 80, end: 82 })).end).toBe(80 + MIN_GAP);
    expect(clampMask(mask({ solid: 95, end: 10 })).end).toBe(100);
    expect(clampMask(mask({ solid: 20, end: 60 })).end).toBe(60);
  });

  it("알 수 없는 모양은 선형으로 되돌린다", () => {
    expect(clampMask({ ...DEFAULT_MASK, shape: "conic" } as unknown as MaskState).shape).toBe("linear");
  });
});

describe("maskValue", () => {
  it("알려진 값: 기본 설정은 아래쪽으로 사라지는 선형 그라디언트", () => {
    expect(maskValue(DEFAULT_MASK)).toBe("linear-gradient(180deg, #000 60%, transparent 100%)");
  });

  it("원형은 각도 없이 circle을 쓴다", () => {
    expect(maskValue(mask({ shape: "radial", solid: 30, end: 70 }))).toBe(
      "radial-gradient(circle, #000 30%, transparent 70%)",
    );
  });

  it("반전하면 투명에서 시작해 불투명으로 끝난다", () => {
    expect(maskValue(mask({ invert: true }))).toBe("linear-gradient(180deg, transparent 60%, #000 100%)");
  });

  it("각도와 지점이 값에 그대로 들어간다", () => {
    expect(maskValue(mask({ angle: 45, solid: 10, end: 90 }))).toBe(
      "linear-gradient(45deg, #000 10%, transparent 90%)",
    );
  });
});

describe("maskToCss", () => {
  it("접두사가 있는 속성과 없는 속성에 같은 값을 쓴다", () => {
    const v = maskValue(DEFAULT_MASK);
    expect(maskToCss(DEFAULT_MASK)).toBe(`.masked {\n  -webkit-mask-image: ${v};\n  mask-image: ${v};\n}`);
  });
});

describe("isMaskState", () => {
  it("올바른 값만 통과시킨다", () => {
    expect(isMaskState(DEFAULT_MASK)).toBe(true);
    expect(isMaskState({ ...DEFAULT_MASK, shape: "conic" })).toBe(false);
    expect(isMaskState({ ...DEFAULT_MASK, invert: 0 })).toBe(false);
    expect(isMaskState({ ...DEFAULT_MASK, end: Infinity })).toBe(false);
    expect(isMaskState(null)).toBe(false);
  });
});

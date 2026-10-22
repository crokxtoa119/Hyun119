import { describe, expect, it } from "vitest";
import {
  DEFAULT_SCALE,
  RATIOS,
  SCALE_LIMITS,
  clampTypeScale,
  formatSize,
  isTypeScaleState,
  scaleSteps,
  stepName,
  typeScaleToCss,
  type TypeScaleState,
} from "./typeScale";

const scale = (patch: Partial<TypeScaleState> = {}): TypeScaleState => ({ ...DEFAULT_SCALE, ...patch });

describe("clampTypeScale", () => {
  it("기본값은 그대로 둔다", () => {
    expect(clampTypeScale(DEFAULT_SCALE)).toEqual(DEFAULT_SCALE);
  });

  it("각 값을 범위 안으로 맞추고 비율은 소수 셋째 자리까지만 쓴다", () => {
    const r = clampTypeScale(scale({ base: 2, ratio: 9, up: 99, down: -1 }));
    expect(r.base).toBe(SCALE_LIMITS.base.min);
    expect(r.ratio).toBe(SCALE_LIMITS.ratio.max);
    expect(r.up).toBe(SCALE_LIMITS.up.max);
    expect(r.down).toBe(SCALE_LIMITS.down.min);
    expect(clampTypeScale(scale({ ratio: 1.33333333 })).ratio).toBe(1.333);
  });

  it("알 수 없는 단위는 rem으로 돌린다", () => {
    expect(clampTypeScale({ ...DEFAULT_SCALE, unit: "em" } as unknown as TypeScaleState).unit).toBe("rem");
    expect(clampTypeScale(scale({ unit: "px" })).unit).toBe("px");
  });
});

describe("scaleSteps", () => {
  it("단계 수는 작은 쪽 + 큰 쪽 + 기준 1개이고 step 0이 기준 크기다", () => {
    const steps = scaleSteps(scale({ up: 5, down: 2 }));
    expect(steps).toHaveLength(8);
    expect(steps[0].step).toBe(-2);
    expect(steps.find((t) => t.step === 0)!.px).toBe(16);
  });

  it("인접한 단계의 비는 항상 ratio다", () => {
    const steps = scaleSteps(scale({ base: 18, ratio: 1.333, up: 4, down: 3 }));
    for (let i = 1; i < steps.length; i++) expect(steps[i].px / steps[i - 1].px).toBeCloseTo(1.333, 10);
  });

  it("up과 down이 0이면 기준 하나뿐이다", () => {
    expect(scaleSteps(scale({ up: 0, down: 0 }))).toEqual([{ step: 0, px: 16 }]);
  });
});

describe("formatSize / stepName", () => {
  it("rem은 16으로 나눠 넷째 자리까지, px는 둘째 자리까지 쓴다", () => {
    expect(formatSize(16, "rem")).toBe("1rem");
    expect(formatSize(20, "rem")).toBe("1.25rem");
    expect(formatSize(10.24, "rem")).toBe("0.64rem");
    expect(formatSize(25.6, "px")).toBe("25.6px");
    expect(formatSize(12.80000001, "px")).toBe("12.8px");
  });

  it("음수 단계는 --step--1처럼 쓴다", () => {
    expect(stepName(0)).toBe("--step-0");
    expect(stepName(3)).toBe("--step-3");
    expect(stepName(-1)).toBe("--step--1");
  });
});

describe("typeScaleToCss", () => {
  it("알려진 값: 16px, 1.25배, 위 2단계·아래 1단계", () => {
    expect(typeScaleToCss(scale({ up: 2, down: 1 }))).toBe(
      [
        ":root {",
        "  --step--1: 0.8rem;",
        "  --step-0: 1rem;",
        "  --step-1: 1.25rem;",
        "  --step-2: 1.5625rem;",
        "}",
      ].join("\n"),
    );
  });

  it("px 단위로도 만든다", () => {
    expect(typeScaleToCss(scale({ up: 1, down: 0, unit: "px" }))).toBe(
      ":root {\n  --step-0: 16px;\n  --step-1: 20px;\n}",
    );
  });

  it("대표 비율 6개가 모두 범위 안에 있다", () => {
    for (const r of RATIOS) {
      expect(r.value).toBeGreaterThanOrEqual(SCALE_LIMITS.ratio.min);
      expect(r.value).toBeLessThanOrEqual(SCALE_LIMITS.ratio.max);
    }
  });
});

describe("isTypeScaleState", () => {
  it("올바른 값만 통과시킨다", () => {
    expect(isTypeScaleState(DEFAULT_SCALE)).toBe(true);
    expect(isTypeScaleState({ ...DEFAULT_SCALE, unit: "em" })).toBe(false);
    expect(isTypeScaleState({ ...DEFAULT_SCALE, ratio: "1.25" })).toBe(false);
    expect(isTypeScaleState({ ...DEFAULT_SCALE, up: NaN })).toBe(false);
    expect(isTypeScaleState(null)).toBe(false);
  });
});

export type TypeScaleUnit = "rem" | "px";

export type TypeScaleState = {
  /** 기준(step 0) 글자 크기(px). */
  base: number;
  /** 단계마다 곱하는 비율. */
  ratio: number;
  /** 기준보다 큰 단계의 수. */
  up: number;
  /** 기준보다 작은 단계의 수. */
  down: number;
  unit: TypeScaleUnit;
};

export const SCALE_LIMITS = {
  base: { min: 12, max: 24 },
  ratio: { min: 1.05, max: 2 },
  up: { min: 0, max: 6 },
  down: { min: 0, max: 3 },
} as const;

/** 음악의 음정 이름에서 따온 대표 비율. */
export const RATIOS = [
  { value: 1.125, name: "Major Second" },
  { value: 1.2, name: "Minor Third" },
  { value: 1.25, name: "Major Third" },
  { value: 1.333, name: "Perfect Fourth" },
  { value: 1.5, name: "Perfect Fifth" },
  { value: 1.618, name: "Golden Ratio" },
] as const;

export const DEFAULT_SCALE: TypeScaleState = { base: 16, ratio: 1.25, up: 5, down: 2, unit: "rem" };

/** rem으로 바꿀 때 기준이 되는 브라우저 기본 글자 크기. */
export const ROOT_PX = 16;

const clampTo = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function clampTypeScale(s: TypeScaleState): TypeScaleState {
  const L = SCALE_LIMITS;
  return {
    base: Math.round(clampTo(s.base, L.base.min, L.base.max)),
    ratio: Number(clampTo(s.ratio, L.ratio.min, L.ratio.max).toFixed(3)),
    up: Math.round(clampTo(s.up, L.up.min, L.up.max)),
    down: Math.round(clampTo(s.down, L.down.min, L.down.max)),
    unit: s.unit === "px" ? "px" : "rem",
  };
}

export type ScaleStep = { step: number; px: number };

/** 가장 작은 단계부터 큰 단계까지. step 0이 기준 크기다. */
export function scaleSteps(s: TypeScaleState): ScaleStep[] {
  return Array.from({ length: s.down + s.up + 1 }, (_, i) => {
    const step = i - s.down;
    return { step, px: s.base * s.ratio ** step };
  });
}

/** 변수 이름. 음수 단계는 `--step--1`처럼 쓴다. */
export function stepName(step: number): string {
  return `--step-${step}`;
}

/** 소수 둘째(px) 또는 넷째(rem) 자리까지 쓰고 끝의 0은 뗀다. */
export function formatSize(px: number, unit: TypeScaleUnit): string {
  return unit === "px" ? `${Number(px.toFixed(2))}px` : `${Number((px / ROOT_PX).toFixed(4))}rem`;
}

export function typeScaleToCss(s: TypeScaleState): string {
  const lines = scaleSteps(s).map((t) => `  ${stepName(t.step)}: ${formatSize(t.px, s.unit)};`);
  return `:root {\n${lines.join("\n")}\n}`;
}

export function isTypeScaleState(d: unknown): d is TypeScaleState {
  if (typeof d !== "object" || d === null) return false;
  const r = d as Record<string, unknown>;
  return (
    (r.unit === "rem" || r.unit === "px") &&
    (["base", "ratio", "up", "down"] as const).every(
      (k) => typeof r[k] === "number" && Number.isFinite(r[k]),
    )
  );
}

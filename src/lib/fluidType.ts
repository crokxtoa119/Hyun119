export type FluidState = {
  /** 가장 좁은 화면에서의 글자 크기(px) */
  minSize: number;
  /** 가장 넓은 화면에서의 글자 크기(px) */
  maxSize: number;
  /** 글자가 커지기 시작하는 화면 너비(px) */
  minVw: number;
  /** 글자가 더 커지지 않는 화면 너비(px) */
  maxVw: number;
};

export const FLUID_LIMITS = {
  minSize: { min: 8, max: 96 },
  maxSize: { min: 8, max: 160 },
  minVw: { min: 240, max: 1200 },
  maxVw: { min: 320, max: 2560 },
} as const;

export const DEFAULT_FLUID: FluidState = { minSize: 16, maxSize: 24, minVw: 320, maxVw: 1200 };

/** rem으로 바꿀 때 기준이 되는 브라우저 기본 글자 크기 */
export const ROOT_PX = 16;

const clampTo = (n: number, min: number, max: number) => Math.round(Math.min(max, Math.max(min, n)));

/**
 * 각 값을 범위 안의 정수로 맞춘 뒤, 최대 크기가 최소 크기보다 작아지거나
 * 최대 너비가 최소 너비 이하가 되지 않게 올린다(기울기가 음수나 무한대가 되는 것을 막는다).
 */
export function clampFluid(s: FluidState): FluidState {
  const L = FLUID_LIMITS;
  const minSize = clampTo(s.minSize, L.minSize.min, L.minSize.max);
  const minVw = clampTo(s.minVw, L.minVw.min, L.minVw.max);
  return {
    minSize,
    minVw,
    maxSize: Math.max(minSize, clampTo(s.maxSize, L.maxSize.min, L.maxSize.max)),
    maxVw: Math.max(minVw + 1, clampTo(s.maxVw, L.maxVw.min, L.maxVw.max)),
  };
}

/** 화면 너비 1px당 글자 크기가 커지는 양(px). */
export function slope(s: FluidState): number {
  return (s.maxSize - s.minSize) / (s.maxVw - s.minVw);
}

/** 화면 너비 0일 때의 글자 크기(px). 기울기 직선의 절편이다. */
export function intercept(s: FluidState): number {
  return s.minSize - slope(s) * s.minVw;
}

/** 소수 넷째 자리까지 쓰고 끝의 0은 뗀다. */
function fmt(n: number): string {
  return String(Number(n.toFixed(4)));
}

const rem = (px: number) => `${fmt(px / ROOT_PX)}rem`;

/** 해당 화면 너비에서 실제로 적용되는 글자 크기(px). 최소·최대 사이로 제한된다. */
export function fluidSizeAt(s: FluidState, vw: number): number {
  return Math.min(s.maxSize, Math.max(s.minSize, intercept(s) + slope(s) * vw));
}

/** font-size 값. 크기가 같으면 고정값이라 clamp를 쓰지 않는다. */
export function fluidValue(s: FluidState): string {
  if (s.minSize === s.maxSize) return rem(s.minSize);
  return `clamp(${rem(s.minSize)}, ${rem(intercept(s))} + ${fmt(slope(s) * 100)}vw, ${rem(s.maxSize)})`;
}

export function fluidToCss(s: FluidState): string {
  return `font-size: ${fluidValue(s)};`;
}

export function isFluidState(d: unknown): d is FluidState {
  if (typeof d !== "object" || d === null) return false;
  const r = d as Record<string, unknown>;
  return (["minSize", "maxSize", "minVw", "maxVw"] as const).every(
    (k) => typeof r[k] === "number" && Number.isFinite(r[k]),
  );
}

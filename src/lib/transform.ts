export type TransformKey =
  | "translateX"
  | "translateY"
  | "rotate"
  | "scale"
  | "skewX"
  | "skewY"
  | "rotateX"
  | "rotateY";

export type TransformState = Record<TransformKey, number> & {
  /** 3D 원근(px). 0이면 perspective를 쓰지 않는다. */
  perspective: number;
};

type Spec = {
  key: TransformKey;
  /** CSS 함수 이름 */
  fn: string;
  label: string;
  unit: "px" | "deg" | "";
  min: number;
  max: number;
  /** 값이 정수가 아닐 때의 눈금. scale은 소수 둘째 자리까지. */
  step: number;
  neutral: number;
};

/** 이 순서대로 transform에 쓴다. 함수 순서가 바뀌면 결과도 달라지므로 고정한다. */
export const TRANSFORM_SPECS: Spec[] = [
  { key: "translateX", fn: "translateX", label: "가로 이동", unit: "px", min: -150, max: 150, step: 1, neutral: 0 },
  { key: "translateY", fn: "translateY", label: "세로 이동", unit: "px", min: -100, max: 100, step: 1, neutral: 0 },
  { key: "rotate", fn: "rotate", label: "회전", unit: "deg", min: -180, max: 180, step: 1, neutral: 0 },
  { key: "scale", fn: "scale", label: "크기", unit: "", min: 0.2, max: 2, step: 0.05, neutral: 1 },
  { key: "skewX", fn: "skewX", label: "가로 기울임", unit: "deg", min: -60, max: 60, step: 1, neutral: 0 },
  { key: "skewY", fn: "skewY", label: "세로 기울임", unit: "deg", min: -60, max: 60, step: 1, neutral: 0 },
  { key: "rotateX", fn: "rotateX", label: "X축 회전 (3D)", unit: "deg", min: -80, max: 80, step: 1, neutral: 0 },
  { key: "rotateY", fn: "rotateY", label: "Y축 회전 (3D)", unit: "deg", min: -80, max: 80, step: 1, neutral: 0 },
];

export const PERSPECTIVE = { min: 0, max: 1200, step: 50 } as const;

export const DEFAULT_TRANSFORM: TransformState = {
  ...(Object.fromEntries(TRANSFORM_SPECS.map((s) => [s.key, s.neutral])) as Record<TransformKey, number>),
  perspective: 600,
};

const round = (n: number, step: number) => Math.round(n / step) * step;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
// 부동소수점 오차(0.30000000000000004)가 CSS에 들어가지 않게 소수 둘째 자리로 맞춘다
const tidy = (n: number) => Number(n.toFixed(2));

/** 불러온 값이 범위를 벗어나도 슬라이더 범위와 눈금으로 맞춘다. */
export function clampTransform(t: TransformState): TransformState {
  const out = { ...t };
  for (const s of TRANSFORM_SPECS) out[s.key] = tidy(clamp(round(t[s.key], s.step), s.min, s.max));
  out.perspective = clamp(round(t.perspective, PERSPECTIVE.step), PERSPECTIVE.min, PERSPECTIVE.max);
  return out;
}

/** 3D 회전이 하나라도 있을 때만 perspective를 앞에 붙인다. 효과 없는 함수는 뺀다. 모두 기본값이면 none. */
export function transformValue(t: TransformState): string {
  const parts: string[] = [];
  const uses3d = t.rotateX !== 0 || t.rotateY !== 0;
  if (uses3d && t.perspective > 0) parts.push(`perspective(${t.perspective}px)`);
  for (const s of TRANSFORM_SPECS) {
    if (t[s.key] !== s.neutral) parts.push(`${s.fn}(${tidy(t[s.key])}${s.unit})`);
  }
  return parts.length ? parts.join(" ") : "none";
}

export function transformToCss(t: TransformState): string {
  return `transform: ${transformValue(t)};`;
}

export function isTransformState(d: unknown): d is TransformState {
  if (typeof d !== "object" || d === null) return false;
  const r = d as Record<string, unknown>;
  return (
    TRANSFORM_SPECS.every((s) => typeof r[s.key] === "number" && Number.isFinite(r[s.key])) &&
    typeof r.perspective === "number" &&
    Number.isFinite(r.perspective)
  );
}

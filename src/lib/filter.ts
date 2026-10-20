export type FilterKey =
  | "blur"
  | "brightness"
  | "contrast"
  | "grayscale"
  | "hueRotate"
  | "invert"
  | "saturate"
  | "sepia";

export type FilterState = Record<FilterKey, number>;

type Spec = {
  key: FilterKey;
  /** CSS 함수 이름 */
  fn: string;
  label: string;
  unit: "px" | "%" | "deg";
  min: number;
  max: number;
  /** 효과가 없는 값. CSS에서 생략한다. */
  neutral: number;
};

export const FILTER_SPECS: Spec[] = [
  { key: "blur", fn: "blur", label: "흐림", unit: "px", min: 0, max: 20, neutral: 0 },
  { key: "brightness", fn: "brightness", label: "밝기", unit: "%", min: 0, max: 200, neutral: 100 },
  { key: "contrast", fn: "contrast", label: "대비", unit: "%", min: 0, max: 200, neutral: 100 },
  { key: "grayscale", fn: "grayscale", label: "흑백", unit: "%", min: 0, max: 100, neutral: 0 },
  { key: "hueRotate", fn: "hue-rotate", label: "색조 회전", unit: "deg", min: 0, max: 360, neutral: 0 },
  { key: "invert", fn: "invert", label: "반전", unit: "%", min: 0, max: 100, neutral: 0 },
  { key: "saturate", fn: "saturate", label: "채도", unit: "%", min: 0, max: 200, neutral: 100 },
  { key: "sepia", fn: "sepia", label: "세피아", unit: "%", min: 0, max: 100, neutral: 0 },
];

export const DEFAULT_FILTER: FilterState = Object.fromEntries(
  FILTER_SPECS.map((s) => [s.key, s.neutral]),
) as FilterState;

/** 불러온 값이 범위를 벗어나도 슬라이더 범위로 맞춘다. */
export function clampFilter(f: FilterState): FilterState {
  const out = { ...f };
  for (const s of FILTER_SPECS) out[s.key] = Math.round(Math.min(s.max, Math.max(s.min, f[s.key])));
  return out;
}

/** 효과가 없는 함수는 빼고 `filter` 값만 만든다. 모두 기본값이면 none. */
export function filterValue(f: FilterState): string {
  const parts = FILTER_SPECS.filter((s) => f[s.key] !== s.neutral).map(
    (s) => `${s.fn}(${f[s.key]}${s.unit})`,
  );
  return parts.length ? parts.join(" ") : "none";
}

export function filterToCss(f: FilterState): string {
  return `filter: ${filterValue(f)};`;
}

export function isFilterState(d: unknown): d is FilterState {
  if (typeof d !== "object" || d === null) return false;
  const r = d as Record<string, unknown>;
  return FILTER_SPECS.every((s) => typeof r[s.key] === "number" && Number.isFinite(r[s.key]));
}

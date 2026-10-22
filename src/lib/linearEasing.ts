export const CURVES = [
  { value: "bounce", label: "바운스" },
  { value: "spring", label: "스프링" },
] as const;

export type CurveKind = (typeof CURVES)[number]["value"];

export type LinearEasingState = {
  curve: CurveKind;
  /** 바운스는 튀는 횟수, 스프링은 흔들리는 횟수. */
  count: number;
  /** 클수록 빨리 잦아든다. */
  damping: number;
  /** linear()에 적는 점의 개수. 많을수록 곡선에 가깝다. */
  points: number;
  /** 미리보기 재생 시간(초). */
  duration: number;
};

export const EASING_LIMITS = {
  count: { min: 1, max: 6 },
  damping: { min: 0, max: 100 },
  points: { min: 8, max: 64 },
  duration: { min: 0.4, max: 2 },
} as const;

export const DEFAULT_EASING: LinearEasingState = {
  curve: "bounce",
  count: 3,
  damping: 50,
  points: 32,
  duration: 0.8,
};

const clampTo = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const roundTo = (n: number, step: number) => Math.round(n / step) * step;

export function clampEasing(s: LinearEasingState): LinearEasingState {
  const L = EASING_LIMITS;
  return {
    curve: CURVES.some((c) => c.value === s.curve) ? s.curve : DEFAULT_EASING.curve,
    count: Math.round(clampTo(s.count, L.count.min, L.count.max)),
    damping: Math.round(clampTo(s.damping, L.damping.min, L.damping.max)),
    points: Math.round(clampTo(s.points, L.points.min, L.points.max)),
    duration: Number(roundTo(clampTo(s.duration, L.duration.min, L.duration.max), 0.1).toFixed(1)),
  };
}

/** 바운스가 튈 때마다 높이가 줄어드는 비율(반발 계수). 감쇠가 클수록 작다. */
const restitution = (damping: number) => 0.8 - 0.5 * (damping / 100);

/**
 * 떨어져서 count번 튀는 공의 높이. 0에서 시작해 1에서 끝난다.
 * 처음 낙하는 시간의 제곱으로 늘고, k번째 튐은 폭이 e^k, 높이가 e^(2k)인 포물선이다.
 */
function bounceAt(s: LinearEasingState, t: number): number {
  const e = restitution(s.damping);
  let total = 1;
  for (let k = 1; k <= s.count; k++) total += 2 * e ** k;
  const tau = t * total;
  if (tau <= 1) return tau * tau;
  let start = 1;
  for (let k = 1; k <= s.count; k++) {
    const w = e ** k;
    if (tau <= start + 2 * w || k === s.count) {
      const u = (tau - (start + w)) / w;
      return 1 - e ** (2 * k) * (1 - u * u);
    }
    start += 2 * w;
  }
  return 1;
}

/**
 * 1을 중심으로 count번 흔들리는 스프링. 흔들림의 크기는 (1 - t)^p로 줄어서
 * t=1에서 정확히 0이 되므로 끝값이 1로 딱 맞고, p가 클수록 빨리 잦아든다.
 */
function springAt(s: LinearEasingState, t: number): number {
  const p = 1 + (s.damping / 100) * 5;
  return 1 - Math.cos(2 * Math.PI * s.count * t) * (1 - t) ** p;
}

/** 진행도 t(0~1)에서의 값. 1을 넘거나 되돌아올 수 있다. */
export function curveAt(s: LinearEasingState, t: number): number {
  const x = clampTo(t, 0, 1);
  return s.curve === "bounce" ? bounceAt(s, x) : springAt(s, x);
}

/** 같은 간격으로 뽑은 점들. 처음은 항상 0, 끝은 항상 1이다. */
export function sampleEasing(s: LinearEasingState): number[] {
  const n = s.points;
  return Array.from({ length: n }, (_, i) => {
    if (i === 0) return 0;
    if (i === n - 1) return 1;
    return curveAt(s, i / (n - 1));
  });
}

/** 소수 셋째 자리까지 쓰고 끝의 0은 뗀다. -0은 0으로 쓴다. */
function fmt(n: number): string {
  const v = Number(n.toFixed(3));
  return String(v === 0 ? 0 : v);
}

export function linearValue(s: LinearEasingState): string {
  return `linear(${sampleEasing(s).map(fmt).join(", ")})`;
}

export function linearEasingToCss(s: LinearEasingState): string {
  return `.box {\n  transition: transform ${s.duration}s ${linearValue(s)};\n}`;
}

export function isLinearEasingState(d: unknown): d is LinearEasingState {
  if (typeof d !== "object" || d === null) return false;
  const r = d as Record<string, unknown>;
  return (
    CURVES.some((c) => c.value === r.curve) &&
    (["count", "damping", "points", "duration"] as const).every(
      (k) => typeof r[k] === "number" && Number.isFinite(r[k]),
    )
  );
}

import { isFiniteNumber, isRecord } from "./usePresets";

export type TweenProp = "x" | "rotation" | "opacity" | "scale";

export type TimelineTween = {
  /** 움직일 상자 번호 (0~2, 화면에는 1~3으로 표시) */
  box: number;
  prop: TweenProp;
  /** 도착 값. 출발 값은 상자의 현재 값이다. */
  to: number;
  /** 타임라인 시작 위치(초) */
  start: number;
  duration: number;
  ease: string;
};

export const MAX_TWEENS = 3;
export const BOX_COUNT = 3;

export const PROPS: Record<
  TweenProp,
  { label: string; min: number; max: number; step: number; initial: number; unit: string }
> = {
  x: { label: "x 이동", min: -100, max: 100, step: 5, initial: 100, unit: "px" },
  rotation: { label: "회전", min: -360, max: 360, step: 15, initial: 180, unit: "°" },
  opacity: { label: "투명도", min: 0, max: 1, step: 0.05, initial: 0.2, unit: "" },
  scale: { label: "크기", min: 0.2, max: 2, step: 0.1, initial: 1.6, unit: "×" },
};

export const PROP_KEYS = Object.keys(PROPS) as TweenProp[];

export const EASES = [
  "none",
  "power1.out",
  "power2.out",
  "power3.out",
  "power2.inOut",
  "sine.inOut",
  "expo.out",
  "back.out",
  "elastic.out",
  "bounce.out",
];

export const START_RANGE = { min: 0, max: 3, step: 0.1 };
export const DURATION_RANGE = { min: 0.2, max: 3, step: 0.1 };

export const DEFAULT_TWEENS: TimelineTween[] = [
  { box: 0, prop: "x", to: 100, start: 0, duration: 0.8, ease: "power2.out" },
  { box: 1, prop: "rotation", to: 180, start: 0.3, duration: 1, ease: "back.out" },
  { box: 2, prop: "scale", to: 1.6, start: 0.6, duration: 0.8, ease: "elastic.out" },
];

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function isTimelineTween(d: unknown): d is TimelineTween {
  return (
    isRecord(d) &&
    Number.isInteger(d.box) &&
    (d.box as number) >= 0 &&
    (d.box as number) < BOX_COUNT &&
    typeof d.prop === "string" &&
    PROP_KEYS.includes(d.prop as TweenProp) &&
    isFiniteNumber(d.to) &&
    isFiniteNumber(d.start) &&
    isFiniteNumber(d.duration) &&
    typeof d.ease === "string" &&
    EASES.includes(d.ease)
  );
}

/** 프리셋·공유 링크로 들어온 값 검사용 타입 가드. 트윈은 1~3개. */
export function isTimeline(d: unknown): d is TimelineTween[] {
  return Array.isArray(d) && d.length >= 1 && d.length <= MAX_TWEENS && d.every(isTimelineTween);
}

/** 슬라이더 범위를 벗어난 값을 범위 안으로 되돌린다. */
export function clampTween(t: TimelineTween): TimelineTween {
  const p = PROPS[t.prop];
  return {
    ...t,
    to: clamp(t.to, p.min, p.max),
    start: clamp(t.start, START_RANGE.min, START_RANGE.max),
    duration: clamp(t.duration, DURATION_RANGE.min, DURATION_RANGE.max),
  };
}

/** 모든 트윈이 끝나는 시각(초). */
export function totalDuration(tweens: TimelineTween[]): number {
  return tweens.reduce((max, t) => Math.max(max, t.start + t.duration), 0);
}

/** 부동소수점 오차(0.30000000000000004)를 지운 숫자. */
const num = (n: number) => +n.toFixed(2);

export function buildTimelineCode(tweens: TimelineTween[]): string {
  const calls = tweens.map(
    (t) =>
      `  .to(".box-${t.box + 1}", { ${t.prop}: ${num(t.to)}, duration: ${num(t.duration)}, ease: "${t.ease}" }, ${num(t.start)})`,
  );
  return `const tl = gsap.timeline();\n\ntl\n${calls.join("\n")};`;
}

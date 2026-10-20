export const EASINGS = ["linear", "ease", "ease-in", "ease-out", "ease-in-out"] as const;
export const ITERATIONS = ["1", "2", "3", "infinite"] as const;
export const DIRECTIONS = ["normal", "reverse", "alternate", "alternate-reverse"] as const;

export type Frame = {
  /** px */
  x: number;
  /** deg */
  rotate: number;
  /** % (100 = 원래 크기) */
  scale: number;
  /** % */
  opacity: number;
};

export type KeyframesState = {
  from: Frame;
  mid: Frame;
  /** 가운데 키프레임의 위치(%) */
  midAt: number;
  to: Frame;
  /** 초 */
  duration: number;
  easing: (typeof EASINGS)[number];
  iterations: (typeof ITERATIONS)[number];
  direction: (typeof DIRECTIONS)[number];
};

export const FRAME_LIMITS = {
  x: { min: -120, max: 120 },
  rotate: { min: -360, max: 360 },
  scale: { min: 20, max: 200 },
  opacity: { min: 0, max: 100 },
} as const;
export const FRAME_KEYS = ["x", "rotate", "scale", "opacity"] as const;
export const MID_AT = { min: 10, max: 90 } as const;
export const DURATION = { min: 0.2, max: 5 } as const;

export const DEFAULT_KEYFRAMES: KeyframesState = {
  from: { x: -100, rotate: 0, scale: 100, opacity: 100 },
  mid: { x: 0, rotate: 180, scale: 150, opacity: 60 },
  midAt: 50,
  to: { x: 100, rotate: 360, scale: 100, opacity: 100 },
  duration: 2,
  easing: "ease-in-out",
  iterations: "infinite",
  direction: "normal",
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

function clampFrame(f: Frame): Frame {
  const out = { ...f };
  for (const k of FRAME_KEYS) {
    out[k] = Math.round(clamp(f[k], FRAME_LIMITS[k].min, FRAME_LIMITS[k].max));
  }
  return out;
}

/** 불러온 값이 범위를 벗어나도 슬라이더 범위로 맞춘다. 시간은 소수 첫째 자리까지 쓴다. */
export function clampKeyframes(s: KeyframesState): KeyframesState {
  return {
    ...s,
    from: clampFrame(s.from),
    mid: clampFrame(s.mid),
    to: clampFrame(s.to),
    midAt: Math.round(clamp(s.midAt, MID_AT.min, MID_AT.max)),
    duration: Math.round(clamp(s.duration, DURATION.min, DURATION.max) * 10) / 10,
  };
}

function frameCss(at: number, f: Frame): string {
  return `  ${at}% { transform: translateX(${f.x}px) rotate(${f.rotate}deg) scale(${f.scale / 100}); opacity: ${f.opacity / 100}; }`;
}

export function keyframesRule(s: KeyframesState, name: string): string {
  return [
    `@keyframes ${name} {`,
    frameCss(0, s.from),
    frameCss(s.midAt, s.mid),
    frameCss(100, s.to),
    "}",
  ].join("\n");
}

export function animationDeclaration(s: KeyframesState, name: string): string {
  return `animation: ${name} ${s.duration}s ${s.easing} ${s.iterations} ${s.direction};`;
}

/** 복사용 CSS. 규칙 이름과 선택자는 사용자가 바로 바꿔 쓰기 쉬운 값으로 둔다. */
export function keyframesToCss(s: KeyframesState): string {
  return `${keyframesRule(s, "move")}\n\n.box {\n  ${animationDeclaration(s, "move")}\n}`;
}

const oneOf = <T extends string>(list: readonly T[], v: unknown): v is T =>
  typeof v === "string" && (list as readonly string[]).includes(v);

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

function isFrame(d: unknown): d is Frame {
  return typeof d === "object" && d !== null && FRAME_KEYS.every((k) => isNum((d as Record<string, unknown>)[k]));
}

export function isKeyframesState(d: unknown): d is KeyframesState {
  if (typeof d !== "object" || d === null) return false;
  const s = d as Record<string, unknown>;
  return (
    isFrame(s.from) &&
    isFrame(s.mid) &&
    isFrame(s.to) &&
    isNum(s.midAt) &&
    isNum(s.duration) &&
    oneOf(EASINGS, s.easing) &&
    oneOf(ITERATIONS, s.iterations) &&
    oneOf(DIRECTIONS, s.direction)
  );
}

export const EFFECTS = [
  { value: "fade-up", label: "아래에서 떠오름" },
  { value: "slide-left", label: "왼쪽에서 들어옴" },
  { value: "scale", label: "커지며 나타남" },
  { value: "rotate", label: "돌며 나타남" },
] as const;

export type ScrollEffect = (typeof EFFECTS)[number]["value"];

export const MODES = [
  { value: "play", label: "한 번 재생" },
  { value: "scrub", label: "스크롤 따라가기" },
] as const;

export type ScrollMode = (typeof MODES)[number]["value"];

export type ScrollTriggerState = {
  effect: ScrollEffect;
  mode: ScrollMode;
  /** 요소의 위쪽이 화면 위에서 이 퍼센트에 닿으면 시작한다. */
  start: number;
  /** scrub일 때 요소의 위쪽이 화면 위에서 이 퍼센트에 닿으면 끝난다. */
  end: number;
  /** scrub이 스크롤을 뒤따르는 시간(초). 0이면 스크롤에 딱 붙는다. */
  smooth: number;
  /** 아래에서 떠오름, 왼쪽에서 들어옴이 움직이는 거리(px). */
  distance: number;
};

export const SCROLL_LIMITS = {
  start: { min: 20, max: 100 },
  end: { min: 0, max: 95 },
  smooth: { min: 0, max: 3 },
  distance: { min: 0, max: 300 },
} as const;

/** start와 end 사이가 이보다 좁으면 scrub 구간이 너무 짧다. */
export const MIN_GAP = 5;

export const DEFAULT_SCROLL: ScrollTriggerState = {
  effect: "fade-up",
  mode: "scrub",
  start: 80,
  end: 40,
  smooth: 1,
  distance: 100,
};

const SELECTOR = ".box";
/** 움직이지 않는 부모. 움직이는 요소 자신을 trigger로 쓰면 이동한 만큼 시작 위치가 밀린다. */
const TRIGGER_SELECTOR = ".box-wrap";
const PLAY_DURATION = 0.8;

const clampTo = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const round = (n: number, step: number) => Math.round(n / step) * step;

/**
 * 각 값을 범위 안으로 맞춘다. 끝 지점은 시작 지점보다 MIN_GAP 이상 위에 있어야 한다
 * (같거나 아래면 스크롤 구간의 길이가 0 이하가 된다).
 */
export function clampScroll(s: ScrollTriggerState): ScrollTriggerState {
  const L = SCROLL_LIMITS;
  const start = Math.round(clampTo(s.start, L.start.min, L.start.max));
  return {
    effect: EFFECTS.some((e) => e.value === s.effect) ? s.effect : DEFAULT_SCROLL.effect,
    mode: MODES.some((m) => m.value === s.mode) ? s.mode : DEFAULT_SCROLL.mode,
    start,
    end: Math.min(start - MIN_GAP, Math.round(clampTo(s.end, L.end.min, L.end.max))),
    smooth: round(clampTo(s.smooth, L.smooth.min, L.smooth.max), 0.5),
    distance: Math.round(clampTo(s.distance, L.distance.min, L.distance.max)),
  };
}

type Vars = Record<string, number>;

/** 효과가 시작할 때와 끝났을 때의 값. */
export function effectVars(s: ScrollTriggerState): { from: Vars; to: Vars } {
  switch (s.effect) {
    case "slide-left":
      return { from: { x: -s.distance, opacity: 0 }, to: { x: 0, opacity: 1 } };
    case "scale":
      return { from: { scale: 0.5, opacity: 0 }, to: { scale: 1, opacity: 1 } };
    case "rotate":
      return { from: { rotation: -90, opacity: 0 }, to: { rotation: 0, opacity: 1 } };
    default:
      return { from: { y: s.distance, opacity: 0 }, to: { y: 0, opacity: 1 } };
  }
}

/** scrollTrigger 옵션 중 trigger와 scroller를 뺀 나머지. 미리보기와 코드가 같은 값을 쓴다. */
export function triggerVars(s: ScrollTriggerState): Record<string, string | number | boolean> {
  const start = `top ${s.start}%`;
  if (s.mode === "play") return { start, toggleActions: "play none none reverse" };
  return { start, end: `top ${s.end}%`, scrub: s.smooth === 0 ? true : s.smooth };
}

/** 애니메이션 옵션 중 scrollTrigger를 뺀 나머지. */
export function tweenVars(s: ScrollTriggerState): Record<string, string | number> {
  return s.mode === "play"
    ? { ...effectVars(s).to, duration: PLAY_DURATION, ease: "power3.out" }
    : { ...effectVars(s).to, ease: "none" };
}

const literal = (v: string | number | boolean) => (typeof v === "string" ? JSON.stringify(v) : String(v));

const objectLines = (o: Record<string, string | number | boolean>, indent: string) =>
  Object.entries(o).map(([k, v]) => `${indent}${k}: ${literal(v)},`);

const inline = (o: Record<string, string | number>) =>
  `{ ${Object.entries(o)
    .map(([k, v]) => `${k}: ${literal(v)}`)
    .join(", ")} }`;

export function scrollTriggerToJs(s: ScrollTriggerState): string {
  const { from } = effectVars(s);
  return [
    "gsap.registerPlugin(ScrollTrigger);",
    "",
    "gsap.fromTo(",
    `  "${SELECTOR}",`,
    `  ${inline(from)},`,
    "  {",
    ...objectLines(tweenVars(s), "    "),
    "    scrollTrigger: {",
    `      trigger: "${TRIGGER_SELECTOR}",`,
    ...objectLines(triggerVars(s), "      "),
    "    },",
    "  },",
    ");",
  ].join("\n");
}

export function isScrollTriggerState(d: unknown): d is ScrollTriggerState {
  if (typeof d !== "object" || d === null) return false;
  const r = d as Record<string, unknown>;
  return (
    EFFECTS.some((e) => e.value === r.effect) &&
    MODES.some((m) => m.value === r.mode) &&
    (["start", "end", "smooth", "distance"] as const).every(
      (k) => typeof r[k] === "number" && Number.isFinite(r[k]),
    )
  );
}

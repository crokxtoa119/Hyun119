export const AXES = ["x", "y"] as const;
export const SNAP_TYPES = ["mandatory", "proximity"] as const;
export const SNAP_ALIGNS = ["start", "center", "end"] as const;

export type ScrollSnapState = {
  axis: (typeof AXES)[number];
  /** mandatory: 항상 가장 가까운 지점에 멈춘다, proximity: 가까울 때만 붙는다 */
  type: (typeof SNAP_TYPES)[number];
  align: (typeof SNAP_ALIGNS)[number];
  items: number;
  /** 아이템 크기(스크롤 방향, 컨테이너 대비 %) */
  size: number;
  /** px */
  gap: number;
  /** scroll-padding, px */
  padding: number;
};

export const LIMITS = {
  items: { min: 3, max: 10 },
  size: { min: 30, max: 100 },
  gap: { min: 0, max: 32 },
  padding: { min: 0, max: 48 },
} as const;

/** 세로 스크롤일 때 컨테이너에 주는 높이(px). 높이가 있어야 세로로 스크롤된다. */
export const Y_HEIGHT = 280;

export const DEFAULT_SCROLL_SNAP: ScrollSnapState = {
  axis: "x",
  type: "mandatory",
  align: "center",
  items: 6,
  size: 60,
  gap: 16,
  padding: 0,
};

const clampInt = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(n)));

/** 불러온 값이 범위를 벗어나도 슬라이더 범위로 맞춘다. */
export function clampScrollSnap(s: ScrollSnapState): ScrollSnapState {
  return {
    ...s,
    items: clampInt(s.items, LIMITS.items.min, LIMITS.items.max),
    size: clampInt(s.size, LIMITS.size.min, LIMITS.size.max),
    gap: clampInt(s.gap, LIMITS.gap.min, LIMITS.gap.max),
    padding: clampInt(s.padding, LIMITS.padding.min, LIMITS.padding.max),
  };
}

/** 컨테이너에 주는 선언 목록. 복사용 CSS와 미리보기가 같은 값을 쓰도록 한 곳에서 만든다. */
export function containerDeclarations(s: ScrollSnapState): [string, string][] {
  const decls: [string, string][] = [
    ["display", "flex"],
    ["flex-direction", s.axis === "x" ? "row" : "column"],
    [s.axis === "x" ? "overflow-x" : "overflow-y", "auto"],
    ["scroll-snap-type", `${s.axis} ${s.type}`],
  ];
  if (s.axis === "y") decls.push(["height", `${Y_HEIGHT}px`]);
  if (s.gap > 0) decls.push(["gap", `${s.gap}px`]);
  if (s.padding > 0) decls.push(["scroll-padding", `${s.padding}px`]);
  return decls;
}

export function itemDeclarations(s: ScrollSnapState): [string, string][] {
  return [
    ["flex", `0 0 ${s.size}%`],
    ["scroll-snap-align", s.align],
  ];
}

export function scrollSnapToCss(s: ScrollSnapState): string {
  const block = (sel: string, decls: [string, string][]) =>
    `${sel} {\n${decls.map(([k, v]) => `  ${k}: ${v};`).join("\n")}\n}`;
  return `${block(".scroller", containerDeclarations(s))}\n\n${block(".item", itemDeclarations(s))}`;
}

const oneOf = <T extends string>(list: readonly T[], v: unknown): v is T =>
  typeof v === "string" && (list as readonly string[]).includes(v);

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

export function isScrollSnapState(d: unknown): d is ScrollSnapState {
  if (typeof d !== "object" || d === null) return false;
  const s = d as Record<string, unknown>;
  return (
    oneOf(AXES, s.axis) &&
    oneOf(SNAP_TYPES, s.type) &&
    oneOf(SNAP_ALIGNS, s.align) &&
    isNum(s.items) &&
    isNum(s.size) &&
    isNum(s.gap) &&
    isNum(s.padding)
  );
}

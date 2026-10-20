export const DIRECTIONS = ["row", "row-reverse", "column", "column-reverse"] as const;
export const WRAPS = ["nowrap", "wrap", "wrap-reverse"] as const;
export const JUSTIFIES = [
  "flex-start",
  "center",
  "flex-end",
  "space-between",
  "space-around",
  "space-evenly",
] as const;
export const ALIGNS = ["stretch", "flex-start", "center", "flex-end", "baseline"] as const;

export type FlexState = {
  direction: (typeof DIRECTIONS)[number];
  wrap: (typeof WRAPS)[number];
  justify: (typeof JUSTIFIES)[number];
  align: (typeof ALIGNS)[number];
  /** px */
  gap: number;
  items: number;
};

export const GAP_MAX = 48;
export const ITEMS_MIN = 1;
export const ITEMS_MAX = 12;

export const DEFAULT_FLEX: FlexState = {
  direction: "row",
  wrap: "nowrap",
  justify: "flex-start",
  align: "stretch",
  gap: 12,
  items: 4,
};

const clampInt = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(n)));

/** 불러온 값이 범위를 벗어나도 슬라이더 범위로 맞춘다. */
export function clampFlex(s: FlexState): FlexState {
  return { ...s, gap: clampInt(s.gap, 0, GAP_MAX), items: clampInt(s.items, ITEMS_MIN, ITEMS_MAX) };
}

/** 기본값과 같은 속성은 생략해 짧은 CSS를 만든다. display는 항상 쓴다. */
export function flexToCss(s: FlexState): string {
  const lines = ["display: flex;"];
  if (s.direction !== DEFAULT_FLEX.direction) lines.push(`flex-direction: ${s.direction};`);
  if (s.wrap !== DEFAULT_FLEX.wrap) lines.push(`flex-wrap: ${s.wrap};`);
  if (s.justify !== DEFAULT_FLEX.justify) lines.push(`justify-content: ${s.justify};`);
  if (s.align !== DEFAULT_FLEX.align) lines.push(`align-items: ${s.align};`);
  if (s.gap > 0) lines.push(`gap: ${s.gap}px;`);
  return lines.join("\n");
}

const oneOf = <T extends string>(list: readonly T[], v: unknown): v is T =>
  typeof v === "string" && (list as readonly string[]).includes(v);

export function isFlexState(d: unknown): d is FlexState {
  if (typeof d !== "object" || d === null) return false;
  const s = d as Record<string, unknown>;
  return (
    oneOf(DIRECTIONS, s.direction) &&
    oneOf(WRAPS, s.wrap) &&
    oneOf(JUSTIFIES, s.justify) &&
    oneOf(ALIGNS, s.align) &&
    typeof s.gap === "number" &&
    Number.isFinite(s.gap) &&
    typeof s.items === "number" &&
    Number.isFinite(s.items)
  );
}

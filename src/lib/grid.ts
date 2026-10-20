export const MODES = ["fixed", "auto-fit"] as const;
export const ITEM_ALIGNS = ["stretch", "start", "center", "end"] as const;

export type GridState = {
  /** fixed: 열 개수를 고정, auto-fit: 최소 너비 기준으로 열 개수가 자동으로 정해진다 */
  mode: (typeof MODES)[number];
  columns: number;
  /** px. 한 줄(행)의 높이 */
  rowHeight: number;
  /** px */
  columnGap: number;
  /** px */
  rowGap: number;
  justify: (typeof ITEM_ALIGNS)[number];
  align: (typeof ITEM_ALIGNS)[number];
  items: number;
  /** 첫 아이템이 두 칸을 차지하게 한다 */
  span: boolean;
};

export const LIMITS = {
  columns: { min: 1, max: 6 },
  rowHeight: { min: 40, max: 160 },
  gap: { min: 0, max: 48 },
  items: { min: 1, max: 24 },
} as const;

/** auto-fit일 때 칸의 최소 너비(px) */
export const MIN_COLUMN = 96;

export const DEFAULT_GRID: GridState = {
  mode: "fixed",
  columns: 3,
  rowHeight: 72,
  columnGap: 12,
  rowGap: 12,
  justify: "stretch",
  align: "stretch",
  items: 7,
  span: false,
};

const clampInt = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(n)));

/** 불러온 값이 범위를 벗어나도 슬라이더 범위로 맞춘다. */
export function clampGrid(s: GridState): GridState {
  return {
    ...s,
    columns: clampInt(s.columns, LIMITS.columns.min, LIMITS.columns.max),
    rowHeight: clampInt(s.rowHeight, LIMITS.rowHeight.min, LIMITS.rowHeight.max),
    columnGap: clampInt(s.columnGap, LIMITS.gap.min, LIMITS.gap.max),
    rowGap: clampInt(s.rowGap, LIMITS.gap.min, LIMITS.gap.max),
    items: clampInt(s.items, LIMITS.items.min, LIMITS.items.max),
  };
}

export function templateColumns(s: GridState): string {
  return s.mode === "fixed"
    ? `repeat(${s.columns}, 1fr)`
    : `repeat(auto-fit, minmax(${MIN_COLUMN}px, 1fr))`;
}

/** 두 간격이 같으면 하나로 줄이고, 다르면 `행 열` 순서로 쓴다. */
export function gapValue(s: GridState): string {
  return s.rowGap === s.columnGap ? `${s.rowGap}px` : `${s.rowGap}px ${s.columnGap}px`;
}

/** 기본값(stretch)과 같은 정렬은 생략한다. 첫 아이템 span은 별도 규칙으로 쓴다. */
export function gridToCss(s: GridState): string {
  const lines = [
    "display: grid;",
    `grid-template-columns: ${templateColumns(s)};`,
    `grid-auto-rows: ${s.rowHeight}px;`,
  ];
  if (s.rowGap > 0 || s.columnGap > 0) lines.push(`gap: ${gapValue(s)};`);
  if (s.justify !== "stretch") lines.push(`justify-items: ${s.justify};`);
  if (s.align !== "stretch") lines.push(`align-items: ${s.align};`);
  let css = `.container {\n${lines.map((l) => `  ${l}`).join("\n")}\n}`;
  if (s.span) css += "\n\n.item:first-child {\n  grid-column: span 2;\n}";
  return css;
}

const oneOf = <T extends string>(list: readonly T[], v: unknown): v is T =>
  typeof v === "string" && (list as readonly string[]).includes(v);

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

export function isGridState(d: unknown): d is GridState {
  if (typeof d !== "object" || d === null) return false;
  const s = d as Record<string, unknown>;
  return (
    oneOf(MODES, s.mode) &&
    isNum(s.columns) &&
    isNum(s.rowHeight) &&
    isNum(s.columnGap) &&
    isNum(s.rowGap) &&
    oneOf(ITEM_ALIGNS, s.justify) &&
    oneOf(ITEM_ALIGNS, s.align) &&
    isNum(s.items) &&
    typeof s.span === "boolean"
  );
}

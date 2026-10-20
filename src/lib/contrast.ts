export type Rgb = [number, number, number];

export type ContrastState = { fg: string; bg: string };

export const DEFAULT_CONTRAST: ContrastState = { fg: "#595959", bg: "#FFFFFF" };

/** "#RGB" 또는 "#RRGGBB"(# 생략 가능)를 "#RRGGBB" 대문자로 바꾼다. 형식이 틀리면 null. */
export function normalizeHex(input: string): string | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(input.trim());
  if (!m) return null;
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join("") : m[1];
  return `#${h.toUpperCase()}`;
}

export function hexToRgb(hex: string): Rgb {
  const h = normalizeHex(hex);
  if (!h) throw new Error(`잘못된 색상: ${hex}`);
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb;
}

export function rgbToHex([r, g, b]: Rgb): string {
  return `#${[r, g, b]
    .map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0"))
    .join("")}`.toUpperCase();
}

/** WCAG 2.x 상대 휘도(0~1). */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** 두 색의 명암비(1~21). 순서와 무관하다. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export type Grades = {
  /** 일반 글자 AA (4.5:1) */
  aa: boolean;
  /** 큰 글자 AA (3:1) */
  aaLarge: boolean;
  /** 일반 글자 AAA (7:1) */
  aaa: boolean;
  /** 큰 글자 AAA (4.5:1) */
  aaaLarge: boolean;
  /** UI 구성요소·그래픽 (3:1) */
  ui: boolean;
};

export function gradeContrast(ratio: number): Grades {
  return {
    aa: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaa: ratio >= 7,
    aaaLarge: ratio >= 4.5,
    ui: ratio >= 3,
  };
}

/** 소수 둘째 자리에서 내림한다(반올림하면 4.499가 4.5로 보여 AA를 통과한 것처럼 오해한다). */
export function formatRatio(ratio: number): string {
  return `${(Math.floor(ratio * 100) / 100).toFixed(2)}:1`;
}

/**
 * 전경색의 색조를 유지한 채 명도만 조절해 목표 명암비를 처음 넘는 색을 찾는다.
 * 흑/백으로도 못 넘으면 가장 가까운 극단값을 돌려준다.
 */
export function suggestForeground(fg: string, bg: string, target = 4.5): string {
  if (contrastRatio(fg, bg) >= target) return normalizeHex(fg)!;
  const bgDark = relativeLuminance(bg) < 0.18;
  const end: Rgb = bgDark ? [255, 255, 255] : [0, 0, 0];
  const start = hexToRgb(fg);
  for (let i = 1; i <= 100; i++) {
    const t = i / 100;
    const cand = rgbToHex(start.map((v, k) => v + (end[k] - v) * t) as Rgb);
    if (contrastRatio(cand, bg) >= target) return cand;
  }
  return rgbToHex(end);
}

export function isContrastState(d: unknown): d is ContrastState {
  return (
    typeof d === "object" &&
    d !== null &&
    typeof (d as ContrastState).fg === "string" &&
    typeof (d as ContrastState).bg === "string" &&
    normalizeHex((d as ContrastState).fg) !== null &&
    normalizeHex((d as ContrastState).bg) !== null
  );
}

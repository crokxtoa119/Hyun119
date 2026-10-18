export type HSL = { h: number; s: number; l: number };

export type Harmony =
  | "analogous"
  | "complementary"
  | "triadic"
  | "split"
  | "monochrome";

export const HARMONIES: { value: Harmony; label: string }[] = [
  { value: "analogous", label: "유사색" },
  { value: "complementary", label: "보색" },
  { value: "triadic", label: "삼각 배색" },
  { value: "split", label: "분할 보색" },
  { value: "monochrome", label: "단색 명도" },
];

const wrap = (h: number) => ((h % 360) + 360) % 360;
const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));

export function hslToHex({ h, s, l }: HSL): string {
  const sat = s / 100;
  const lig = l / 100;
  const a = sat * Math.min(lig, 1 - lig);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = lig - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

/** "#RRGGBB"와 0~1 알파를 "rgba(r, g, b, a)" 문자열로 바꾼다. */
export function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${Number(alpha.toFixed(2))})`;
}

/** 상대 휘도 기반으로 위에 올릴 글자색(흑/백)을 고른다. */
export function readableTextColor(hex: string): "#000000" | "#FFFFFF" {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.4 ? "#000000" : "#FFFFFF";
}

export function generatePalette(base: HSL, harmony: Harmony): HSL[] {
  const { h, s, l } = base;
  switch (harmony) {
    case "analogous":
      return [-60, -30, 0, 30, 60].map((d) => ({ h: wrap(h + d), s, l }));
    case "complementary":
      return [
        { h, s, l: clamp(l - 20) },
        { h, s, l },
        { h, s: clamp(s - 20), l: clamp(l + 20) },
        { h: wrap(h + 180), s, l: clamp(l - 10) },
        { h: wrap(h + 180), s, l },
      ];
    case "triadic":
      return [
        { h, s, l },
        { h, s: clamp(s - 25), l: clamp(l + 20) },
        { h: wrap(h + 120), s, l },
        { h: wrap(h + 240), s, l },
        { h: wrap(h + 240), s: clamp(s - 25), l: clamp(l + 20) },
      ];
    case "split":
      return [
        { h, s, l },
        { h: wrap(h + 150), s, l },
        { h: wrap(h + 210), s, l },
        { h: wrap(h + 150), s: clamp(s - 25), l: clamp(l + 20) },
        { h: wrap(h + 210), s: clamp(s - 25), l: clamp(l + 20) },
      ];
    case "monochrome":
      return [20, 35, 50, 65, 80].map((lightness) => ({ h, s, l: lightness }));
  }
}

export function randomBase(): HSL {
  return {
    h: Math.floor(Math.random() * 360),
    s: 55 + Math.floor(Math.random() * 35),
    l: 45 + Math.floor(Math.random() * 15),
  };
}

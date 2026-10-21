import { normalizeHex } from "./contrast";

export type ConvState = {
  /** 사용자가 입력한 색 문자열. hex, rgb(), hsl(), oklch() 중 하나다. */
  input: string;
};

export const DEFAULT_CONV: ConvState = { input: "#4F46E5" };

/** 0~1 범위로 가정하지 않는 sRGB 값(0~255). 색 영역을 벗어나면 범위 밖 값이 될 수 있다. */
export type Rgb = { r: number; g: number; b: number };

export type Formats = {
  hex: string;
  rgb: string;
  hsl: string;
  oklch: string;
  /** sRGB 색 영역 안의 색인지. false면 hex·rgb·hsl은 가장 가까운 값으로 잘라 낸 것이다. */
  inGamut: boolean;
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** 소수 자리를 제한하고 끝의 0은 뗀다. */
function fmt(n: number, digits: number): string {
  const v = Number(n.toFixed(digits));
  return String(Object.is(v, -0) ? 0 : v);
}

// ---- sRGB <-> 선형 sRGB

const toLinear = (v: number) => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const fromLinear = (c: number) => {
  const v = c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
  return v * 255;
};

// ---- sRGB <-> OKLab/OKLCH (Björn Ottosson의 정의)

export function rgbToOklch({ r, g, b }: Rgb): { l: number; c: number; h: number } {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const c = Math.hypot(A, B);
  // 무채색에서는 색상 각도가 의미 없고 계산 오차만 남으므로 0으로 둔다
  const h = c < 1e-4 ? 0 : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  return { l: L, c, h };
}

export function oklchToRgb(l: number, c: number, h: number): Rgb {
  const A = c * Math.cos((h * Math.PI) / 180);
  const B = c * Math.sin((h * Math.PI) / 180);
  const l_ = (l + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m_ = (l - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s_ = (l - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return {
    r: fromLinear(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_),
    g: fromLinear(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_),
    b: fromLinear(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_),
  };
}

// ---- sRGB <-> HSL

export function rgbToHsl({ r, g, b }: Rgb): { h: number; s: number; l: number } {
  const [R, G, B] = [r, g, b].map((v) => v / 255);
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const d = max - min;
  const l = (max + min) / 2;
  if (d === 0) return { h: 0, s: 0, l: l * 100 };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === R) h = ((G - B) / d) % 6;
  else if (max === G) h = (B - R) / d + 2;
  else h = (R - G) / d + 4;
  return { h: (h * 60 + 360) % 360, s: s * 100, l: l * 100 };
}

export function hslToRgb(h: number, s: number, l: number): Rgb {
  const S = s / 100;
  const L = l / 100;
  const a = S * Math.min(L, 1 - L);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return (L - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)) * 255;
  };
  return { r: f(0), g: f(8), b: f(4) };
}

// ---- 문자열 해석

const NUM = "[+-]?(?:\\d+\\.?\\d*|\\.\\d+)";

/** "rgb(1, 2, 3)", "rgb(1 2 3)", "hsl(...)", "oklch(...)"의 인자 부분만 뽑는다. 쉼표와 공백, "/ 알파"를 허용한다. */
function args(fn: string, text: string): string[] | null {
  const m = new RegExp(`^${fn}\\(\\s*([^)]*?)\\s*\\)$`, "i").exec(text.trim());
  if (!m) return null;
  const body = m[1].split("/")[0]; // 알파는 쓰지 않는다
  const parts = body.split(/[\s,]+/).filter(Boolean);
  return parts.length === 3 ? parts : null;
}

const numRe = new RegExp(`^${NUM}(%|deg)?$`, "i");

/** "12", "12%", "12deg"를 숫자와 단위로 나눈다. 숫자가 아니면 null. */
function num(token: string): { v: number; unit: "" | "%" | "deg" } | null {
  const m = numRe.exec(token);
  if (!m) return null;
  return { v: parseFloat(token), unit: (m[1]?.toLowerCase() ?? "") as "" | "%" | "deg" };
}

/** 색 문자열을 sRGB로 해석한다. 지원하지 않는 형식이거나 값이 이상하면 null. */
export function parseColor(input: string): Rgb | null {
  const hex = normalizeHex(input);
  if (hex) {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    return { r, g, b };
  }

  const rgb = args("rgb", input) ?? args("rgba", input);
  if (rgb) {
    const vals = rgb.map(num);
    if (vals.some((x) => x === null || x.unit === "deg")) return null;
    const [r, g, b] = (vals as NonNullable<(typeof vals)[number]>[]).map((x) =>
      x.unit === "%" ? (x.v / 100) * 255 : x.v,
    );
    return { r: clamp(r, 0, 255), g: clamp(g, 0, 255), b: clamp(b, 0, 255) };
  }

  const hsl = args("hsl", input) ?? args("hsla", input);
  if (hsl) {
    const [h, s, l] = hsl.map(num);
    if (!h || !s || !l || h.unit === "%" || s.unit === "deg" || l.unit === "deg") return null;
    return hslToRgb(((h.v % 360) + 360) % 360, clamp(s.v, 0, 100), clamp(l.v, 0, 100));
  }

  const ok = args("oklch", input);
  if (ok) {
    const [l, c, h] = ok.map(num);
    if (!l || !c || !h || l.unit === "deg" || c.unit === "deg" || h.unit === "%") return null;
    const L = l.unit === "%" ? l.v / 100 : l.v;
    const C = c.unit === "%" ? (c.v / 100) * 0.4 : c.v;
    if (L < 0 || L > 1 || C < 0) return null;
    return oklchToRgb(L, C, ((h.v % 360) + 360) % 360);
  }

  return null;
}

// ---- 출력

const inRange = (v: number) => v >= -0.5 && v <= 255.5;

/** 한 색을 네 가지 CSS 표기로 바꾼다. */
export function convertColor(input: string): Formats | null {
  const rgb = parseColor(input);
  if (!rgb) return null;
  const inGamut = inRange(rgb.r) && inRange(rgb.g) && inRange(rgb.b);
  const clipped: Rgb = {
    r: Math.round(clamp(rgb.r, 0, 255)),
    g: Math.round(clamp(rgb.g, 0, 255)),
    b: Math.round(clamp(rgb.b, 0, 255)),
  };
  const hex = `#${[clipped.r, clipped.g, clipped.b]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")}`.toUpperCase();
  const hsl = rgbToHsl(clipped);
  // OKLCH는 색 영역 밖의 값도 그대로 표현할 수 있으므로 자르지 않은 값에서 계산한다
  const ok = rgbToOklch(rgb);
  return {
    hex,
    rgb: `rgb(${clipped.r}, ${clipped.g}, ${clipped.b})`,
    hsl: `hsl(${fmt(hsl.h, 0)}, ${fmt(hsl.s, 0)}%, ${fmt(hsl.l, 0)}%)`,
    oklch: `oklch(${fmt(ok.l * 100, 1)}% ${fmt(ok.c, 4)} ${fmt(ok.h, 1)})`,
    inGamut,
  };
}

export function convToCss(f: Formats): string {
  return [f.hex, f.rgb, f.hsl, f.oklch].map((v) => `color: ${v};`).join("\n");
}

export function isConvState(d: unknown): d is ConvState {
  return (
    typeof d === "object" &&
    d !== null &&
    typeof (d as ConvState).input === "string" &&
    parseColor((d as ConvState).input) !== null
  );
}

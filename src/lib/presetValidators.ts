import { HARMONIES, type Harmony, type HSL } from "./color";
import { RADIUS_KEYS, type Radius } from "./radius";
import { isFiniteNumber, isRecord } from "./usePresets";

// 프리셋을 검증하는 타입 가드 모음. 화면 컴포넌트(GSAP 등을 끌어오는 파일)에 두면
// 설정 모달 같은 곳에서 가져다 쓸 수 없어서 순수 모듈로 분리했다.
// 허용하는 값의 목록은 여기가 원본이고, 컴포넌트는 이 목록에 이름표(label)만 붙여 쓴다.

const HEX = /^#[0-9a-f]{6}$/i;

// ── Palette ─────────────────────────────────────────────
export type PalettePreset = HSL & { harmony: Harmony };

export function isPalettePreset(d: unknown): d is PalettePreset {
  return (
    isRecord(d) &&
    isFiniteNumber(d.h) &&
    isFiniteNumber(d.s) &&
    isFiniteNumber(d.l) &&
    HARMONIES.some((h) => h.value === d.harmony)
  );
}

// ── Gradient ────────────────────────────────────────────
export const GRADIENT_KINDS = ["linear", "radial", "conic"] as const;
export type GradientKind = (typeof GRADIENT_KINDS)[number];
export type GradientPreset = {
  kind: GradientKind;
  angle: number;
  stops: { color: string; pos: number }[];
};

export function isGradientPreset(d: unknown): d is GradientPreset {
  return (
    isRecord(d) &&
    GRADIENT_KINDS.some((k) => k === d.kind) &&
    isFiniteNumber(d.angle) &&
    Array.isArray(d.stops) &&
    d.stops.length >= 2 &&
    d.stops.length <= 5 &&
    d.stops.every(
      (s) =>
        isRecord(s) && typeof s.color === "string" && HEX.test(s.color) && isFiniteNumber(s.pos),
    )
  );
}

// ── Easing ──────────────────────────────────────────────
export const EASING_FAMILY_KEYS = [
  "power1",
  "power2",
  "power3",
  "power4",
  "sine",
  "expo",
  "circ",
  "back",
  "elastic",
  "bounce",
] as const;
export const EASING_DIRECTIONS = ["in", "out", "inOut"] as const;
export type EasingDirection = (typeof EASING_DIRECTIONS)[number];
export type EasingPreset = { family: string; direction: EasingDirection; duration: number };

export function isEasingPreset(d: unknown): d is EasingPreset {
  return (
    isRecord(d) &&
    EASING_FAMILY_KEYS.some((f) => f === d.family) &&
    EASING_DIRECTIONS.some((x) => x === d.direction) &&
    isFiniteNumber(d.duration)
  );
}

// ── Typography ──────────────────────────────────────────
export const TYPOGRAPHY_FONT_KEYS = [
  "geist",
  "grotesk",
  "playfair",
  "fraunces",
  "notosans",
  "notoserif",
  "mono",
] as const;
export const TYPOGRAPHY_ALIGNS = ["left", "center", "right"] as const;
export type TypographyAlign = (typeof TYPOGRAPHY_ALIGNS)[number];
export type TypographyPreset = {
  fontKey: string;
  text: string;
  size: number;
  weight: number;
  tracking: number;
  leading: number;
  align: TypographyAlign;
};

export function isTypographyPreset(d: unknown): d is TypographyPreset {
  return (
    isRecord(d) &&
    TYPOGRAPHY_FONT_KEYS.some((k) => k === d.fontKey) &&
    typeof d.text === "string" &&
    isFiniteNumber(d.size) &&
    isFiniteNumber(d.weight) &&
    isFiniteNumber(d.tracking) &&
    isFiniteNumber(d.leading) &&
    TYPOGRAPHY_ALIGNS.some((a) => a === d.align)
  );
}

// ── Shadow & Glass ──────────────────────────────────────
export const SHADOW_MODES = ["shadow", "glass"] as const;
export type ShadowMode = (typeof SHADOW_MODES)[number];
export type ShadowPreset = {
  mode: ShadowMode;
  x: number;
  y: number;
  blur: number;
  spread: number;
  shadowColor: string;
  shadowAlpha: number;
  inset: boolean;
  glassBlur: number;
  glassAlpha: number;
  borderAlpha: number;
  saturate: number;
  tint: string;
};

const SHADOW_NUMBER_KEYS = [
  "x",
  "y",
  "blur",
  "spread",
  "shadowAlpha",
  "glassBlur",
  "glassAlpha",
  "borderAlpha",
  "saturate",
] as const;

export function isShadowPreset(d: unknown): d is ShadowPreset {
  return (
    isRecord(d) &&
    SHADOW_MODES.some((m) => m === d.mode) &&
    SHADOW_NUMBER_KEYS.every((k) => isFiniteNumber(d[k])) &&
    typeof d.inset === "boolean" &&
    typeof d.shadowColor === "string" &&
    HEX.test(d.shadowColor) &&
    typeof d.tint === "string" &&
    HEX.test(d.tint)
  );
}

// ── Border Radius ───────────────────────────────────────
export type RadiusPreset = Radius & { linked: boolean };

export function isRadiusPreset(d: unknown): d is RadiusPreset {
  return (
    isRecord(d) && typeof d.linked === "boolean" && RADIUS_KEYS.every((k) => isFiniteNumber(d[k]))
  );
}

import { HARMONIES, generatePalette, hslToHex, readableTextColor, type Harmony } from "./color";
import { FONTS, fontByKey } from "./fontOptions";
import { gradientCss } from "./gradient";
import {
  isGradientPreset,
  isPalettePreset,
  type GradientPreset,
  type PalettePreset,
  type RadiusPreset,
  type ShadowPreset,
  type TypographyPreset,
} from "./presetValidators";
import { RADIUS_KEYS, clampRadius, radiusValue, type Radius } from "./radius";
import { boxShadowValue, type BoxShadow } from "./shadowCss";
import {
  DEFAULT_SCALE,
  clampTypeScale,
  formatSize,
  isTypeScaleState,
  scaleSteps,
  stepName,
  type TypeScaleState,
} from "./typeScale";
import { isFiniteNumber, isRecord } from "./usePresets";

// 스타일 키트는 도구마다 저장한 프리셋을 "값의 복사본"으로 담는다. 프리셋을 지워도 키트는 그대로이고,
// 공유 링크에 담겨도 받는 사람에게 프리셋 목록이 필요 없다. 키트에는 모양에 필요한 값만 둔다
// (예: 타이포그래피의 예시 글은 뺀다. 공유 링크가 길어지지 않게 하려는 이유도 있다).

/** 폰트는 모든 글자에, 굵기·자간·행간은 제목에 적용한다. */
export type KitTypography = { fontKey: string; weight: number; tracking: number; leading: number };

export type KitRoles = { primary: number; secondary: number; accent: number };

export type StyleKit = {
  palette: PalettePreset | null;
  gradient: GradientPreset | null;
  typeScale: TypeScaleState | null;
  typography: KitTypography | null;
  radius: Radius | null;
  shadow: BoxShadow | null;
  /** 팔레트 5색 중 어느 색을 주색·보조색·강조색으로 쓸지(0~4). */
  roles: KitRoles;
};

export const ROLE_KEYS = ["primary", "secondary", "accent"] as const;
export type RoleKey = (typeof ROLE_KEYS)[number];

export const DEFAULT_PALETTE: PalettePreset = { h: 220, s: 70, l: 55, harmony: "analogous" };
export const DEFAULT_TYPOGRAPHY: KitTypography = { fontKey: "geist", weight: 700, tracking: -0.02, leading: 1.2 };
export const DEFAULT_SHADOW: BoxShadow = {
  x: 0,
  y: 8,
  blur: 24,
  spread: 0,
  shadowColor: "#000000",
  shadowAlpha: 0.12,
  inset: false,
};
/** 반지름 프리셋을 고르지 않았을 때 쓰는 값. 프리셋은 %라서 이 값만 px이다. */
export const DEFAULT_RADIUS_VALUE = "12px";

/**
 * 배색 규칙마다 기준색이 놓이는 자리가 달라서(유사색은 가운데, 삼각 배색은 첫째) 주색은 기준색으로 하고,
 * 보조색과 강조색은 주색과 구분이 잘 되는 다른 색으로 정한다. 팔레트를 바꿀 때 이 값으로 다시 시작한다.
 */
export function defaultRoles(harmony: Harmony): KitRoles {
  switch (harmony) {
    case "complementary":
      return { primary: 1, secondary: 0, accent: 3 };
    case "triadic":
      return { primary: 0, secondary: 2, accent: 3 };
    case "split":
      return { primary: 0, secondary: 1, accent: 2 };
    case "monochrome":
      return { primary: 2, secondary: 0, accent: 4 };
    default:
      return { primary: 2, secondary: 1, accent: 4 };
  }
}

export const EMPTY_KIT: StyleKit = {
  palette: null,
  gradient: null,
  typeScale: null,
  typography: null,
  radius: null,
  shadow: null,
  roles: defaultRoles(DEFAULT_PALETTE.harmony),
};

const HEX = /^#[0-9a-f]{6}$/i;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const int = (n: number, min: number, max: number) => Math.round(clamp(n, min, max));
const dec = (n: number, min: number, max: number, digits: number) =>
  Number(clamp(n, min, max).toFixed(digits));

// ── 검증 ──────────────────────────────────────────────

export function isKitTypography(d: unknown): d is KitTypography {
  return (
    isRecord(d) &&
    FONTS.some((f) => f.key === d.fontKey) &&
    isFiniteNumber(d.weight) &&
    isFiniteNumber(d.tracking) &&
    isFiniteNumber(d.leading)
  );
}

export function isKitShadow(d: unknown): d is BoxShadow {
  return (
    isRecord(d) &&
    (["x", "y", "blur", "spread", "shadowAlpha"] as const).every((k) => isFiniteNumber(d[k])) &&
    typeof d.inset === "boolean" &&
    typeof d.shadowColor === "string" &&
    HEX.test(d.shadowColor)
  );
}

export function isKitRadius(d: unknown): d is Radius {
  return isRecord(d) && RADIUS_KEYS.every((k) => isFiniteNumber(d[k]));
}

const orNull = <T>(v: unknown, ok: (d: unknown) => d is T) => v === null || ok(v);

export function isStyleKit(d: unknown): d is StyleKit {
  if (!isRecord(d) || !isRecord(d.roles)) return false;
  return (
    orNull(d.palette, isPalettePreset) &&
    orNull(d.gradient, isGradientPreset) &&
    orNull(d.typeScale, isTypeScaleState) &&
    orNull(d.typography, isKitTypography) &&
    orNull(d.radius, isKitRadius) &&
    orNull(d.shadow, isKitShadow) &&
    ROLE_KEYS.every((k) => isFiniteNumber((d.roles as Record<string, unknown>)[k]))
  );
}

// ── 보정 ──────────────────────────────────────────────

/** 각 도구의 슬라이더 범위와 같은 값으로 맞춘다. 불러오거나 공유받은 값이 범위를 벗어나도 안전하다. */
export function clampKit(kit: StyleKit): StyleKit {
  const palette = kit.palette && {
    h: int(kit.palette.h, 0, 360),
    s: int(kit.palette.s, 0, 100),
    l: int(kit.palette.l, 0, 100),
    harmony: HARMONIES.some((h) => h.value === kit.palette!.harmony) ? kit.palette.harmony : "analogous",
  };
  const gradient = kit.gradient && {
    kind: kit.gradient.kind,
    angle: int(kit.gradient.angle, 0, 360),
    stops: kit.gradient.stops.map((s) => ({ color: s.color.toUpperCase(), pos: int(s.pos, 0, 100) })),
  };
  const font = kit.typography && fontByKey(kit.typography.fontKey);
  const typography = kit.typography && font && {
    fontKey: font.key,
    // 선택한 폰트가 지원하는 굵기 범위로 맞춘다
    weight: int(kit.typography.weight, font.wMin, font.wMax),
    tracking: dec(kit.typography.tracking, -0.1, 0.5, 2),
    leading: dec(kit.typography.leading, 0.8, 2.4, 2),
  };
  const shadow = kit.shadow && {
    x: int(kit.shadow.x, -50, 50),
    y: int(kit.shadow.y, -50, 50),
    blur: int(kit.shadow.blur, 0, 100),
    spread: int(kit.shadow.spread, -30, 30),
    shadowColor: kit.shadow.shadowColor.toUpperCase(),
    shadowAlpha: dec(kit.shadow.shadowAlpha, 0, 1, 2),
    inset: kit.shadow.inset,
  };
  const role = (n: number) => int(n, 0, 4);
  return {
    palette,
    gradient,
    typeScale: kit.typeScale && clampTypeScale(kit.typeScale),
    typography,
    radius: kit.radius && clampRadius(kit.radius),
    shadow,
    roles: { primary: role(kit.roles.primary), secondary: role(kit.roles.secondary), accent: role(kit.roles.accent) },
  };
}

// ── 도구 프리셋 → 키트 값 ────────────────────────────

export function toKitTypography(p: TypographyPreset): KitTypography {
  return { fontKey: p.fontKey, weight: p.weight, tracking: p.tracking, leading: p.leading };
}

/** 글래스 모드의 프리셋은 box-shadow가 없어서 키트에 담을 수 없다. */
export function toKitShadow(p: ShadowPreset): BoxShadow | null {
  if (p.mode !== "shadow") return null;
  const { x, y, blur, spread, shadowColor, shadowAlpha, inset } = p;
  return { x, y, blur, spread, shadowColor, shadowAlpha, inset };
}

export function toKitRadius(p: RadiusPreset): Radius {
  return Object.fromEntries(RADIUS_KEYS.map((k) => [k, p[k]])) as Radius;
}

// ── 토큰 ──────────────────────────────────────────────

export type TokenGroup = "Colors" | "Gradient" | "Type scale" | "Typography" | "Shape";

export type Token = { group: TokenGroup; name: string; value: string };

/** 팔레트 다섯 색(#RRGGBB). 팔레트를 고르지 않았으면 기본 팔레트다. */
export function kitColors(kit: StyleKit): string[] {
  const p = kit.palette ?? DEFAULT_PALETTE;
  return generatePalette({ h: p.h, s: p.s, l: p.l }, p.harmony).map(hslToHex);
}

/**
 * 키트의 모든 토큰. 고르지 않은 항목은 기본값으로 채워서 내려받은 파일이 항상 완전하다.
 * target이 "preview"이면 글꼴이 next/font가 만든 CSS 변수(실제로 불러온 폰트)를 가리킨다.
 */
export function kitTokens(kit: StyleKit, target: "export" | "preview" = "export"): Token[] {
  const colors = kitColors(kit);
  const tokens: Token[] = colors.map((c, i) => ({ group: "Colors", name: `--color-${i + 1}`, value: c }));
  for (const r of ROLE_KEYS) {
    tokens.push({ group: "Colors", name: `--color-${r}`, value: `var(--color-${kit.roles[r] + 1})` });
  }
  for (const r of ROLE_KEYS) {
    tokens.push({ group: "Colors", name: `--color-on-${r}`, value: readableTextColor(colors[kit.roles[r]]) });
  }

  tokens.push({
    group: "Gradient",
    name: "--gradient",
    value: kit.gradient
      ? gradientCss(kit.gradient.kind, kit.gradient.angle, kit.gradient.stops)
      : "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
  });

  const scale = kit.typeScale ?? DEFAULT_SCALE;
  for (const s of scaleSteps(scale)) {
    tokens.push({ group: "Type scale", name: stepName(s.step), value: formatSize(s.px, scale.unit) });
  }

  const t = kit.typography ?? DEFAULT_TYPOGRAPHY;
  const font = fontByKey(t.fontKey);
  // 폰트는 모든 글자에 쓰고, 굵기·자간·행간은 제목용이다(타이포그래피 도구의 값은 큰 글자 기준이라 본문에 쓰면 빽빽하다)
  tokens.push(
    { group: "Typography", name: "--font-family", value: target === "preview" ? font.stack : font.cssName },
    { group: "Typography", name: "--heading-weight", value: String(t.weight) },
    { group: "Typography", name: "--heading-letter-spacing", value: `${t.tracking.toFixed(2)}em` },
    { group: "Typography", name: "--heading-line-height", value: t.leading.toFixed(2) },
  );

  tokens.push(
    { group: "Shape", name: "--radius", value: kit.radius ? radiusValue(kit.radius) : DEFAULT_RADIUS_VALUE },
    { group: "Shape", name: "--shadow", value: boxShadowValue(kit.shadow ?? DEFAULT_SHADOW) },
  );
  return tokens;
}

/**
 * 샘플 화면이 쓰고 싶은 단계 중 키트의 타입 스케일에 실제로 있는 가장 가까운 단계.
 * 단계 수를 줄여도 var(--step-4)처럼 없는 변수를 가리키지 않게 한다.
 */
export function nearestStep(kit: StyleKit, wanted: number): number {
  const s = kit.typeScale ?? DEFAULT_SCALE;
  const step = clamp(wanted, -s.down, s.up);
  // down이 0이면 -0이 나오므로 0으로 정리한다
  return step === 0 ? 0 : step;
}

/** 키 순서와 상관없이 같은 값인지. 프리셋의 값과 키트에 담긴 값을 견줄 때 쓴다. */
export function sameValue(a: unknown, b: unknown): boolean {
  const canon = (v: unknown): unknown =>
    Array.isArray(v)
      ? v.map(canon)
      : isRecord(v)
        ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])]))
        : v;
  return JSON.stringify(canon(a)) === JSON.stringify(canon(b));
}

/** 미리보기 영역에 style로 넘길 CSS 변수 모음. */
export function kitStyleVars(kit: StyleKit): Record<string, string> {
  return Object.fromEntries(kitTokens(kit, "preview").map((t) => [t.name, t.value]));
}

/** 내려받는 `:root { ... }`. 묶음마다 주석으로 구분한다. */
export function kitToCss(kit: StyleKit): string {
  const lines: string[] = [];
  let group: TokenGroup | null = null;
  for (const t of kitTokens(kit)) {
    if (t.group !== group) {
      if (group !== null) lines.push("");
      lines.push(`  /* ${t.group} */`);
      group = t.group;
    }
    lines.push(`  ${t.name}: ${t.value};`);
  }
  return `:root {\n${lines.join("\n")}\n}`;
}

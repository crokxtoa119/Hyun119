import { normalizeHex } from "./contrast";

export const TEXT_MODES = ["shadow", "gradient", "clamp"] as const;

export type TextEffectState = {
  mode: (typeof TEXT_MODES)[number];
  /** text-shadow, px */
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  shadowColor: string;
  /** 그라데이션 글자 */
  gradAngle: number;
  gradFrom: string;
  gradTo: string;
  /** 줄 수 제한 */
  lines: number;
};

export const LIMITS = {
  shadowOffset: { min: -20, max: 20 },
  shadowBlur: { min: 0, max: 30 },
  gradAngle: { min: 0, max: 360 },
  lines: { min: 1, max: 6 },
} as const;

export const DEFAULT_TEXT_EFFECT: TextEffectState = {
  mode: "shadow",
  shadowX: 3,
  shadowY: 4,
  shadowBlur: 8,
  shadowColor: "#00000066",
  gradAngle: 90,
  gradFrom: "#F97316",
  gradTo: "#6366F1",
  lines: 3,
};

const clampInt = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(n)));

/** "#RRGGBB" 또는 "#RRGGBBAA"(알파 포함)를 대문자로 정리한다. 형식이 틀리면 null. */
export function normalizeColor(input: string): string | null {
  const m = /^#?([0-9a-f]{8})$/i.exec(input.trim());
  if (m) return `#${m[1].toUpperCase()}`;
  return normalizeHex(input);
}

/** 불러온 값이 범위를 벗어나도 슬라이더 범위로 맞추고, 색은 정리한다. 잘못된 색은 기본값을 쓴다. */
export function clampTextEffect(s: TextEffectState): TextEffectState {
  return {
    ...s,
    shadowX: clampInt(s.shadowX, LIMITS.shadowOffset.min, LIMITS.shadowOffset.max),
    shadowY: clampInt(s.shadowY, LIMITS.shadowOffset.min, LIMITS.shadowOffset.max),
    shadowBlur: clampInt(s.shadowBlur, LIMITS.shadowBlur.min, LIMITS.shadowBlur.max),
    shadowColor: normalizeColor(s.shadowColor) ?? DEFAULT_TEXT_EFFECT.shadowColor,
    gradAngle: clampInt(s.gradAngle, LIMITS.gradAngle.min, LIMITS.gradAngle.max),
    gradFrom: normalizeHex(s.gradFrom) ?? DEFAULT_TEXT_EFFECT.gradFrom,
    gradTo: normalizeHex(s.gradTo) ?? DEFAULT_TEXT_EFFECT.gradTo,
    lines: clampInt(s.lines, LIMITS.lines.min, LIMITS.lines.max),
  };
}

/** 선택한 효과의 CSS 선언 목록. 복사용 코드와 미리보기가 같은 값을 쓰도록 한 곳에서 만든다. */
export function textEffectDeclarations(s: TextEffectState): [string, string][] {
  switch (s.mode) {
    case "shadow":
      return [["text-shadow", `${s.shadowX}px ${s.shadowY}px ${s.shadowBlur}px ${s.shadowColor}`]];
    case "gradient":
      return [
        ["background", `linear-gradient(${s.gradAngle}deg, ${s.gradFrom}, ${s.gradTo})`],
        ["-webkit-background-clip", "text"],
        ["background-clip", "text"],
        ["color", "transparent"],
      ];
    case "clamp":
      return [
        ["display", "-webkit-box"],
        ["-webkit-box-orient", "vertical"],
        ["-webkit-line-clamp", String(s.lines)],
        ["line-clamp", String(s.lines)],
        ["overflow", "hidden"],
      ];
  }
}

export function textEffectToCss(s: TextEffectState): string {
  return textEffectDeclarations(s)
    .map(([k, v]) => `${k}: ${v};`)
    .join("\n");
}

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

export function isTextEffectState(d: unknown): d is TextEffectState {
  if (typeof d !== "object" || d === null) return false;
  const s = d as Record<string, unknown>;
  return (
    typeof s.mode === "string" &&
    (TEXT_MODES as readonly string[]).includes(s.mode) &&
    isNum(s.shadowX) &&
    isNum(s.shadowY) &&
    isNum(s.shadowBlur) &&
    typeof s.shadowColor === "string" &&
    normalizeColor(s.shadowColor) !== null &&
    isNum(s.gradAngle) &&
    typeof s.gradFrom === "string" &&
    normalizeHex(s.gradFrom) !== null &&
    typeof s.gradTo === "string" &&
    normalizeHex(s.gradTo) !== null &&
    isNum(s.lines)
  );
}

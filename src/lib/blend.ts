import { normalizeHex } from "./contrast";

export const BLEND_MODES = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
] as const;

export type BlendMode = (typeof BLEND_MODES)[number];

export type BlendState = {
  mode: BlendMode;
  /** 위에 올리는 층의 색 */
  top: string;
  /** 아래 층의 색 */
  bottom: string;
  /** 위 층의 불투명도(%) */
  opacity: number;
};

export const OPACITY = { min: 0, max: 100 } as const;

export const DEFAULT_BLEND: BlendState = {
  mode: "multiply",
  top: "#F97316",
  bottom: "#6366F1",
  opacity: 100,
};

/** 모드마다 한 줄 설명. 학습용으로 어떤 계산인지 짧게 적는다. */
export const BLEND_NOTES: Record<BlendMode, string> = {
  normal: "위 층이 아래 층을 그대로 덮습니다.",
  multiply: "두 색을 곱해 항상 더 어두워집니다. 흰색은 변화가 없습니다.",
  screen: "두 색을 반전해 곱한 뒤 다시 반전해 항상 더 밝아집니다. 검정은 변화가 없습니다.",
  overlay: "아래 층이 어두우면 multiply, 밝으면 screen처럼 동작해 대비가 커집니다.",
  darken: "각 채널에서 더 어두운 값을 고릅니다.",
  lighten: "각 채널에서 더 밝은 값을 고릅니다.",
  "color-dodge": "아래 층을 위 층 색만큼 밝게 날려 강한 빛 효과를 냅니다.",
  "color-burn": "아래 층을 위 층 색만큼 어둡게 태워 진한 대비를 냅니다.",
  "hard-light": "위 층 기준으로 overlay와 같은 계산을 해 강한 조명 효과를 냅니다.",
  "soft-light": "hard-light를 부드럽게 한 버전으로 은은한 명암을 줍니다.",
  difference: "두 색의 차이의 절댓값입니다. 같은 색이면 검정이 됩니다.",
  exclusion: "difference와 비슷하지만 대비가 낮고 부드럽습니다.",
  hue: "아래 층의 채도와 명도에 위 층의 색상을 입힙니다.",
  saturation: "아래 층의 색상과 명도에 위 층의 채도를 입힙니다.",
  color: "아래 층의 명도에 위 층의 색상과 채도를 입힙니다.",
  luminosity: "아래 층의 색상과 채도에 위 층의 명도를 입힙니다.",
};

/** 불러온 값이 범위를 벗어나도 맞추고, 잘못된 색은 기본값을 쓴다. */
export function clampBlend(s: BlendState): BlendState {
  return {
    ...s,
    top: normalizeHex(s.top) ?? DEFAULT_BLEND.top,
    bottom: normalizeHex(s.bottom) ?? DEFAULT_BLEND.bottom,
    opacity: Math.round(Math.min(OPACITY.max, Math.max(OPACITY.min, s.opacity))),
  };
}

/** 복사용 CSS. 아래 층 배경 위에 올린 요소에 mix-blend-mode를 쓰는 형태다. */
export function blendToCss(s: BlendState): string {
  const lines = [`.top {`, `  background: ${s.top};`, `  mix-blend-mode: ${s.mode};`];
  if (s.opacity < 100) lines.push(`  opacity: ${s.opacity / 100};`);
  lines.push(`}`, ``, `.bottom {`, `  background: ${s.bottom};`, `}`);
  return lines.join("\n");
}

export function isBlendState(d: unknown): d is BlendState {
  if (typeof d !== "object" || d === null) return false;
  const s = d as Record<string, unknown>;
  return (
    typeof s.mode === "string" &&
    (BLEND_MODES as readonly string[]).includes(s.mode) &&
    typeof s.top === "string" &&
    normalizeHex(s.top) !== null &&
    typeof s.bottom === "string" &&
    normalizeHex(s.bottom) !== null &&
    typeof s.opacity === "number" &&
    Number.isFinite(s.opacity)
  );
}

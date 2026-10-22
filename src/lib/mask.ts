export const SHAPES = [
  { value: "linear", label: "선형" },
  { value: "radial", label: "원형" },
] as const;

export type MaskShape = (typeof SHAPES)[number]["value"];

export type MaskState = {
  shape: MaskShape;
  /** 선형일 때 사라지는 방향(도). 180이면 아래쪽으로 사라진다. */
  angle: number;
  /** 여기까지는 그대로 보이는 지점(%). */
  solid: number;
  /** 여기에서 완전히 사라지는 지점(%). */
  end: number;
  /** 참이면 보이는 곳과 사라지는 곳을 서로 바꾼다. */
  invert: boolean;
};

export const MASK_LIMITS = {
  angle: { min: 0, max: 360 },
  solid: { min: 0, max: 95 },
  end: { min: 5, max: 100 },
} as const;

/** 그대로 보이는 지점과 사라지는 지점 사이의 최소 간격(%). 0이면 경계가 칼같이 갈린다. */
export const MIN_GAP = 5;

export const DEFAULT_MASK: MaskState = { shape: "linear", angle: 180, solid: 60, end: 100, invert: false };

const clampTo = (n: number, min: number, max: number) => Math.round(Math.min(max, Math.max(min, n)));

export function clampMask(s: MaskState): MaskState {
  const L = MASK_LIMITS;
  const solid = clampTo(s.solid, L.solid.min, L.solid.max);
  return {
    shape: SHAPES.some((x) => x.value === s.shape) ? s.shape : DEFAULT_MASK.shape,
    angle: clampTo(s.angle, L.angle.min, L.angle.max),
    solid,
    end: Math.max(solid + MIN_GAP, clampTo(s.end, L.end.min, L.end.max)),
    invert: s.invert === true,
  };
}

/** 마스크로 쓰는 그라디언트. 색은 상관없고 알파(불투명 → 투명)만 쓰므로 검정과 transparent를 쓴다. */
export function maskValue(s: MaskState): string {
  const stops = s.invert
    ? `transparent ${s.solid}%, #000 ${s.end}%`
    : `#000 ${s.solid}%, transparent ${s.end}%`;
  return s.shape === "radial"
    ? `radial-gradient(circle, ${stops})`
    : `linear-gradient(${s.angle}deg, ${stops})`;
}

export function maskToCss(s: MaskState): string {
  const v = maskValue(s);
  return `.masked {\n  -webkit-mask-image: ${v};\n  mask-image: ${v};\n}`;
}

export function isMaskState(d: unknown): d is MaskState {
  if (typeof d !== "object" || d === null) return false;
  const r = d as Record<string, unknown>;
  return (
    SHAPES.some((x) => x.value === r.shape) &&
    typeof r.invert === "boolean" &&
    (["angle", "solid", "end"] as const).every((k) => typeof r[k] === "number" && Number.isFinite(r[k]))
  );
}

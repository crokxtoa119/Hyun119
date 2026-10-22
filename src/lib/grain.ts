export const KINDS = [
  { value: "fractalNoise", label: "고운 노이즈" },
  { value: "turbulence", label: "소용돌이 노이즈" },
] as const;

export type GrainKind = (typeof KINDS)[number]["value"];

export const BLENDS = ["overlay", "soft-light", "multiply", "normal"] as const;

export type GrainBlend = (typeof BLENDS)[number];

export type GrainState = {
  kind: GrainKind;
  /** feTurbulence의 baseFrequency × 100. 클수록 알갱이가 곱다. */
  frequency: number;
  /** 겹치는 노이즈 층의 수. 많을수록 질감이 복잡하다. */
  octaves: number;
  seed: number;
  /** 참이면 색을 빼서 흑백 알갱이로 만든다. */
  mono: boolean;
  /** 질감 층의 불투명도(%). */
  opacity: number;
  blend: GrainBlend;
};

export const GRAIN_LIMITS = {
  frequency: { min: 5, max: 150 },
  octaves: { min: 1, max: 5 },
  seed: { min: 1, max: 99 },
  opacity: { min: 0, max: 100 },
} as const;

export const DEFAULT_GRAIN: GrainState = {
  kind: "fractalNoise",
  frequency: 80,
  octaves: 3,
  seed: 7,
  mono: true,
  opacity: 30,
  blend: "overlay",
};

/** 반복해서 까는 한 칸의 크기(px). stitchTiles로 가장자리가 이어진다. */
export const TILE = 200;

const clampTo = (n: number, min: number, max: number) => Math.round(Math.min(max, Math.max(min, n)));

export function clampGrain(s: GrainState): GrainState {
  const L = GRAIN_LIMITS;
  return {
    kind: KINDS.some((k) => k.value === s.kind) ? s.kind : DEFAULT_GRAIN.kind,
    frequency: clampTo(s.frequency, L.frequency.min, L.frequency.max),
    octaves: clampTo(s.octaves, L.octaves.min, L.octaves.max),
    seed: clampTo(s.seed, L.seed.min, L.seed.max),
    mono: s.mono !== false,
    opacity: clampTo(s.opacity, L.opacity.min, L.opacity.max),
    blend: BLENDS.includes(s.blend) ? s.blend : DEFAULT_GRAIN.blend,
  };
}

/** 노이즈 한 칸을 그리는 SVG. 값은 모두 검증된 숫자와 고정된 키워드뿐이다. */
export function grainSvg(s: GrainState): string {
  const matrix = s.mono ? "<feColorMatrix type='saturate' values='0'/>" : "";
  return (
    `<svg xmlns='http://www.w3.org/2000/svg' width='${TILE}' height='${TILE}'>` +
    `<filter id='n' x='0' y='0' width='100%' height='100%'>` +
    `<feTurbulence type='${s.kind}' baseFrequency='${s.frequency / 100}' numOctaves='${s.octaves}' seed='${s.seed}' stitchTiles='stitch'/>` +
    matrix +
    `</filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`
  );
}

/**
 * CSS url() 안에 그대로 넣을 수 있게 SVG에서 문제가 되는 글자만 인코딩한 데이터 주소.
 * %는 다른 인코딩보다 먼저 바꿔야 한다(`100%'`의 %가 뒤따르는 글자와 합쳐져 해석되지 않도록).
 */
export function grainDataUri(s: GrainState): string {
  const encoded = grainSvg(s)
    .replace(/%/g, "%25")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")
    .replace(/#/g, "%23");
  return `data:image/svg+xml,${encoded}`;
}

export function grainOpacity(s: GrainState): number {
  return s.opacity / 100;
}

export function grainToCss(s: GrainState): string {
  const lines = [
    '  content: "";',
    "  position: absolute;",
    "  inset: 0;",
    `  background-image: url("${grainDataUri(s)}");`,
    `  opacity: ${grainOpacity(s)};`,
    ...(s.blend === "normal" ? [] : [`  mix-blend-mode: ${s.blend};`]),
    "  pointer-events: none;",
  ];
  return `.grain {\n  position: relative;\n}\n\n.grain::after {\n${lines.join("\n")}\n}`;
}

export function isGrainState(d: unknown): d is GrainState {
  if (typeof d !== "object" || d === null) return false;
  const r = d as Record<string, unknown>;
  return (
    KINDS.some((k) => k.value === r.kind) &&
    BLENDS.includes(r.blend as GrainBlend) &&
    typeof r.mono === "boolean" &&
    (["frequency", "octaves", "seed", "opacity"] as const).every(
      (k) => typeof r[k] === "number" && Number.isFinite(r[k]),
    )
  );
}

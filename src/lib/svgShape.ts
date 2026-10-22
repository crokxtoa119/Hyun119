export const KINDS = [
  { value: "wave", label: "웨이브" },
  { value: "blob", label: "블롭" },
] as const;

export type ShapeKind = (typeof KINDS)[number]["value"];

export type ShapeState = {
  kind: ShapeKind;
  /** 채우는 색(#RRGGBB). */
  color: string;
  /** 웨이브: 물결의 개수. */
  waves: number;
  /** 웨이브: 물결의 높이(viewBox 기준). */
  amplitude: number;
  /** 웨이브: 0이면 뾰족한 지그재그, 100이면 부드러운 곡선. */
  round: number;
  /** 웨이브: 참이면 곡선 위쪽을 채운다(아래쪽 경계선용 모양). */
  flip: boolean;
  /** 블롭: 꼭짓점 개수. */
  points: number;
  /** 블롭: 0이면 원에 가깝고 100이면 많이 일그러진다. */
  randomness: number;
  /** 블롭: 같은 시드는 항상 같은 모양을 만든다. */
  seed: number;
};

export const SHAPE_LIMITS = {
  waves: { min: 1, max: 6 },
  amplitude: { min: 0, max: 80 },
  round: { min: 0, max: 100 },
  points: { min: 3, max: 10 },
  randomness: { min: 0, max: 100 },
  seed: { min: 1, max: 999 },
} as const;

export const DEFAULT_SHAPE: ShapeState = {
  kind: "wave",
  color: "#6366F1",
  waves: 2,
  amplitude: 40,
  round: 100,
  flip: false,
  points: 6,
  randomness: 50,
  seed: 7,
};

export const WAVE_BOX = { width: 1200, height: 200 } as const;
export const BLOB_BOX = { width: 200, height: 200 } as const;
/** 블롭의 가장 큰 반지름. 가장자리에 닿지 않게 상자보다 조금 작다. */
const BLOB_RADIUS = 90;

const HEX = /^#[0-9a-fA-F]{6}$/;
const clampTo = (n: number, min: number, max: number) => Math.round(Math.min(max, Math.max(min, n)));

export function clampShape(s: ShapeState): ShapeState {
  const L = SHAPE_LIMITS;
  return {
    kind: KINDS.some((k) => k.value === s.kind) ? s.kind : DEFAULT_SHAPE.kind,
    color: HEX.test(s.color) ? s.color.toUpperCase() : DEFAULT_SHAPE.color,
    waves: clampTo(s.waves, L.waves.min, L.waves.max),
    amplitude: clampTo(s.amplitude, L.amplitude.min, L.amplitude.max),
    round: clampTo(s.round, L.round.min, L.round.max),
    flip: s.flip === true,
    points: clampTo(s.points, L.points.min, L.points.max),
    randomness: clampTo(s.randomness, L.randomness.min, L.randomness.max),
    seed: clampTo(s.seed, L.seed.min, L.seed.max),
  };
}

/** 소수 첫째 자리까지만 쓰고 끝의 0은 뗀다. */
const fmt = (n: number) => String(Number(n.toFixed(1)));
const pt = (x: number, y: number) => `${fmt(x)},${fmt(y)}`;

/**
 * 가로로 이어 붙여도 끊기지 않는 웨이브 경로. 처음과 끝이 모두 마루라서 같은 모양을 나란히 놓을 수 있다.
 * 마루와 골을 번갈아 잇는 곡선의 조절점은 세로로는 그 점 높이에 두고, 가로로는 구간 길이의 round%/2만큼 떨어뜨린다.
 */
export function wavePath(s: ShapeState): string {
  const { width, height } = WAVE_BOX;
  const mid = height / 2;
  const half = width / (s.waves * 2);
  const k = (s.round / 100) * 0.5;
  const peak = (i: number) => (i % 2 === 0 ? mid - s.amplitude : mid + s.amplitude);
  const segments: string[] = [];
  for (let i = 0; i < s.waves * 2; i++) {
    const x0 = i * half;
    const x1 = (i + 1) * half;
    segments.push(`C${pt(x0 + half * k, peak(i))} ${pt(x1 - half * k, peak(i + 1))} ${pt(x1, peak(i + 1))}`);
  }
  const edge = s.flip ? 0 : height;
  return `M${pt(0, peak(0))}${segments.join("")}L${pt(width, edge)}L${pt(0, edge)}Z`;
}

/** 시드가 같으면 같은 수열을 만드는 작은 난수 생성기(mulberry32). 0 이상 1 미만. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 원 위의 꼭짓점들. 일그러짐이 클수록 반지름이 최대 45%까지 줄어든다. */
export function blobPoints(s: ShapeState): { x: number; y: number }[] {
  const rand = seededRandom(s.seed);
  const cx = BLOB_BOX.width / 2;
  const cy = BLOB_BOX.height / 2;
  return Array.from({ length: s.points }, (_, i) => {
    const angle = (Math.PI * 2 * i) / s.points - Math.PI / 2;
    const r = BLOB_RADIUS * (1 - (s.randomness / 100) * 0.45 * rand());
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  });
}

/** 꼭짓점을 지나는 닫힌 곡선. Catmull-Rom 곡선을 3차 베지어로 바꿔 쓴다. */
export function blobPath(s: ShapeState): string {
  const p = blobPoints(s);
  const n = p.length;
  const at = (i: number) => p[(i + n) % n];
  const segments: string[] = [];
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    segments.push(`C${pt(c1.x, c1.y)} ${pt(c2.x, c2.y)} ${pt(p2.x, p2.y)}`);
  }
  return `M${pt(p[0].x, p[0].y)}${segments.join("")}Z`;
}

export function shapeBox(s: ShapeState): { width: number; height: number } {
  return s.kind === "wave" ? WAVE_BOX : BLOB_BOX;
}

export function shapePath(s: ShapeState): string {
  return s.kind === "wave" ? wavePath(s) : blobPath(s);
}

/** 그대로 붙여 쓸 수 있는 SVG 코드. 웨이브는 가로로 늘려 쓰도록 비율을 고정하지 않는다. */
export function shapeToSvg(s: ShapeState): string {
  const { width, height } = shapeBox(s);
  const ratio = s.kind === "wave" ? ' preserveAspectRatio="none"' : "";
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"${ratio}>`,
    `  <path fill="${s.color}" d="${shapePath(s)}" />`,
    "</svg>",
  ].join("\n");
}

export function isShapeState(d: unknown): d is ShapeState {
  if (typeof d !== "object" || d === null) return false;
  const r = d as Record<string, unknown>;
  return (
    KINDS.some((k) => k.value === r.kind) &&
    typeof r.color === "string" &&
    HEX.test(r.color) &&
    typeof r.flip === "boolean" &&
    (["waves", "amplitude", "round", "points", "randomness", "seed"] as const).every(
      (k) => typeof r[k] === "number" && Number.isFinite(r[k]),
    )
  );
}

export type Point = { x: number; y: number };

export type ClipState = { points: Point[] };

export const MIN_POINTS = 3;
export const MAX_POINTS = 12;

const p = (...n: number[]): Point[] =>
  Array.from({ length: n.length / 2 }, (_, i) => ({ x: n[i * 2], y: n[i * 2 + 1] }));

export const CLIP_SHAPES: { id: string; label: string; points: Point[] }[] = [
  { id: "triangle", label: "삼각형", points: p(50, 0, 100, 100, 0, 100) },
  { id: "diamond", label: "마름모", points: p(50, 0, 100, 50, 50, 100, 0, 50) },
  { id: "trapezoid", label: "사다리꼴", points: p(20, 0, 80, 0, 100, 100, 0, 100) },
  { id: "parallelogram", label: "평행사변형", points: p(25, 0, 100, 0, 75, 100, 0, 100) },
  { id: "pentagon", label: "오각형", points: p(50, 0, 100, 38, 82, 100, 18, 100, 0, 38) },
  { id: "hexagon", label: "육각형", points: p(25, 0, 75, 0, 100, 50, 75, 100, 25, 100, 0, 50) },
  { id: "arrow", label: "화살표", points: p(0, 20, 60, 20, 60, 0, 100, 50, 60, 100, 60, 80, 0, 80) },
  { id: "star", label: "별", points: p(50, 0, 62, 34, 98, 35, 69, 56, 79, 90, 50, 70, 21, 90, 31, 56, 2, 35, 38, 34) },
  {
    id: "cross",
    label: "십자",
    points: p(33, 0, 67, 0, 67, 33, 100, 33, 100, 67, 67, 67, 67, 100, 33, 100, 33, 67, 0, 67, 0, 33, 33, 33),
  },
];

const hexagon = CLIP_SHAPES.find((s) => s.id === "hexagon")!;

export const DEFAULT_CLIP: ClipState = { points: hexagon.points.map((q) => ({ ...q })) };

/** 좌표를 0~100 정수로 맞춘다. */
export function clampCoord(n: number): number {
  return Math.round(Math.min(100, Math.max(0, n)));
}

/** 불러온 값의 좌표를 범위로 맞추고, 점이 너무 많으면 앞쪽 MAX_POINTS개만 쓴다. */
export function clampClip(s: ClipState): ClipState {
  return {
    points: s.points.slice(0, MAX_POINTS).map((q) => ({ x: clampCoord(q.x), y: clampCoord(q.y) })),
  };
}

export function movePoint(points: Point[], index: number, x: number, y: number): Point[] {
  return points.map((q, i) => (i === index ? { x: clampCoord(x), y: clampCoord(y) } : q));
}

/** 선택한 점과 다음 점(마지막이면 첫 점)의 가운데에 새 점을 끼워 넣는다. 한도에 닿았으면 그대로. */
export function addPointAfter(points: Point[], index: number): { points: Point[]; index: number } {
  if (points.length >= MAX_POINTS) return { points, index };
  const a = points[index];
  const b = points[(index + 1) % points.length];
  const mid = { x: clampCoord((a.x + b.x) / 2), y: clampCoord((a.y + b.y) / 2) };
  const next = [...points.slice(0, index + 1), mid, ...points.slice(index + 1)];
  return { points: next, index: index + 1 };
}

/** 점을 지운다. 최소 개수 아래로는 내려가지 않는다. 지운 뒤에는 앞 점이 선택된다. */
export function removePoint(points: Point[], index: number): { points: Point[]; index: number } {
  if (points.length <= MIN_POINTS) return { points, index };
  return { points: points.filter((_, i) => i !== index), index: Math.max(0, index - 1) };
}

export function clipValue(points: Point[]): string {
  return `polygon(${points.map((q) => `${q.x}% ${q.y}%`).join(", ")})`;
}

export function clipToCss(s: ClipState): string {
  return `clip-path: ${clipValue(s.points)};`;
}

export function isClipState(d: unknown): d is ClipState {
  if (typeof d !== "object" || d === null) return false;
  const pts = (d as ClipState).points;
  return (
    Array.isArray(pts) &&
    pts.length >= MIN_POINTS &&
    pts.length <= MAX_POINTS &&
    pts.every(
      (q) =>
        typeof q === "object" &&
        q !== null &&
        typeof q.x === "number" &&
        Number.isFinite(q.x) &&
        typeof q.y === "number" &&
        Number.isFinite(q.y),
    )
  );
}

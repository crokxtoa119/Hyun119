import { describe, expect, it } from "vitest";
import {
  BLOB_BOX,
  DEFAULT_SHAPE,
  SHAPE_LIMITS,
  WAVE_BOX,
  blobPath,
  blobPoints,
  clampShape,
  isShapeState,
  seededRandom,
  shapeToSvg,
  wavePath,
  type ShapeState,
} from "./svgShape";

const shape = (patch: Partial<ShapeState> = {}): ShapeState => ({ ...DEFAULT_SHAPE, ...patch });
const count = (s: string, ch: string) => s.split(ch).length - 1;

describe("clampShape", () => {
  it("기본값은 그대로 둔다", () => {
    expect(clampShape(DEFAULT_SHAPE)).toEqual(DEFAULT_SHAPE);
  });

  it("각 값을 범위 안의 정수로 맞춘다", () => {
    const r = clampShape(shape({ waves: 99, amplitude: -4, round: 150, points: 1, randomness: 1e9, seed: 0 }));
    expect(r.waves).toBe(SHAPE_LIMITS.waves.max);
    expect(r.amplitude).toBe(SHAPE_LIMITS.amplitude.min);
    expect(r.round).toBe(SHAPE_LIMITS.round.max);
    expect(r.points).toBe(SHAPE_LIMITS.points.min);
    expect(r.randomness).toBe(SHAPE_LIMITS.randomness.max);
    expect(r.seed).toBe(SHAPE_LIMITS.seed.min);
  });

  it("색은 #RRGGBB만 받고 대문자로 맞추며, 아니면 기본 색이다", () => {
    expect(clampShape(shape({ color: "#abcdef" })).color).toBe("#ABCDEF");
    expect(clampShape(shape({ color: 'red" onload="x' })).color).toBe(DEFAULT_SHAPE.color);
    expect(clampShape(shape({ color: "#abc" })).color).toBe(DEFAULT_SHAPE.color);
  });

  it("알 수 없는 종류는 기본값으로 되돌린다", () => {
    expect(clampShape({ ...DEFAULT_SHAPE, kind: "star" } as unknown as ShapeState).kind).toBe("wave");
  });
});

describe("wavePath", () => {
  it("알려진 값: 물결 2개, 높이 40, 완전히 둥근 곡선", () => {
    expect(wavePath(DEFAULT_SHAPE)).toBe(
      "M0,60C150,60 150,140 300,140C450,140 450,60 600,60C750,60 750,140 900,140C1050,140 1050,60 1200,60L1200,200L0,200Z",
    );
  });

  it("물결 개수의 두 배만큼 곡선 구간이 있다", () => {
    for (const waves of [1, 3, 6]) expect(count(wavePath(shape({ waves })), "C")).toBe(waves * 2);
  });

  it("처음과 끝의 높이가 같아 가로로 이어 붙여도 끊기지 않는다", () => {
    const d = wavePath(shape({ waves: 3, amplitude: 25 }));
    expect(d.startsWith("M0,75")).toBe(true);
    expect(d).toContain(`${WAVE_BOX.width},75L`);
  });

  it("round가 0이면 조절점이 끝점과 같아 직선 지그재그다", () => {
    expect(wavePath(shape({ waves: 1, round: 0 }))).toBe(
      "M0,60C0,60 600,140 600,140C600,140 1200,60 1200,60L1200,200L0,200Z",
    );
  });

  it("flip이면 곡선 위쪽을 채운다", () => {
    expect(wavePath(shape({ flip: true }))).toMatch(/L1200,0L0,0Z$/);
  });

  it("amplitude가 0이면 한가운데 직선이다", () => {
    expect(wavePath(shape({ amplitude: 0 }))).toMatch(/^M0,100C/);
  });
});

describe("seededRandom", () => {
  it("같은 시드는 같은 수열, 다른 시드는 다른 수열이다", () => {
    const a = seededRandom(5);
    const b = seededRandom(5);
    const seq = Array.from({ length: 5 }, () => a());
    expect(Array.from({ length: 5 }, () => b())).toEqual(seq);
    const c = seededRandom(6);
    expect(Array.from({ length: 5 }, () => c())).not.toEqual(seq);
  });

  it("값은 항상 0 이상 1 미만이다", () => {
    const r = seededRandom(123);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("blobPath", () => {
  it("같은 설정은 항상 같은 모양이고 시드가 다르면 다른 모양이다", () => {
    const k = shape({ kind: "blob" });
    expect(blobPath(k)).toBe(blobPath({ ...k }));
    expect(blobPath(k)).not.toBe(blobPath({ ...k, seed: 8 }));
  });

  it("꼭짓점 개수만큼 곡선 구간이 있고 닫혀 있다", () => {
    for (const points of [3, 6, 10]) {
      const d = blobPath(shape({ kind: "blob", points }));
      expect(count(d, "C")).toBe(points);
      expect(d.endsWith("Z")).toBe(true);
    }
  });

  it("randomness가 0이면 모든 꼭짓점이 같은 반지름의 원 위에 있다", () => {
    const radii = blobPoints(shape({ kind: "blob", randomness: 0, points: 8 })).map((p) =>
      Math.hypot(p.x - BLOB_BOX.width / 2, p.y - BLOB_BOX.height / 2),
    );
    for (const r of radii) expect(r).toBeCloseTo(90, 6);
  });

  it("꼭짓점은 항상 상자 안에 있다", () => {
    for (const seed of [1, 50, 999]) {
      for (const p of blobPoints(shape({ kind: "blob", randomness: 100, points: 10, seed }))) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(BLOB_BOX.width);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThanOrEqual(BLOB_BOX.height);
      }
    }
  });
});

describe("shapeToSvg", () => {
  it("웨이브는 비율을 고정하지 않고 viewBox가 1200×200이다", () => {
    const svg = shapeToSvg(DEFAULT_SHAPE);
    expect(svg).toContain('viewBox="0 0 1200 200"');
    expect(svg).toContain('preserveAspectRatio="none"');
    expect(svg).toContain('fill="#6366F1"');
    expect(svg).toContain(wavePath(DEFAULT_SHAPE));
  });

  it("블롭은 200×200이고 비율을 고정하지 않는 속성이 없다", () => {
    const svg = shapeToSvg(shape({ kind: "blob" }));
    expect(svg).toContain('viewBox="0 0 200 200"');
    expect(svg).not.toContain("preserveAspectRatio");
  });
});

describe("isShapeState", () => {
  it("올바른 값만 통과시킨다", () => {
    expect(isShapeState(DEFAULT_SHAPE)).toBe(true);
    expect(isShapeState({ ...DEFAULT_SHAPE, kind: "star" })).toBe(false);
    expect(isShapeState({ ...DEFAULT_SHAPE, color: "red" })).toBe(false);
    expect(isShapeState({ ...DEFAULT_SHAPE, flip: "yes" })).toBe(false);
    expect(isShapeState({ ...DEFAULT_SHAPE, seed: NaN })).toBe(false);
    expect(isShapeState(null)).toBe(false);
  });
});

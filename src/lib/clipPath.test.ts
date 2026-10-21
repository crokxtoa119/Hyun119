import { describe, expect, it } from "vitest";
import {
  CLIP_SHAPES,
  DEFAULT_CLIP,
  MAX_POINTS,
  MIN_POINTS,
  addPointAfter,
  clampClip,
  clampCoord,
  clipToCss,
  clipValue,
  isClipState,
  movePoint,
  removePoint,
} from "./clipPath";

describe("CLIP_SHAPES", () => {
  it("모든 모양이 점 개수 한도와 좌표 범위를 지킨다", () => {
    for (const s of CLIP_SHAPES) {
      expect(s.points.length, s.id).toBeGreaterThanOrEqual(MIN_POINTS);
      expect(s.points.length, s.id).toBeLessThanOrEqual(MAX_POINTS);
      for (const q of s.points) {
        expect(q.x).toBeGreaterThanOrEqual(0);
        expect(q.x).toBeLessThanOrEqual(100);
        expect(q.y).toBeGreaterThanOrEqual(0);
        expect(q.y).toBeLessThanOrEqual(100);
      }
      expect(isClipState({ points: s.points }), s.id).toBe(true);
    }
  });

  it("id가 겹치지 않는다", () => {
    expect(new Set(CLIP_SHAPES.map((s) => s.id)).size).toBe(CLIP_SHAPES.length);
  });
});

describe("clipValue / clipToCss", () => {
  it("꼭짓점을 퍼센트 좌표로 이어 polygon을 만든다", () => {
    expect(clipValue([{ x: 50, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }])).toBe(
      "polygon(50% 0%, 100% 100%, 0% 100%)",
    );
  });

  it("기본값은 육각형이다", () => {
    expect(clipToCss(DEFAULT_CLIP)).toBe(
      "clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);",
    );
  });
});

describe("clampCoord / clampClip", () => {
  it("범위 밖은 0~100으로, 소수는 반올림한다", () => {
    expect(clampCoord(-5)).toBe(0);
    expect(clampCoord(130)).toBe(100);
    expect(clampCoord(33.6)).toBe(34);
  });

  it("불러온 점의 좌표를 맞추고 한도를 넘는 점은 버린다", () => {
    const many = Array.from({ length: 20 }, (_, i) => ({ x: i * 10, y: -i }));
    const r = clampClip({ points: many });
    expect(r.points).toHaveLength(MAX_POINTS);
    expect(r.points.every((q) => q.y === 0 && q.x >= 0 && q.x <= 100)).toBe(true);
  });
});

describe("점 편집", () => {
  const tri = [{ x: 50, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }];

  it("movePoint는 해당 점만 옮기고 범위로 맞춘다", () => {
    const r = movePoint(tri, 1, 120, 40);
    expect(r[1]).toEqual({ x: 100, y: 40 });
    expect(r[0]).toEqual(tri[0]);
    expect(tri[1]).toEqual({ x: 100, y: 100 });
  });

  it("addPointAfter는 다음 점과의 가운데에 끼우고 새 점을 선택한다", () => {
    const r = addPointAfter(tri, 0);
    expect(r.points).toHaveLength(4);
    expect(r.points[1]).toEqual({ x: 75, y: 50 });
    expect(r.index).toBe(1);
  });

  it("addPointAfter는 마지막 점에서 첫 점과의 가운데를 쓴다", () => {
    const r = addPointAfter(tri, 2);
    expect(r.points[3]).toEqual({ x: 25, y: 50 });
    expect(r.index).toBe(3);
  });

  it("addPointAfter는 한도에서 멈춘다", () => {
    const full = Array.from({ length: MAX_POINTS }, (_, i) => ({ x: i, y: i }));
    expect(addPointAfter(full, 0).points).toBe(full);
  });

  it("removePoint는 앞 점을 선택하고 최소 개수 아래로 내려가지 않는다", () => {
    const four = [...tri, { x: 0, y: 50 }];
    const r = removePoint(four, 2);
    expect(r.points).toHaveLength(3);
    expect(r.index).toBe(1);
    expect(removePoint(tri, 0).points).toBe(tri);
    expect(removePoint(four, 0).index).toBe(0);
  });
});

describe("isClipState", () => {
  it("올바른 값을 받아들인다", () => {
    expect(isClipState(DEFAULT_CLIP)).toBe(true);
  });

  it("이상한 값을 거부한다", () => {
    expect(isClipState(null)).toBe(false);
    expect(isClipState({})).toBe(false);
    expect(isClipState({ points: "x" })).toBe(false);
    expect(isClipState({ points: [{ x: 0, y: 0 }, { x: 1, y: 1 }] })).toBe(false);
    expect(isClipState({ points: Array.from({ length: 13 }, () => ({ x: 1, y: 1 })) })).toBe(false);
    expect(isClipState({ points: [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: "2", y: 2 }] })).toBe(false);
    expect(isClipState({ points: [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: NaN, y: 2 }] })).toBe(false);
    expect(isClipState({ points: [{ x: 0, y: 0 }, { x: 1, y: 1 }, null] })).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  EXPERIMENTS,
  categoryLabel,
  getExperiment,
  getNeighbors,
  groupExperiments,
} from "./experiments";

describe("EXPERIMENTS", () => {
  it("has unique slugs and hrefs", () => {
    expect(new Set(EXPERIMENTS.map((e) => e.slug)).size).toBe(EXPERIMENTS.length);
    expect(new Set(EXPERIMENTS.map((e) => e.href)).size).toBe(EXPERIMENTS.length);
  });

  it("uses url-safe slugs and absolute hrefs", () => {
    for (const e of EXPERIMENTS) {
      expect(e.slug).toMatch(/^[a-z0-9-]+$/);
      expect(e.href).toBe(`/${e.slug}`);
    }
  });

  it("has content for every detail section", () => {
    for (const e of EXPERIMENTS) {
      expect(e.summary).not.toBe("");
      expect(e.learned.length).toBeGreaterThan(0);
      expect(e.tech.length).toBeGreaterThan(0);
    }
  });
});

describe("getExperiment", () => {
  it("finds by slug and returns undefined for unknown", () => {
    expect(getExperiment("palette")?.title).toBe("Color Palette");
    expect(getExperiment("nope")).toBeUndefined();
  });
});

describe("getNeighbors", () => {
  it("returns null at the ends", () => {
    const first = EXPERIMENTS[0].slug;
    const last = EXPERIMENTS[EXPERIMENTS.length - 1].slug;
    expect(getNeighbors(first).prev).toBeNull();
    expect(getNeighbors(first).next?.slug).toBe(EXPERIMENTS[1].slug);
    expect(getNeighbors(last).next).toBeNull();
    expect(getNeighbors(last).prev?.slug).toBe(EXPERIMENTS[EXPERIMENTS.length - 2].slug);
  });

  it("returns both nulls for an unknown slug", () => {
    expect(getNeighbors("nope")).toEqual({ prev: null, next: null });
  });
});

describe("categories", () => {
  it("모든 실험이 정의된 분류에 속한다", () => {
    const ids = CATEGORIES.map((c) => c.id) as string[];
    for (const e of EXPERIMENTS) expect(ids).toContain(e.category);
  });

  it("groupExperiments는 모든 실험을 한 번씩만 담고 순서를 유지한다", () => {
    const groups = groupExperiments();
    const flat = groups.flatMap((g) => g.items.map((e) => e.slug));
    expect([...flat].sort()).toEqual(EXPERIMENTS.map((e) => e.slug).sort());
    for (const g of groups) {
      const order = g.items.map((e) => EXPERIMENTS.indexOf(e));
      expect(order).toEqual([...order].sort((a, b) => a - b));
    }
  });

  it("비어 있는 분류는 빼고 분류 순서를 따른다", () => {
    const ids = groupExperiments().map((g) => g.id);
    expect(ids).toEqual(CATEGORIES.map((c) => c.id).filter((id) => ids.includes(id)));
    groupExperiments().forEach((g) => expect(g.items.length).toBeGreaterThan(0));
  });

  it("categoryLabel은 한글 이름을 돌려준다", () => {
    expect(categoryLabel("color")).toBe("색");
  });
});

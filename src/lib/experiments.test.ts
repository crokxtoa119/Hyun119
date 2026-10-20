import { describe, expect, it } from "vitest";
import { EXPERIMENTS, getExperiment, getNeighbors } from "./experiments";

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

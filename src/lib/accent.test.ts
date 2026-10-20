import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readAccent, setAccent } from "./accent";
import { ACCENTS, isAccentId } from "./accentPalette";
import { contrastRatio } from "./contrast";

const LIGHT_BG = "#FFFFFF";
const DARK_BG = "#0A0A0A";
const css = readFileSync(join(process.cwd(), "src", "app", "globals.css"), "utf8");
const colored = ACCENTS.filter((a) => a.id !== "default");

describe("ACCENTS 명암비", () => {
  it.each(ACCENTS.map((a) => [a.id, a] as const))("%s: 강조색 위 글자 4.5:1, 배경 대비 3:1 이상", (_id, a) => {
    expect(contrastRatio(a.light.accent, a.light.on)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(a.dark.accent, a.dark.on)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(a.light.accent, LIGHT_BG)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(a.dark.accent, DARK_BG)).toBeGreaterThanOrEqual(3);
  });

  it("id가 겹치지 않고 default가 있다", () => {
    expect(new Set(ACCENTS.map((a) => a.id)).size).toBe(ACCENTS.length);
    expect(isAccentId("default")).toBe(true);
    expect(isAccentId("hotpink")).toBe(false);
    expect(isAccentId(null)).toBe(false);
  });
});

describe("globals.css와 ACCENTS 일치", () => {
  const hasRule = (selector: string, accent: string, on: string) =>
    css.toLowerCase().includes(`${selector.toLowerCase()} { --accent: ${accent.toLowerCase()}; --on-accent: ${on.toLowerCase()}; }`);

  it.each(colored.map((a) => [a.id, a] as const))("%s: 라이트와 다크 규칙이 있다", (id, a) => {
    expect(hasRule(`:root[data-accent="${id}"]`, a.light.accent, a.light.on)).toBe(true);
    expect(hasRule(`:root[data-accent="${id}"]:not([data-theme="light"])`, a.dark.accent, a.dark.on)).toBe(true);
    expect(hasRule(`:root[data-theme="dark"][data-accent="${id}"]`, a.dark.accent, a.dark.on)).toBe(true);
  });

  it("CSS에 ACCENTS에 없는 강조 규칙은 없다", () => {
    const ids = new Set(colored.map((a) => a.id));
    for (const m of css.matchAll(/data-accent="([a-z]+)"/g)) expect(ids.has(m[1] as never)).toBe(true);
  });
});

describe("setAccent / readAccent", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-accent");
  });
  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-accent");
  });

  it("고른 색을 저장하고 html에 표시한다", () => {
    setAccent("teal");
    expect(readAccent()).toBe("teal");
    expect(document.documentElement.getAttribute("data-accent")).toBe("teal");
  });

  it("기본으로 돌아가면 저장값과 속성을 지운다", () => {
    setAccent("red");
    setAccent("default");
    expect(readAccent()).toBe("default");
    expect(localStorage.getItem("sc-accent")).toBeNull();
    expect(document.documentElement.hasAttribute("data-accent")).toBe(false);
  });

  it("저장소에 이상한 값이 있으면 기본으로 읽는다", () => {
    localStorage.setItem("sc-accent", "<script>");
    expect(readAccent()).toBe("default");
  });
});

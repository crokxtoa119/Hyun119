import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { EXPERIMENTS } from "./experiments";
import { PRESET_TOOLS } from "./presetRegistry";

describe("PRESET_TOOLS", () => {
  it("키는 sc-<슬러그>-presets 규칙이고 중복이 없다", () => {
    for (const t of PRESET_TOOLS) expect(t.key).toBe(`sc-${t.slug}-presets`);
    expect(new Set(PRESET_TOOLS.map((t) => t.key)).size).toBe(PRESET_TOOLS.length);
    expect(new Set(PRESET_TOOLS.map((t) => t.label)).size).toBe(PRESET_TOOLS.length);
  });

  it("모든 실험에 프리셋 도구가 있고, 실험에 없는 도구는 없다", () => {
    expect(PRESET_TOOLS.map((t) => t.slug).sort()).toEqual(EXPERIMENTS.map((e) => e.slug).sort());
  });

  it("컴포넌트가 실제로 쓰는 저장 키와 일치한다", () => {
    const dir = join(process.cwd(), "src", "components");
    const used = new Set<string>();
    for (const f of readdirSync(dir).filter((n) => n.endsWith(".tsx") && !n.endsWith(".test.tsx"))) {
      const src = readFileSync(join(dir, f), "utf8");
      for (const m of src.matchAll(/usePresets\(\s*"(sc-[a-z-]+-presets)"/g)) used.add(m[1]);
    }
    expect([...used].sort()).toEqual(PRESET_TOOLS.map((t) => t.key).sort());
  });

  it("검증 함수는 이상한 값을 거부한다", () => {
    for (const t of PRESET_TOOLS) {
      expect(t.validate(null)).toBe(false);
      expect(t.validate("x")).toBe(false);
      expect(t.validate({})).toBe(false);
    }
  });
});

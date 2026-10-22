import { describe, expect, it } from "vitest";
import {
  DEFAULT_GRAIN,
  GRAIN_LIMITS,
  clampGrain,
  grainDataUri,
  grainSvg,
  grainToCss,
  isGrainState,
  type GrainState,
} from "./grain";

const grain = (patch: Partial<GrainState> = {}): GrainState => ({ ...DEFAULT_GRAIN, ...patch });

describe("clampGrain", () => {
  it("기본값은 그대로 둔다", () => {
    expect(clampGrain(DEFAULT_GRAIN)).toEqual(DEFAULT_GRAIN);
  });

  it("각 값을 범위 안의 정수로 맞춘다", () => {
    const r = clampGrain(grain({ frequency: 9999, octaves: 0, seed: -3, opacity: 250 }));
    expect(r.frequency).toBe(GRAIN_LIMITS.frequency.max);
    expect(r.octaves).toBe(GRAIN_LIMITS.octaves.min);
    expect(r.seed).toBe(GRAIN_LIMITS.seed.min);
    expect(r.opacity).toBe(GRAIN_LIMITS.opacity.max);
  });

  it("알 수 없는 종류와 섞기 방식은 기본값으로 되돌린다", () => {
    const bad = { ...DEFAULT_GRAIN, kind: "x", blend: "difference" } as unknown as GrainState;
    const r = clampGrain(bad);
    expect(r.kind).toBe(DEFAULT_GRAIN.kind);
    expect(r.blend).toBe(DEFAULT_GRAIN.blend);
  });
});

describe("grainSvg", () => {
  it("설정값이 feTurbulence 속성으로 들어간다", () => {
    const svg = grainSvg(grain({ kind: "turbulence", frequency: 65, octaves: 4, seed: 12 }));
    expect(svg).toContain("type='turbulence'");
    expect(svg).toContain("baseFrequency='0.65'");
    expect(svg).toContain("numOctaves='4'");
    expect(svg).toContain("seed='12'");
    expect(svg).toContain("stitchTiles='stitch'");
  });

  it("흑백이면 채도를 0으로 하는 feColorMatrix가 들어가고, 아니면 빠진다", () => {
    expect(grainSvg(grain({ mono: true }))).toContain("<feColorMatrix type='saturate' values='0'/>");
    expect(grainSvg(grain({ mono: false }))).not.toContain("feColorMatrix");
  });
});

describe("grainDataUri", () => {
  it("<, >, #가 모두 인코딩되어 CSS url()에 그대로 쓸 수 있다", () => {
    const uri = grainDataUri(DEFAULT_GRAIN);
    expect(uri.startsWith("data:image/svg+xml,%3Csvg")).toBe(true);
    expect(uri).not.toMatch(/[<>#"]/);
    expect(uri).toContain("filter='url(%23n)'");
  });

  it("글자 그대로의 %는 남지 않고 %25로 바뀐다", () => {
    const uri = grainDataUri(DEFAULT_GRAIN);
    expect(uri).toContain("width='100%25'");
    // 남은 %는 모두 두 자리 16진수가 뒤따르는 인코딩이다
    expect(uri.match(/%(?![0-9A-F]{2})/g)).toBeNull();
  });

  it("디코딩하면 원래 SVG와 같다", () => {
    expect(decodeURIComponent(grainDataUri(DEFAULT_GRAIN).replace("data:image/svg+xml,", ""))).toBe(
      grainSvg(DEFAULT_GRAIN),
    );
  });
});

describe("grainToCss", () => {
  it("::after 질감 층의 규칙을 만든다", () => {
    const css = grainToCss(DEFAULT_GRAIN);
    expect(css).toContain(".grain {\n  position: relative;\n}");
    expect(css).toContain(".grain::after {");
    expect(css).toContain('  content: "";');
    expect(css).toContain("  inset: 0;");
    expect(css).toContain(`  background-image: url("${grainDataUri(DEFAULT_GRAIN)}");`);
    expect(css).toContain("  opacity: 0.3;");
    expect(css).toContain("  mix-blend-mode: overlay;");
    expect(css).toContain("  pointer-events: none;");
  });

  it("normal이면 mix-blend-mode를 쓰지 않는다", () => {
    expect(grainToCss(grain({ blend: "normal" }))).not.toContain("mix-blend-mode");
  });

  it("불투명도를 0~1 값으로 쓴다", () => {
    expect(grainToCss(grain({ opacity: 0 }))).toContain("opacity: 0;");
    expect(grainToCss(grain({ opacity: 100 }))).toContain("opacity: 1;");
    expect(grainToCss(grain({ opacity: 45 }))).toContain("opacity: 0.45;");
  });
});

describe("isGrainState", () => {
  it("올바른 값만 통과시킨다", () => {
    expect(isGrainState(DEFAULT_GRAIN)).toBe(true);
    expect(isGrainState({ ...DEFAULT_GRAIN, kind: "x" })).toBe(false);
    expect(isGrainState({ ...DEFAULT_GRAIN, blend: "difference" })).toBe(false);
    expect(isGrainState({ ...DEFAULT_GRAIN, mono: "yes" })).toBe(false);
    expect(isGrainState({ ...DEFAULT_GRAIN, seed: NaN })).toBe(false);
    expect(isGrainState(null)).toBe(false);
  });
});

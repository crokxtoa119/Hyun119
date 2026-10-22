import { describe, expect, it } from "vitest";
import { HARMONIES, readableTextColor } from "./color";
import { DEFAULT_RADIUS } from "./radius";
import { encodeShare } from "./shareLink";
import {
  DEFAULT_PALETTE,
  EMPTY_KIT,
  clampKit,
  defaultRoles,
  isKitRadius,
  isKitShadow,
  isKitTypography,
  isStyleKit,
  kitColors,
  kitStyleVars,
  kitToCss,
  kitTokens,
  nearestStep,
  sameValue,
  toKitRadius,
  toKitShadow,
  toKitTypography,
  type StyleKit,
} from "./styleKit";

const kit = (patch: Partial<StyleKit> = {}): StyleKit => ({ ...EMPTY_KIT, ...patch });
const tokenMap = (k: StyleKit, target?: "export" | "preview") =>
  Object.fromEntries(kitTokens(k, target).map((t) => [t.name, t.value]));

const FULL: StyleKit = {
  palette: { h: 10, s: 80, l: 50, harmony: "triadic" },
  gradient: {
    kind: "conic",
    angle: 45,
    stops: [
      { color: "#FF0000", pos: 0 },
      { color: "#00FF00", pos: 25 },
      { color: "#0000FF", pos: 50 },
      { color: "#FFFF00", pos: 75 },
      { color: "#FF00FF", pos: 100 },
    ],
  },
  typeScale: { base: 18, ratio: 1.333, up: 6, down: 3, unit: "px" },
  typography: { fontKey: "playfair", weight: 700, tracking: -0.05, leading: 1.25 },
  radius: DEFAULT_RADIUS,
  shadow: { x: -4, y: 12, blur: 32, spread: -2, shadowColor: "#6366F1", shadowAlpha: 0.35, inset: false },
  roles: { primary: 0, secondary: 2, accent: 3 },
};

describe("기본 키트", () => {
  it("알려진 값: 아무것도 고르지 않은 키트의 CSS", () => {
    expect(kitToCss(EMPTY_KIT)).toBe(
      [
        ":root {",
        "  /* Colors */",
        "  --color-1: #3CDDA7;",
        "  --color-2: #3CC2DD;",
        "  --color-3: #3C71DD;",
        "  --color-4: #573CDD;",
        "  --color-5: #A73CDD;",
        "  --color-primary: var(--color-3);",
        "  --color-secondary: var(--color-2);",
        "  --color-accent: var(--color-5);",
        "  --color-on-primary: #FFFFFF;",
        "  --color-on-secondary: #000000;",
        "  --color-on-accent: #FFFFFF;",
        "",
        "  /* Gradient */",
        "  --gradient: linear-gradient(135deg, var(--color-primary), var(--color-accent));",
        "",
        "  /* Type scale */",
        "  --step--2: 0.64rem;",
        "  --step--1: 0.8rem;",
        "  --step-0: 1rem;",
        "  --step-1: 1.25rem;",
        "  --step-2: 1.5625rem;",
        "  --step-3: 1.9531rem;",
        "  --step-4: 2.4414rem;",
        "  --step-5: 3.0518rem;",
        "",
        "  /* Typography */",
        '  --font-family: "Geist", sans-serif;',
        "  --heading-weight: 700;",
        "  --heading-letter-spacing: -0.02em;",
        "  --heading-line-height: 1.20;",
        "",
        "  /* Shape */",
        "  --radius: 12px;",
        "  --shadow: 0px 8px 24px 0px rgba(0, 0, 0, 0.12);",
        "}",
      ].join("\n"),
    );
  });

  it("기본 팔레트는 Color Palette 도구의 기본값(220, 70, 55, 유사색)이다", () => {
    expect(DEFAULT_PALETTE).toEqual({ h: 220, s: 70, l: 55, harmony: "analogous" });
    expect(kitColors(EMPTY_KIT)).toHaveLength(5);
  });

  it("토큰 이름은 겹치지 않는다", () => {
    for (const k of [EMPTY_KIT, FULL]) {
      const names = kitTokens(k).map((t) => t.name);
      expect(new Set(names).size).toBe(names.length);
    }
  });
});

describe("kitTokens: 도구별 반영", () => {
  it("팔레트를 고르면 다섯 색이 바뀌고 역할은 var()로 가리킨다", () => {
    const k = kit({ palette: FULL.palette, roles: { primary: 0, secondary: 2, accent: 3 } });
    const t = tokenMap(k);
    expect(t["--color-1"]).toBe(kitColors(k)[0]);
    expect(t["--color-primary"]).toBe("var(--color-1)");
    expect(t["--color-secondary"]).toBe("var(--color-3)");
    expect(t["--color-accent"]).toBe("var(--color-4)");
  });

  it("글자색은 각 역할 색 위에서 읽히는 흑/백이다", () => {
    const k = kit({ palette: FULL.palette, roles: { primary: 0, secondary: 2, accent: 3 } });
    const colors = kitColors(k);
    const t = tokenMap(k);
    expect(t["--color-on-primary"]).toBe(readableTextColor(colors[0]));
    expect(t["--color-on-secondary"]).toBe(readableTextColor(colors[2]));
    expect(t["--color-on-accent"]).toBe(readableTextColor(colors[3]));
  });

  it("그라디언트를 고르면 그 값을, 아니면 주색에서 강조색으로 가는 기본 그라디언트를 쓴다", () => {
    expect(tokenMap(kit({ gradient: FULL.gradient }))["--gradient"]).toBe(
      "conic-gradient(from 45deg, #FF0000 0%, #00FF00 25%, #0000FF 50%, #FFFF00 75%, #FF00FF 100%)",
    );
    expect(tokenMap(EMPTY_KIT)["--gradient"]).toContain("var(--color-primary), var(--color-accent)");
  });

  it("타입 스케일의 단계 수와 단위가 변수에 반영된다", () => {
    const t = tokenMap(kit({ typeScale: FULL.typeScale }));
    const steps = Object.keys(t).filter((n) => n.startsWith("--step-"));
    expect(steps).toHaveLength(10);
    expect(t["--step-0"]).toBe("18px");
    expect(t["--step--3"]).toMatch(/px$/);
  });

  it("타이포그래피는 폰트는 전체 글자용, 굵기·자간·행간은 제목용 변수로 쓴다", () => {
    const t = tokenMap(kit({ typography: FULL.typography }));
    expect(t["--font-family"]).toBe('"Playfair Display", serif');
    expect(t["--heading-weight"]).toBe("700");
    expect(t["--heading-letter-spacing"]).toBe("-0.05em");
    expect(t["--heading-line-height"]).toBe("1.25");
    // 본문 전체에 걸리는 변수 이름은 만들지 않는다
    expect(Object.keys(t)).not.toContain("--font-weight");
    expect(Object.keys(t)).not.toContain("--line-height");
  });

  it("미리보기용 글꼴은 next/font 변수를, 내려받는 글꼴은 이름을 가리킨다", () => {
    const k = kit({ typography: FULL.typography });
    expect(tokenMap(k, "preview")["--font-family"]).toBe("var(--font-playfair), serif");
    expect(tokenMap(k, "export")["--font-family"]).toBe('"Playfair Display", serif');
  });

  it("모서리와 그림자를 고르면 그 값이 반영된다", () => {
    const t = tokenMap(kit({ radius: FULL.radius, shadow: FULL.shadow }));
    expect(t["--radius"]).toBe("30% 70% 70% 30% / 30% 30% 70% 70%");
    expect(t["--shadow"]).toBe("-4px 12px 32px -2px rgba(99, 102, 241, 0.35)");
  });
});

describe("kitToCss / kitStyleVars", () => {
  it("묶음마다 한 번씩 주석이 있고 빈 줄로 구분된다", () => {
    const css = kitToCss(FULL);
    for (const g of ["Colors", "Gradient", "Type scale", "Typography", "Shape"]) {
      expect(css.match(new RegExp(`/\\* ${g} \\*/`, "g"))).toHaveLength(1);
    }
    expect(css.startsWith(":root {\n  /* Colors */")).toBe(true);
    expect(css.endsWith("\n}")).toBe(true);
  });

  it("미리보기 변수는 같은 이름의 토큰을 객체로 돌려준다", () => {
    const vars = kitStyleVars(FULL);
    expect(vars["--color-primary"]).toBe("var(--color-1)");
    expect(vars["--font-family"]).toBe("var(--font-playfair), serif");
    expect(Object.keys(vars)).toEqual(kitTokens(FULL, "preview").map((t) => t.name));
  });
});

describe("defaultRoles", () => {
  it("모든 배색 규칙에서 세 역할이 서로 다른 0~4 자리다", () => {
    for (const { value } of HARMONIES) {
      const r = defaultRoles(value);
      const idx = [r.primary, r.secondary, r.accent];
      expect(new Set(idx).size).toBe(3);
      for (const i of idx) {
        expect(i).toBeGreaterThanOrEqual(0);
        expect(i).toBeLessThanOrEqual(4);
      }
    }
  });

  it("주색은 배색 규칙의 기준색 자리다", () => {
    expect(defaultRoles("analogous").primary).toBe(2);
    expect(defaultRoles("complementary").primary).toBe(1);
    expect(defaultRoles("triadic").primary).toBe(0);
    expect(EMPTY_KIT.roles).toEqual(defaultRoles("analogous"));
  });
});

describe("clampKit", () => {
  it("범위 안의 키트는 그대로 둔다", () => {
    expect(clampKit(FULL)).toEqual(FULL);
    expect(clampKit(EMPTY_KIT)).toEqual(EMPTY_KIT);
  });

  it("범위를 벗어난 값을 각 도구와 같은 범위로 맞춘다", () => {
    const wild: StyleKit = {
      ...FULL,
      palette: { h: 999, s: -5, l: 300, harmony: "analogous" },
      typography: { fontKey: "playfair", weight: 100, tracking: 9, leading: 0 },
      shadow: { ...FULL.shadow!, x: 999, blur: -3, shadowAlpha: 7, shadowColor: "#abcdef" },
      roles: { primary: 9, secondary: -1, accent: 2.6 },
    };
    const r = clampKit(wild);
    expect(r.palette).toEqual({ h: 360, s: 0, l: 100, harmony: "analogous" });
    // Playfair는 굵기 400부터 지원한다
    expect(r.typography).toEqual({ fontKey: "playfair", weight: 400, tracking: 0.5, leading: 0.8 });
    expect(r.shadow).toMatchObject({ x: 50, blur: 0, shadowAlpha: 1, shadowColor: "#ABCDEF" });
    expect(r.roles).toEqual({ primary: 4, secondary: 0, accent: 3 });
  });

  it("알 수 없는 폰트와 배색 규칙은 기본으로 돌린다", () => {
    const bad = clampKit({
      ...EMPTY_KIT,
      palette: { h: 1, s: 1, l: 1, harmony: "x" } as unknown as StyleKit["palette"],
      typography: { fontKey: "없음", weight: 400, tracking: 0, leading: 1.5 },
    });
    expect(bad.palette!.harmony).toBe("analogous");
    expect(bad.typography!.fontKey).toBe("geist");
  });
});

describe("isStyleKit", () => {
  it("올바른 키트는 통과하고 JSON을 거쳐도 같다", () => {
    expect(isStyleKit(EMPTY_KIT)).toBe(true);
    expect(isStyleKit(FULL)).toBe(true);
    expect(isStyleKit(JSON.parse(JSON.stringify(FULL)))).toBe(true);
  });

  it("틀린 값이 하나라도 있으면 거부한다", () => {
    expect(isStyleKit(null)).toBe(false);
    expect(isStyleKit({ ...FULL, roles: undefined })).toBe(false);
    expect(isStyleKit({ ...FULL, roles: { primary: 0, secondary: 1 } })).toBe(false);
    expect(isStyleKit({ ...FULL, palette: { h: 1 } })).toBe(false);
    expect(isStyleKit({ ...FULL, shadow: { ...FULL.shadow, shadowColor: "red" } })).toBe(false);
    expect(isStyleKit({ ...FULL, typography: { ...FULL.typography, fontKey: "x" } })).toBe(false);
    expect(isStyleKit({ ...FULL, typeScale: { base: 16 } })).toBe(false);
    expect(isStyleKit({ ...FULL, gradient: { kind: "linear", angle: 0, stops: [] } })).toBe(false);
  });

  it("부분 검증기도 올바른 값만 통과시킨다", () => {
    expect(isKitTypography(FULL.typography)).toBe(true);
    expect(isKitTypography({ fontKey: "geist" })).toBe(false);
    expect(isKitShadow(FULL.shadow)).toBe(true);
    expect(isKitShadow({ ...FULL.shadow, inset: "no" })).toBe(false);
    expect(isKitRadius(DEFAULT_RADIUS)).toBe(true);
    expect(isKitRadius({ tlH: 1 })).toBe(false);
  });
});

describe("도구 프리셋 → 키트 값", () => {
  it("타이포그래피는 예시 글, 크기, 정렬을 뺀다", () => {
    expect(
      toKitTypography({ fontKey: "geist", text: "긴 예시 글", size: 56, weight: 600, tracking: 0.1, leading: 1.2, align: "center" }),
    ).toEqual({ fontKey: "geist", weight: 600, tracking: 0.1, leading: 1.2 });
  });

  it("그림자는 shadow 모드만 담고 glass 모드는 null이다", () => {
    const base = { x: 1, y: 2, blur: 3, spread: 4, shadowColor: "#000000", shadowAlpha: 0.5, inset: true, glassBlur: 10, glassAlpha: 0.2, borderAlpha: 0.1, saturate: 150, tint: "#FFFFFF" };
    expect(toKitShadow({ ...base, mode: "shadow" })).toEqual({ x: 1, y: 2, blur: 3, spread: 4, shadowColor: "#000000", shadowAlpha: 0.5, inset: true });
    expect(toKitShadow({ ...base, mode: "glass" })).toBeNull();
  });

  it("모서리는 linked를 뺀 여덟 값만 담는다", () => {
    const r = toKitRadius({ ...DEFAULT_RADIUS, linked: true });
    expect(r).toEqual(DEFAULT_RADIUS);
    expect("linked" in r).toBe(false);
  });
});

describe("nearestStep", () => {
  it("타입 스케일에 있는 단계는 그대로, 없는 단계는 가장 가까운 끝 단계로 맞춘다", () => {
    expect(nearestStep(EMPTY_KIT, 4)).toBe(4);
    expect(nearestStep(EMPTY_KIT, 9)).toBe(5);
    expect(nearestStep(EMPTY_KIT, -5)).toBe(-2);
    const short = kit({ typeScale: { base: 16, ratio: 1.25, up: 1, down: 0, unit: "rem" } });
    expect(nearestStep(short, 4)).toBe(1);
    expect(nearestStep(short, -1)).toBe(0);
  });
});

describe("sameValue", () => {
  it("키 순서가 달라도 같은 값이면 true다", () => {
    expect(sameValue({ a: 1, b: { c: [1, 2], d: "x" } }, { b: { d: "x", c: [1, 2] }, a: 1 })).toBe(true);
    expect(toKitRadius({ ...DEFAULT_RADIUS, linked: false })).toSatisfy((r: unknown) => sameValue(r, DEFAULT_RADIUS));
  });

  it("값이 하나라도 다르면 false다", () => {
    expect(sameValue({ a: 1 }, { a: 2 })).toBe(false);
    expect(sameValue([1, 2], [2, 1])).toBe(false);
    expect(sameValue(null, {})).toBe(false);
    expect(sameValue(null, null)).toBe(true);
  });
});

describe("공유 링크 길이", () => {
  it("가장 큰 키트도 주소창에 붙는 한도(4000자)보다 훨씬 짧다", () => {
    expect(encodeShare(FULL).length).toBeLessThan(2000);
  });
});

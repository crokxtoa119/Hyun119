import { describe, expect, it } from "vitest";
import {
  DEFAULT_SCROLL,
  MIN_GAP,
  SCROLL_LIMITS,
  clampScroll,
  effectVars,
  isScrollTriggerState,
  scrollTriggerToJs,
  triggerVars,
  tweenVars,
  type ScrollTriggerState,
} from "./scrollTrigger";

const state = (patch: Partial<ScrollTriggerState> = {}): ScrollTriggerState => ({
  ...DEFAULT_SCROLL,
  ...patch,
});

describe("clampScroll", () => {
  it("기본값은 그대로 둔다", () => {
    expect(clampScroll(DEFAULT_SCROLL)).toEqual(DEFAULT_SCROLL);
  });

  it("각 값을 범위 안으로 맞춘다", () => {
    const r = clampScroll(state({ start: 500, end: -20, smooth: 99, distance: -5 }));
    expect(r.start).toBe(SCROLL_LIMITS.start.max);
    expect(r.end).toBe(SCROLL_LIMITS.end.min);
    expect(r.smooth).toBe(SCROLL_LIMITS.smooth.max);
    expect(r.distance).toBe(SCROLL_LIMITS.distance.min);
  });

  it("끝 지점은 시작 지점보다 MIN_GAP 이상 위로 밀어 올린다", () => {
    expect(clampScroll(state({ start: 50, end: 70 })).end).toBe(50 - MIN_GAP);
    expect(clampScroll(state({ start: 50, end: 50 })).end).toBe(50 - MIN_GAP);
    expect(clampScroll(state({ start: 50, end: 10 })).end).toBe(10);
  });

  it("smooth는 0.5초 단위로 맞춘다", () => {
    expect(clampScroll(state({ smooth: 1.3 })).smooth).toBe(1.5);
    expect(clampScroll(state({ smooth: 0.2 })).smooth).toBe(0);
  });

  it("알 수 없는 효과와 방식은 기본값으로 되돌린다", () => {
    const bad = { ...DEFAULT_SCROLL, effect: "spin", mode: "x" } as unknown as ScrollTriggerState;
    const r = clampScroll(bad);
    expect(r.effect).toBe(DEFAULT_SCROLL.effect);
    expect(r.mode).toBe(DEFAULT_SCROLL.mode);
  });
});

describe("effectVars", () => {
  it("효과마다 시작과 끝 값이 다르다", () => {
    expect(effectVars(state({ effect: "fade-up", distance: 80 }))).toEqual({
      from: { y: 80, opacity: 0 },
      to: { y: 0, opacity: 1 },
    });
    expect(effectVars(state({ effect: "slide-left", distance: 80 })).from).toEqual({ x: -80, opacity: 0 });
    expect(effectVars(state({ effect: "scale" })).from).toEqual({ scale: 0.5, opacity: 0 });
    expect(effectVars(state({ effect: "rotate" })).from).toEqual({ rotation: -90, opacity: 0 });
  });
});

describe("triggerVars / tweenVars", () => {
  it("scrub은 시작과 끝을 쓰고, smooth가 0이면 true다", () => {
    expect(triggerVars(state({ start: 80, end: 40, smooth: 1 }))).toEqual({
      start: "top 80%",
      end: "top 40%",
      scrub: 1,
    });
    expect(triggerVars(state({ smooth: 0 })).scrub).toBe(true);
  });

  it("한 번 재생은 end와 scrub이 없고 toggleActions를 쓴다", () => {
    const t = triggerVars(state({ mode: "play" }));
    expect(t).toEqual({ start: "top 80%", toggleActions: "play none none reverse" });
    expect(tweenVars(state({ mode: "play" }))).toMatchObject({ duration: 0.8, ease: "power3.out" });
  });

  it("scrub의 이징은 none이고 duration이 없다", () => {
    const t = tweenVars(state());
    expect(t.ease).toBe("none");
    expect(t).not.toHaveProperty("duration");
  });
});

describe("scrollTriggerToJs", () => {
  it("알려진 값: 기본 설정의 코드", () => {
    expect(scrollTriggerToJs(DEFAULT_SCROLL)).toBe(
      [
        "gsap.registerPlugin(ScrollTrigger);",
        "",
        "gsap.fromTo(",
        '  ".box",',
        "  { y: 100, opacity: 0 },",
        "  {",
        "    y: 0,",
        "    opacity: 1,",
        '    ease: "none",',
        "    scrollTrigger: {",
        '      trigger: ".box-wrap",',
        '      start: "top 80%",',
        '      end: "top 40%",',
        "      scrub: 1,",
        "    },",
        "  },",
        ");",
      ].join("\n"),
    );
  });

  it("한 번 재생 코드에는 toggleActions가 들어가고 scrub은 없다", () => {
    const code = scrollTriggerToJs(state({ mode: "play", effect: "scale" }));
    expect(code).toContain('toggleActions: "play none none reverse"');
    expect(code).toContain("{ scale: 0.5, opacity: 0 }");
    expect(code).not.toContain("scrub");
    expect(code).not.toContain("end:");
  });
});

describe("isScrollTriggerState", () => {
  it("올바른 값만 통과시킨다", () => {
    expect(isScrollTriggerState(DEFAULT_SCROLL)).toBe(true);
    expect(isScrollTriggerState({ ...DEFAULT_SCROLL, effect: "spin" })).toBe(false);
    expect(isScrollTriggerState({ ...DEFAULT_SCROLL, start: "80" })).toBe(false);
    expect(isScrollTriggerState({ ...DEFAULT_SCROLL, end: NaN })).toBe(false);
    expect(isScrollTriggerState(null)).toBe(false);
  });
});

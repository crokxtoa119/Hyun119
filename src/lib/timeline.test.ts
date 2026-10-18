import { describe, expect, it } from "vitest";
import {
  buildTimelineCode,
  clampTween,
  DEFAULT_TWEENS,
  isTimeline,
  isTimelineTween,
  PROPS,
  totalDuration,
  type TimelineTween,
} from "./timeline";

const tween = (patch: Partial<TimelineTween> = {}): TimelineTween => ({
  box: 0,
  prop: "x",
  to: 50,
  start: 0,
  duration: 1,
  ease: "power2.out",
  ...patch,
});

describe("isTimelineTween / isTimeline", () => {
  it("기본 트윈과 올바른 값을 통과시킨다", () => {
    expect(isTimeline(DEFAULT_TWEENS)).toBe(true);
    expect(isTimelineTween(tween())).toBe(true);
  });

  it("트윈은 1~3개만 허용한다", () => {
    expect(isTimeline([])).toBe(false);
    expect(isTimeline([tween(), tween(), tween(), tween()])).toBe(false);
    expect(isTimeline([tween(), tween(), tween()])).toBe(true);
  });

  it.each([
    ["알 수 없는 속성", { prop: "width" }],
    ["허용되지 않은 이징", { ease: "power9.out" }],
    ["범위 밖 상자 번호", { box: 3 }],
    ["정수가 아닌 상자 번호", { box: 0.5 }],
    ["숫자가 아닌 값", { duration: "1" }],
    ["NaN", { start: NaN }],
    ["Infinity", { to: Infinity }],
  ])("%s는 거부한다", (_, patch) => {
    expect(isTimelineTween({ ...tween(), ...patch })).toBe(false);
  });

  it("객체가 아니거나 배열이 아니면 거부한다", () => {
    expect(isTimeline(null)).toBe(false);
    expect(isTimeline("x")).toBe(false);
    expect(isTimeline({ 0: tween() })).toBe(false);
    expect(isTimelineTween([])).toBe(false);
  });
});

describe("clampTween", () => {
  it("슬라이더 범위로 되돌린다", () => {
    const c = clampTween(tween({ to: 9999, start: -5, duration: 99 }));
    expect(c.to).toBe(PROPS.x.max);
    expect(c.start).toBe(0);
    expect(c.duration).toBe(3);
  });

  it("속성마다 다른 범위를 쓴다", () => {
    expect(clampTween(tween({ prop: "opacity", to: 5 })).to).toBe(1);
    expect(clampTween(tween({ prop: "scale", to: -1 })).to).toBe(PROPS.scale.min);
  });

  it("범위 안의 값은 그대로 둔다", () => {
    const t = tween({ to: 30, start: 1.5, duration: 0.5 });
    expect(clampTween(t)).toEqual(t);
  });
});

describe("totalDuration", () => {
  it("가장 늦게 끝나는 트윈의 끝 시각이다", () => {
    expect(totalDuration([tween({ start: 0, duration: 1 }), tween({ start: 2, duration: 0.5 })])).toBe(2.5);
  });

  it("먼저 시작해도 길면 그쪽이 기준이다", () => {
    expect(totalDuration([tween({ start: 0, duration: 3 }), tween({ start: 1, duration: 1 })])).toBe(3);
  });
});

describe("buildTimelineCode", () => {
  it("트윈마다 .to 호출과 시작 위치를 만든다", () => {
    const code = buildTimelineCode([
      tween({ box: 0, prop: "x", to: 100, start: 0, duration: 0.8 }),
      tween({ box: 2, prop: "rotation", to: 180, start: 0.3, duration: 1, ease: "back.out" }),
    ]);
    expect(code).toBe(
      [
        "const tl = gsap.timeline();",
        "",
        "tl",
        '  .to(".box-1", { x: 100, duration: 0.8, ease: "power2.out" }, 0)',
        '  .to(".box-3", { rotation: 180, duration: 1, ease: "back.out" }, 0.3);',
      ].join("\n"),
    );
  });

  it("부동소수점 오차를 지운다", () => {
    const code = buildTimelineCode([tween({ start: 0.1 + 0.2, duration: 0.7 + 0.1 })]);
    expect(code).toContain("duration: 0.8,");
    expect(code).toContain("}, 0.3);");
  });
});

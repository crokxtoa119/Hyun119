import { describe, expect, it } from "vitest";
import {
  DEFAULT_RADIUS,
  RADIUS_KEYS,
  clampRadius,
  linkVertical,
  radiusToCss,
  randomBlob,
  type Radius,
} from "./radius";

const uniform = (n: number): Radius => ({
  tlH: n,
  trH: n,
  brH: n,
  blH: n,
  tlV: n,
  trV: n,
  brV: n,
  blV: n,
});

describe("radiusToCss", () => {
  it("모든 값이 같으면 한 값으로 줄인다", () => {
    expect(radiusToCss(uniform(50))).toBe("border-radius: 50%;");
    expect(radiusToCss(uniform(0))).toBe("border-radius: 0%;");
  });

  it("가로와 세로가 같으면 슬래시 없이 네 값만 쓴다", () => {
    const r = { ...uniform(0), tlH: 10, trH: 20, brH: 30, blH: 40 };
    const sym = { ...r, tlV: 10, trV: 20, brV: 30, blV: 40 };
    expect(radiusToCss(sym)).toBe("border-radius: 10% 20% 30% 40%;");
  });

  it("가로와 세로가 다르면 슬래시로 나눈다", () => {
    expect(radiusToCss(DEFAULT_RADIUS)).toBe("border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;");
  });

  it("한쪽만 같은 값이어도 다른 쪽은 네 값으로 쓴다", () => {
    const r = { ...uniform(20), tlV: 60 };
    expect(radiusToCss(r)).toBe("border-radius: 20% / 60% 20% 20% 20%;");
  });
});

describe("clampRadius", () => {
  it("범위를 벗어난 값을 0~100으로 보정하고 반올림한다", () => {
    const out = clampRadius({ ...uniform(50), tlH: -20, trH: 140, brH: 33.6, blH: Number.MAX_VALUE });
    expect(out.tlH).toBe(0);
    expect(out.trH).toBe(100);
    expect(out.brH).toBe(34);
    expect(out.blH).toBe(100);
  });

  it("원본을 바꾸지 않는다", () => {
    const input = { ...uniform(50), tlH: 200 };
    clampRadius(input);
    expect(input.tlH).toBe(200);
  });
});

describe("linkVertical", () => {
  it("세로 값을 가로 값에 맞춘다", () => {
    const out = linkVertical(DEFAULT_RADIUS);
    expect(out.tlV).toBe(DEFAULT_RADIUS.tlH);
    expect(out.trV).toBe(DEFAULT_RADIUS.trH);
    expect(out.brV).toBe(DEFAULT_RADIUS.brH);
    expect(out.blV).toBe(DEFAULT_RADIUS.blH);
    expect(radiusToCss(out)).not.toContain("/");
  });
});

describe("randomBlob", () => {
  it("난수가 0과 1의 극단이어도 30~70% 안에 머문다", () => {
    for (const rand of [() => 0, () => 0.999999, () => 0.5]) {
      const r = randomBlob(rand);
      for (const k of RADIUS_KEYS) {
        expect(r[k]).toBeGreaterThanOrEqual(30);
        expect(r[k]).toBeLessThanOrEqual(70);
      }
    }
  });

  it("마주 보는 변의 합이 100이다", () => {
    const r = randomBlob(() => 0.3);
    expect(r.tlH + r.trH).toBe(100);
    expect(r.blH + r.brH).toBe(100);
    expect(r.tlV + r.blV).toBe(100);
    expect(r.trV + r.brV).toBe(100);
  });
});

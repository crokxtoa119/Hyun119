import { describe, expect, it } from "vitest";
import {
  EMPTY_ACTIVITY,
  MAX_DAYS,
  recordVisit,
  sanitizeActivity,
  streaks,
  summarize,
} from "./activityLog";

const at = (s: string) => new Date(`${s}T12:00:00`);

describe("recordVisit", () => {
  it("처음 열면 횟수 1과 첫·마지막 날짜를 남긴다", () => {
    const a = recordVisit(EMPTY_ACTIVITY, "grid", at("2026-10-21"));
    expect(a.visits.grid).toEqual({ count: 1, first: "2026-10-21", last: "2026-10-21" });
    expect(a.days).toEqual(["2026-10-21"]);
  });

  it("다시 열면 횟수만 늘고 첫 날짜는 그대로다", () => {
    let a = recordVisit(EMPTY_ACTIVITY, "grid", at("2026-10-20"));
    a = recordVisit(a, "grid", at("2026-10-21"));
    expect(a.visits.grid).toEqual({ count: 2, first: "2026-10-20", last: "2026-10-21" });
  });

  it("같은 날에는 날짜가 한 번만 들어가고, 원래 기록은 바뀌지 않는다", () => {
    const a = recordVisit(EMPTY_ACTIVITY, "grid", at("2026-10-21"));
    const b = recordVisit(a, "filter", at("2026-10-21"));
    expect(b.days).toEqual(["2026-10-21"]);
    expect(a.visits.filter).toBeUndefined();
  });

  it("날짜는 최근 MAX_DAYS개만 남긴다", () => {
    let a = EMPTY_ACTIVITY;
    for (let i = 0; i < MAX_DAYS + 5; i++) {
      const d = new Date(2025, 0, 1 + i, 12);
      a = recordVisit(a, "grid", d);
    }
    expect(a.days).toHaveLength(MAX_DAYS);
    expect(a.days[0] < a.days[a.days.length - 1]).toBe(true);
  });
});

describe("streaks", () => {
  it("기록이 없으면 0이다", () => {
    expect(streaks([], "2026-10-21")).toEqual({ current: 0, longest: 0 });
  });

  it("오늘까지 이어진 연속을 센다", () => {
    expect(streaks(["2026-10-19", "2026-10-20", "2026-10-21"], "2026-10-21")).toEqual({
      current: 3,
      longest: 3,
    });
  });

  it("어제까지 이어졌으면 아직 연속이다", () => {
    expect(streaks(["2026-10-19", "2026-10-20"], "2026-10-21").current).toBe(2);
  });

  it("하루 이상 쉬었으면 현재 연속은 0이고 최장 기록은 남는다", () => {
    expect(streaks(["2026-10-10", "2026-10-11", "2026-10-12"], "2026-10-21")).toEqual({
      current: 0,
      longest: 3,
    });
  });

  it("끊긴 구간 중 가장 긴 것을 최장으로 한다", () => {
    const days = ["2026-10-01", "2026-10-02", "2026-10-05", "2026-10-06", "2026-10-07"];
    expect(streaks(days, "2026-10-07")).toEqual({ current: 3, longest: 3 });
  });

  it("월과 연도가 바뀌어도 이어진다", () => {
    expect(streaks(["2026-12-31", "2027-01-01"], "2027-01-01").current).toBe(2);
  });

  it("today가 비어 있으면(서버 렌더링) 현재 연속은 0이다", () => {
    expect(streaks(["2026-10-21"], "").current).toBe(0);
  });
});

describe("summarize", () => {
  it("열어 본 도구 수와 방문 횟수를 센다", () => {
    let a = recordVisit(EMPTY_ACTIVITY, "grid", at("2026-10-21"));
    a = recordVisit(a, "grid", at("2026-10-21"));
    a = recordVisit(a, "filter", at("2026-10-21"));
    expect(summarize(a, ["grid", "filter", "blend"], "2026-10-21")).toEqual({
      tried: 2,
      total: 3,
      visits: 3,
      days: 1,
      current: 1,
      longest: 1,
    });
  });

  it("목록에 없는 옛 도구 기록은 세지 않는다", () => {
    const a = recordVisit(EMPTY_ACTIVITY, "removed-tool", at("2026-10-21"));
    expect(summarize(a, ["grid"], "2026-10-21").tried).toBe(0);
    expect(summarize(a, ["grid"], "2026-10-21").visits).toBe(0);
  });
});

describe("sanitizeActivity", () => {
  it("올바른 기록은 그대로 읽는다", () => {
    const a = recordVisit(EMPTY_ACTIVITY, "grid", at("2026-10-21"));
    expect(sanitizeActivity(JSON.parse(JSON.stringify(a)))).toEqual(a);
  });

  it("형식이 틀린 항목만 버리고 나머지는 살린다", () => {
    const a = sanitizeActivity({
      visits: {
        ok: { count: 2, first: "2026-10-01", last: "2026-10-02" },
        zero: { count: 0, first: "2026-10-01", last: "2026-10-02" },
        nan: { count: "x", first: "2026-10-01", last: "2026-10-02" },
        baddate: { count: 1, first: "yesterday", last: "2026-10-02" },
        nul: null,
      },
      days: ["2026-10-02", "2026-10-01", "2026-10-02", "oops", 5],
    });
    expect(Object.keys(a.visits)).toEqual(["ok"]);
    expect(a.days).toEqual(["2026-10-01", "2026-10-02"]);
  });

  it("객체가 아니면 빈 기록이다", () => {
    for (const bad of [null, undefined, 3, "x", []]) {
      expect(sanitizeActivity(bad).days).toEqual([]);
      expect(sanitizeActivity(bad).visits).toEqual({});
    }
  });
});

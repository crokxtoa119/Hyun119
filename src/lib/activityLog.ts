import { localDateStamp } from "./download";

/** 도구 하나의 방문 기록. 날짜는 모두 "YYYY-MM-DD"(방문자 시간대)다. */
export type ToolVisit = { count: number; first: string; last: string };

export type Activity = {
  visits: Record<string, ToolVisit>;
  /** 사이트를 쓴 날짜, 오래된 순 */
  days: string[];
};

export const EMPTY_ACTIVITY: Activity = { visits: {}, days: [] };

/** 날짜 목록이 한없이 커지지 않게 최근 1년 남짓만 둔다. */
export const MAX_DAYS = 400;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const isDate = (v: unknown): v is string => typeof v === "string" && DATE_RE.test(v);

/** 저장된 값이 손상됐을 수 있으므로 알 수 있는 부분만 골라 새 객체로 만든다. */
export function sanitizeActivity(raw: unknown): Activity {
  if (typeof raw !== "object" || raw === null) return EMPTY_ACTIVITY;
  const r = raw as { visits?: unknown; days?: unknown };

  const visits: Record<string, ToolVisit> = {};
  if (typeof r.visits === "object" && r.visits !== null) {
    for (const [slug, v] of Object.entries(r.visits)) {
      const x = v as Partial<ToolVisit> | null;
      if (
        x &&
        typeof x.count === "number" &&
        Number.isFinite(x.count) &&
        x.count >= 1 &&
        isDate(x.first) &&
        isDate(x.last)
      ) {
        visits[slug] = { count: Math.floor(x.count), first: x.first, last: x.last };
      }
    }
  }

  const days = Array.isArray(r.days)
    ? [...new Set(r.days.filter(isDate))].sort().slice(-MAX_DAYS)
    : [];
  return { visits, days };
}

/** 방문 한 번을 더한 새 기록을 돌려준다. */
export function recordVisit(a: Activity, slug: string, now: Date): Activity {
  const today = localDateStamp(now);
  const prev = a.visits[slug];
  const visit: ToolVisit = prev
    ? { count: prev.count + 1, first: prev.first, last: today }
    : { count: 1, first: today, last: today };
  const days = a.days.includes(today) ? a.days : [...a.days, today].sort().slice(-MAX_DAYS);
  return { visits: { ...a.visits, [slug]: visit }, days };
}

const DAY_MS = 86_400_000;

/** "YYYY-MM-DD"를 정오 기준 시각으로 바꿔 서머타임이 있어도 하루 차이가 정확히 1이 되게 한다. */
const dayNumber = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return Math.round(new Date(y, m - 1, d, 12).getTime() / DAY_MS);
};

/**
 * 연속으로 방문한 일수. 오늘 또는 어제까지 이어져 있으면 현재 연속으로 치고,
 * 그보다 오래 쉬었으면(또는 today가 빈 문자열이면) 현재 연속은 0이다. longest는 지금까지의 최장 기록이다.
 * today를 날짜 문자열로 받는 것은 서버 렌더링 중에 현재 시각을 읽지 않기 위해서다.
 */
export function streaks(days: string[], today: string): { current: number; longest: number } {
  const nums = [...new Set(days)].map(dayNumber).sort((a, b) => a - b);
  if (nums.length === 0) return { current: 0, longest: 0 };

  let longest = 1;
  let run = 1;
  for (let i = 1; i < nums.length; i++) {
    run = nums[i] - nums[i - 1] === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  const last = nums[nums.length - 1];
  const diff = isDate(today) ? dayNumber(today) - last : Infinity;
  return { current: diff <= 1 ? run : 0, longest };
}

export type Summary = {
  /** 한 번이라도 열어 본 도구 수 */
  tried: number;
  total: number;
  visits: number;
  days: number;
  current: number;
  longest: number;
};

/** slugs에 없는 도구(지금은 없는 옛 기록)는 세지 않는다. */
export function summarize(a: Activity, slugs: string[], today: string): Summary {
  const known = slugs.filter((s) => a.visits[s]);
  const { current, longest } = streaks(a.days, today);
  return {
    tried: known.length,
    total: slugs.length,
    visits: known.reduce((n, s) => n + a.visits[s].count, 0),
    days: a.days.length,
    current,
    longest,
  };
}

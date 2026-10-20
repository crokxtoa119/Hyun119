import { describe, expect, it } from "vitest";
import { EXPERIMENTS } from "@/lib/experiments";
import { SITE_URL } from "@/lib/site";
import robots from "./robots";
import sitemap from "./sitemap";

describe("sitemap", () => {
  const urls = sitemap().map((e) => e.url);

  it("홈, 실험 페이지, 기록 목록과 상세를 모두 담는다", () => {
    expect(urls).toContain(SITE_URL);
    expect(urls).toContain(`${SITE_URL}/log`);
    for (const e of EXPERIMENTS) {
      expect(urls).toContain(`${SITE_URL}${e.href}`);
      expect(urls).toContain(`${SITE_URL}/log/${e.slug}`);
    }
    expect(urls).toHaveLength(2 + EXPERIMENTS.length * 2);
  });

  it("중복이 없고 모두 절대 주소다", () => {
    expect(new Set(urls).size).toBe(urls.length);
    urls.forEach((u) => expect(u).toMatch(/^https?:\/\//));
  });
});

describe("robots", () => {
  it("모든 크롤러를 허용하고 sitemap 주소를 알려준다", () => {
    const r = robots();
    expect(r.rules).toEqual({ userAgent: "*", allow: "/" });
    expect(r.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });
});

describe("SITE_URL", () => {
  it("끝에 슬래시가 없다", () => {
    expect(SITE_URL.endsWith("/")).toBe(false);
  });
});

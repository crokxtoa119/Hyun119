import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { EXPERIMENTS } from "@/lib/experiments";

// GSAP는 브라우저 렌더링이 필요하므로 훅만 비활성화하고 마크업을 검사한다
vi.mock("gsap", () => ({
  default: { registerPlugin: vi.fn(), matchMedia: vi.fn(), utils: { toArray: () => [] } },
}));
vi.mock("gsap/ScrollTrigger", () => ({ ScrollTrigger: {} }));
vi.mock("@gsap/react", () => ({ useGSAP: vi.fn() }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

import HeroIntro from "./HeroIntro";
import HomeSections from "./HomeSections";

// vitest의 globals가 꺼져 있어 Testing Library가 자동으로 정리하지 않는다
afterEach(cleanup);

describe("HeroIntro", () => {
  it("h1과 실험 카드를 모두 렌더링한다", () => {
    render(<HeroIntro />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("SketchCraft.");
    for (const e of EXPERIMENTS) {
      const link = screen.getByRole("link", { name: new RegExp(e.title) });
      expect(link.getAttribute("href")).toBe(e.href);
    }
  });
});

describe("HomeSections", () => {
  it("실험 목록을 공용 데이터 순서대로 보여준다", () => {
    const { container } = render(<HomeSections />);
    const titles = [...container.querySelectorAll(".log-item h3")].map((h) => h.textContent);
    expect(titles).toEqual(EXPERIMENTS.map((e) => e.title));
  });

  it("기록 페이지로 가는 링크가 있다", () => {
    render(<HomeSections />);
    expect(screen.getByRole("link", { name: /배운 점 기록/ }).getAttribute("href")).toBe("/log");
  });

  it("강조 막대는 스크린 리더에서 숨긴다", () => {
    const { container } = render(<HomeSections />);
    const bars = container.querySelectorAll(".log-bar");
    expect(bars).toHaveLength(EXPERIMENTS.length);
    bars.forEach((b) => expect(b.getAttribute("aria-hidden")).toBe("true"));
  });

  it("GitHub 링크는 새 탭에서 안전하게 열린다", () => {
    render(<HomeSections />);
    const gh = screen.getByRole("link", { name: /GitHub/ });
    expect(gh.getAttribute("target")).toBe("_blank");
    expect(gh.getAttribute("rel")).toContain("noopener");
  });
});

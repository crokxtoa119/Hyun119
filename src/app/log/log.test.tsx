import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { EXPERIMENTS } from "@/lib/experiments";

// 페이지 전환 링크가 쓰는 next/navigation만 가짜로 바꾼다
vi.mock("next/navigation", () => ({
  usePathname: () => "/log",
  useRouter: () => ({ push: vi.fn() }),
  notFound: vi.fn(),
}));

import LogPage from "./page";
import { generateMetadata, generateStaticParams } from "./[slug]/page";

// vitest의 globals가 꺼져 있어 Testing Library가 자동으로 정리하지 않는다
afterEach(cleanup);

describe("/log 목록 페이지", () => {
  it("모든 실험을 상세 페이지 링크로 보여준다", () => {
    render(<LogPage />);
    const links = within(screen.getByRole("list")).getAllByRole("link");
    expect(links).toHaveLength(EXPERIMENTS.length);
    EXPERIMENTS.forEach((e, i) => {
      expect(links[i].getAttribute("href")).toBe(`/log/${e.slug}`);
      expect(links[i].textContent).toContain(e.title);
    });
  });

  it("h1이 하나다", () => {
    render(<LogPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});

describe("/log/[slug] 상세 페이지", () => {
  it("실험마다 정적 경로를 만든다", () => {
    expect(generateStaticParams()).toEqual(EXPERIMENTS.map((e) => ({ slug: e.slug })));
  });

  it("제목과 설명 메타데이터를 만든다", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "palette" }),
    } as Parameters<typeof generateMetadata>[0]);
    expect(meta.title).toBe("Color Palette 기록 · SketchCraft");
    expect(meta.description).toBe(EXPERIMENTS[0].summary);
  });

  it("없는 slug면 빈 메타데이터를 돌려준다", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "nope" }),
    } as Parameters<typeof generateMetadata>[0]);
    expect(meta).toEqual({});
  });
});

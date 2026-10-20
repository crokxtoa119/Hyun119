import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { EXPERIMENTS, groupExperiments } from "@/lib/experiments";

vi.mock("next/navigation", () => ({
  usePathname: () => "/experiments",
  useRouter: () => ({ push: vi.fn() }),
}));

import ExperimentsPage from "./page";

afterEach(cleanup);

describe("ExperimentsPage", () => {
  it("분류별 제목과 모든 실험 링크를 보여준다", () => {
    render(<ExperimentsPage />);
    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual(groupExperiments().map((g) => g.label));
    for (const e of EXPERIMENTS) {
      const link = screen.getByRole("link", { name: new RegExp(e.title) });
      expect(link.getAttribute("href")).toBe(e.href);
    }
  });

  it("각 분류는 자기 제목으로 이름 붙은 영역이다", () => {
    render(<ExperimentsPage />);
    for (const g of groupExperiments()) {
      expect(screen.getByRole("region", { name: g.label })).toBeTruthy();
    }
  });
});

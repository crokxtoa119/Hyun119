import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ACTIVITY_KEY, clearActivity, trackVisit } from "@/lib/activity";
import { EXPERIMENTS } from "@/lib/experiments";
import RecordBoard from "./RecordBoard";

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

const stat = (label: string) => screen.getByText(label).closest("div")!.textContent;

describe("RecordBoard", () => {
  it("기록이 없으면 안내 문구와 0을 보여준다", () => {
    render(<RecordBoard />);
    expect(screen.getByText(/아직 기록이 없습니다/)).toBeTruthy();
    expect(stat("써 본 도구")).toContain(`0/ ${EXPERIMENTS.length}`);
  });

  it("모든 도구가 한 줄씩 나온다", () => {
    render(<RecordBoard />);
    for (const e of EXPERIMENTS) {
      expect(screen.getByRole("link", { name: e.title })).toBeTruthy();
    }
  });

  it("도구를 열면 횟수와 요약이 올라간다", () => {
    render(<RecordBoard />);
    act(() => {
      trackVisit("grid");
      trackVisit("grid");
      trackVisit("filter");
    });
    expect(stat("써 본 도구")).toContain(`2/ ${EXPERIMENTS.length}`);
    expect(stat("도구를 연 횟수")).toContain("3번");
    expect(stat("방문한 날")).toContain("1일");
    expect(screen.queryByText(/아직 기록이 없습니다/)).toBeNull();
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("2");
  });

  it("지우기를 확인하면 기록이 사라진다", () => {
    render(<RecordBoard />);
    act(() => trackVisit("grid"));
    vi.spyOn(window, "confirm").mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: "방문 기록 지우기" }));
    expect(localStorage.getItem(ACTIVITY_KEY)).toBeNull();
    expect(screen.getByText(/아직 기록이 없습니다/)).toBeTruthy();
  });

  it("지우기를 취소하면 기록이 남는다", () => {
    render(<RecordBoard />);
    act(() => trackVisit("grid"));
    vi.spyOn(window, "confirm").mockReturnValue(false);
    fireEvent.click(screen.getByRole("button", { name: "방문 기록 지우기" }));
    expect(localStorage.getItem(ACTIVITY_KEY)).not.toBeNull();
    act(() => clearActivity());
  });

  it("손상된 저장값이어도 빈 기록으로 보여준다", () => {
    localStorage.setItem(ACTIVITY_KEY, "{not json");
    render(<RecordBoard />);
    expect(screen.getByText(/아직 기록이 없습니다/)).toBeTruthy();
  });
});

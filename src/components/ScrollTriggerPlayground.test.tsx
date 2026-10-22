import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ScrollTrigger는 불러올 때 matchMedia를 부르는데 jsdom에는 없어서, import보다 먼저 대역을 둔다
vi.hoisted(() => {
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  })) as unknown as typeof window.matchMedia;
});

import ScrollTriggerPlayground from "./ScrollTriggerPlayground";

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
});

const codeText = () => document.querySelector("pre")!.textContent;
const slider = (name: string) => screen.getByRole("slider", { name: new RegExp(name) });

describe("ScrollTriggerPlayground", () => {
  it("처음에는 기본값의 코드를 보여준다", () => {
    render(<ScrollTriggerPlayground />);
    expect(codeText()).toContain('start: "top 80%"');
    expect(codeText()).toContain('end: "top 40%"');
    expect(codeText()).toContain("scrub: 1");
  });

  it("스크롤 미리보기는 키보드로 닿을 수 있는 이름 붙은 영역이다", () => {
    render(<ScrollTriggerPlayground />);
    const region = screen.getByRole("region", { name: "스크롤 미리보기" });
    expect(region.getAttribute("tabindex")).toBe("0");
  });

  it("start를 끝 지점 아래로 내리면 end가 따라 내려간다", () => {
    render(<ScrollTriggerPlayground />);
    fireEvent.change(slider("start"), { target: { value: "30" } });
    expect(codeText()).toContain('start: "top 30%"');
    expect(codeText()).toContain('end: "top 25%"');
  });

  it("한 번 재생으로 바꾸면 toggleActions가 나오고 end와 scrub 슬라이더가 꺼진다", () => {
    render(<ScrollTriggerPlayground />);
    fireEvent.click(screen.getByRole("button", { name: "한 번 재생" }));
    expect(codeText()).toContain('toggleActions: "play none none reverse"');
    expect(codeText()).not.toContain("scrub");
    expect((slider("^end") as HTMLInputElement).disabled).toBe(true);
    expect((slider("scrub 부드러움") as HTMLInputElement).disabled).toBe(true);
  });

  it("커지며 나타남은 움직이는 거리를 쓰지 않아 슬라이더가 꺼진다", () => {
    render(<ScrollTriggerPlayground />);
    expect((slider("움직이는 거리") as HTMLInputElement).disabled).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "커지며 나타남" }));
    expect((slider("움직이는 거리") as HTMLInputElement).disabled).toBe(true);
    expect(codeText()).toContain("{ scale: 0.5, opacity: 0 }");
  });

  it("scrub 부드러움을 0으로 하면 scrub: true다", () => {
    render(<ScrollTriggerPlayground />);
    fireEvent.change(slider("scrub 부드러움"), { target: { value: "0" } });
    expect(codeText()).toContain("scrub: true");
  });

  it("start·end 기준선을 화면에 보여준다", () => {
    render(<ScrollTriggerPlayground />);
    expect(screen.getByText("start · top 80%")).toBeTruthy();
    expect(screen.getByText("end · top 40%")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "한 번 재생" }));
    expect(screen.queryByText(/^end · /)).toBeNull();
  });
});

import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { EXPERIMENTS, categoryLabel } from "@/lib/experiments";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

import ToolPicker from "./ToolPicker";

// jsdom은 <dialog>의 showModal/close를 아직 구현하지 않을 수 있어 open 속성만 바꾸는 대역을 둔다
beforeAll(() => {
  window.matchMedia ??= (() => ({ matches: true })) as unknown as typeof window.matchMedia;
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  };
});

afterEach(cleanup);

const openPicker = () => {
  render(<ToolPicker />);
  fireEvent.click(screen.getByRole("button", { name: /^도구/ }));
};
const search = () => screen.getByRole("combobox", { name: "도구 검색" }) as HTMLInputElement;
const options = () => screen.queryAllByRole("option");

describe("ToolPicker", () => {
  it("열면 EXPERIMENTS의 모든 도구를 링크로 보여준다", () => {
    openPicker();
    expect(options()).toHaveLength(EXPERIMENTS.length);
    for (const e of EXPERIMENTS) {
      const link = screen.getByRole("option", { name: new RegExp(e.title) });
      expect(link.getAttribute("href")).toBe(e.href);
    }
  });

  it("검색어로 이름, 설명, 기술을 걸러낸다", () => {
    openPicker();
    fireEvent.change(search(), { target: { value: "gsap" } });
    const names = options().map((o) => o.textContent);
    expect(names.length).toBeGreaterThan(0);
    expect(names.length).toBeLessThan(EXPERIMENTS.length);
    expect(screen.getByRole("option", { name: /Easing Visualizer/ })).toBeTruthy();
  });

  it("맞는 도구가 없으면 안내 문구를 보여준다", () => {
    openPicker();
    fireEvent.change(search(), { target: { value: "zzzz없는도구" } });
    expect(options()).toHaveLength(0);
    expect(screen.getByText("맞는 도구가 없습니다.")).toBeTruthy();
    expect(search().hasAttribute("aria-activedescendant")).toBe(false);
  });

  it("분류 버튼으로 해당 분류의 도구만 남긴다", () => {
    openPicker();
    fireEvent.click(screen.getByRole("button", { name: "모션" }));
    const expected = EXPERIMENTS.filter((e) => e.category === "motion");
    expect(options()).toHaveLength(expected.length);
    expect(screen.getByRole("button", { name: "모션" }).getAttribute("aria-pressed")).toBe("true");
    for (const o of options()) expect(o.textContent).toContain(categoryLabel("motion"));
  });

  it("방향키로 항목을 옮기고 끝에서는 반대편으로 돌아간다", () => {
    openPicker();
    const selected = () => options().findIndex((o) => o.getAttribute("aria-selected") === "true");
    expect(selected()).toBe(0);
    fireEvent.keyDown(search(), { key: "ArrowDown" });
    expect(selected()).toBe(1);
    expect(search().getAttribute("aria-activedescendant")).toBe("tool-option-1");
    fireEvent.keyDown(search(), { key: "ArrowUp" });
    fireEvent.keyDown(search(), { key: "ArrowUp" });
    expect(selected()).toBe(EXPERIMENTS.length - 1);
  });

  it("Enter는 선택한 항목의 링크를 누른다", () => {
    openPicker();
    const clicked: string[] = [];
    options().forEach((o) =>
      o.addEventListener("click", (e) => {
        e.preventDefault();
        clicked.push(o.id);
      }),
    );
    fireEvent.keyDown(search(), { key: "ArrowDown" });
    fireEvent.keyDown(search(), { key: "Enter" });
    expect(clicked).toEqual(["tool-option-1"]);
  });

  it("Ctrl+K로 열고 다시 누르면 닫는다", () => {
    render(<ToolPicker />);
    const dialog = document.querySelector("dialog")!;
    expect(dialog.hasAttribute("open")).toBe(false);
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(dialog.hasAttribute("open")).toBe(true);
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(dialog.hasAttribute("open")).toBe(false);
  });

  it("다시 열면 검색어와 분류가 처음으로 돌아간다", () => {
    openPicker();
    fireEvent.change(search(), { target: { value: "gsap" } });
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));
    fireEvent.click(screen.getByRole("button", { name: /^도구/ }));
    expect(search().value).toBe("");
    expect(options()).toHaveLength(EXPERIMENTS.length);
  });
});

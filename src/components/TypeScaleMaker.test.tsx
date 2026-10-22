import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_SCALE, typeScaleToCss } from "@/lib/typeScale";
import TypeScaleMaker from "./TypeScaleMaker";

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
});

const codeText = () => document.querySelector("pre")!.textContent;
const slider = (name: string) => screen.getByRole("slider", { name: new RegExp(name) });
const rows = () => screen.getByRole("list", { name: "글자 크기 단계 미리보기" }).querySelectorAll("li");

describe("TypeScaleMaker", () => {
  it("처음에는 기본 스케일의 CSS 변수를 보여준다", () => {
    render(<TypeScaleMaker />);
    expect(codeText()).toBe(typeScaleToCss(DEFAULT_SCALE));
    expect(codeText()).toContain("--step-0: 1rem;");
    expect(codeText()).toContain("--step--2: 0.64rem;");
  });

  it("미리보기는 단계 수만큼 행이 있고 큰 단계가 위에 온다", () => {
    render(<TypeScaleMaker />);
    const list = rows();
    expect(list).toHaveLength(DEFAULT_SCALE.up + DEFAULT_SCALE.down + 1);
    expect(list[0].textContent).toContain("--step-5");
    expect(list[list.length - 1].textContent).toContain("--step--2");
  });

  it("비율 칩을 누르면 그 비율이 적용되고 눌린 상태가 된다", () => {
    render(<TypeScaleMaker />);
    fireEvent.click(screen.getByRole("button", { name: "1.5 · Perfect Fifth" }));
    expect(screen.getByRole("button", { name: "1.5 · Perfect Fifth" }).getAttribute("aria-pressed")).toBe("true");
    expect(codeText()).toContain("--step-1: 1.5rem;");
  });

  it("단위를 px로 바꾸면 px 값이 나온다", () => {
    render(<TypeScaleMaker />);
    fireEvent.click(screen.getByRole("button", { name: "px" }));
    expect(codeText()).toContain("--step-0: 16px;");
    expect(codeText()).toContain("--step-1: 20px;");
  });

  it("큰 단계 수와 작은 단계 수를 바꾸면 행과 코드가 따라 바뀐다", () => {
    render(<TypeScaleMaker />);
    fireEvent.change(slider("큰 단계 수"), { target: { value: "1" } });
    fireEvent.change(slider("작은 단계 수"), { target: { value: "0" } });
    expect(rows()).toHaveLength(2);
    expect(codeText().split("\n").filter((l) => l.includes("--step"))).toHaveLength(2);
  });

  it("미리보기 글자는 96px까지만 키우고, 그럴 때 안내가 나온다", () => {
    render(<TypeScaleMaker />);
    expect(screen.queryByText(/96px까지만/)).toBeNull();
    fireEvent.change(slider("기준 크기"), { target: { value: "24" } });
    fireEvent.change(slider("비율"), { target: { value: "1.618" } });
    expect(screen.getByText(/96px까지만/)).toBeTruthy();
    const top = rows()[0].querySelector<HTMLElement>(":scope > span:last-child")!;
    expect(top.style.fontSize).toBe("96px");
  });
});

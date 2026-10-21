import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import ColorConverter from "./ColorConverter";

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
});

const input = () => screen.getByLabelText("색") as HTMLInputElement;
const codeText = () => document.querySelector("pre")!.textContent;

describe("ColorConverter", () => {
  it("처음에는 기본 색을 네 표기로 보여준다", () => {
    render(<ColorConverter />);
    expect(codeText()).toContain("color: #4F46E5;");
    expect(codeText()).toContain("color: rgb(79, 70, 229);");
  });

  it("다른 표기로 입력하면 결과가 바뀐다", () => {
    render(<ColorConverter />);
    fireEvent.change(input(), { target: { value: "hsl(0, 100%, 50%)" } });
    expect(codeText()).toContain("color: #FF0000;");
  });

  it("읽을 수 없는 입력은 오류를 알리고 이전 결과를 유지한다", () => {
    render(<ColorConverter />);
    fireEvent.change(input(), { target: { value: "red" } });
    expect(input().getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText(/형식으로 입력하세요/)).toBeTruthy();
    expect(codeText()).toContain("#4F46E5");
  });

  it("예시 칩을 누르면 그 색으로 바뀐다", () => {
    render(<ColorConverter />);
    fireEvent.click(screen.getByRole("button", { name: "hsl(24, 90%, 45%)" }));
    expect(input().value).toBe("hsl(24, 90%, 45%)");
  });

  it("sRGB 밖의 색이면 잘라 냈다고 알린다", () => {
    render(<ColorConverter />);
    fireEvent.change(input(), { target: { value: "oklch(70% 0.4 30)" } });
    expect(screen.getByText(/가장 가까운 값으로 잘라 낸/)).toBeTruthy();
  });
});

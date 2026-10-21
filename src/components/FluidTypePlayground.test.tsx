import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import FluidTypePlayground from "./FluidTypePlayground";

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
});

const codeText = () => document.querySelector("pre")!.textContent;
const slider = (name: string) => screen.getByRole("slider", { name: new RegExp(name) });

describe("FluidTypePlayground", () => {
  it("처음에는 기본값의 clamp를 보여준다", () => {
    render(<FluidTypePlayground />);
    expect(codeText()).toBe("font-size: clamp(1rem, 0.8182rem + 0.9091vw, 1.5rem);");
  });

  it("최소 크기를 최대 크기보다 키우면 최대 크기가 따라 올라간다", () => {
    render(<FluidTypePlayground />);
    fireEvent.change(slider("최소 글자 크기"), { target: { value: "30" } });
    expect(codeText()).toBe("font-size: 1.875rem;");
  });

  it("최소 너비를 최대 너비 위로 올리면 최대 너비가 따라 올라간다", () => {
    render(<FluidTypePlayground />);
    fireEvent.change(slider("최소 화면 너비"), { target: { value: "1200" } });
    fireEvent.change(slider("최대 화면 너비"), { target: { value: "400" } });
    expect(codeText()).toMatch(/^font-size: clamp\(/);
    expect(codeText()).not.toMatch(/Infinity|NaN/);
  });

  it("너비별 크기 표에 네 행이 있다", () => {
    render(<FluidTypePlayground />);
    expect(screen.getAllByRole("row")).toHaveLength(5);
  });
});

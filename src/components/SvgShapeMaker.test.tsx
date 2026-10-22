import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SHAPE, shapeToSvg } from "@/lib/svgShape";
import SvgShapeMaker from "./SvgShapeMaker";

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

const codeText = () => document.querySelector("pre")!.textContent;
const slider = (name: string) => screen.getByRole("slider", { name: new RegExp(name) });
const previewPath = () => screen.getByRole("img").querySelector("path")!;

describe("SvgShapeMaker", () => {
  it("처음에는 기본 웨이브의 SVG 코드를 보여준다", () => {
    render(<SvgShapeMaker />);
    expect(codeText()).toBe(shapeToSvg(DEFAULT_SHAPE));
  });

  it("미리보기 경로와 코드의 경로가 같다", () => {
    render(<SvgShapeMaker />);
    fireEvent.change(slider("물결 개수"), { target: { value: "4" } });
    const d = previewPath().getAttribute("d")!;
    expect(codeText()).toContain(`d="${d}"`);
  });

  it("물결 개수와 높이를 바꾸면 경로가 바뀐다", () => {
    render(<SvgShapeMaker />);
    const before = previewPath().getAttribute("d");
    fireEvent.change(slider("물결 높이"), { target: { value: "10" } });
    expect(previewPath().getAttribute("d")).not.toBe(before);
  });

  it("위쪽 채우기를 켜면 위 가장자리로 닫힌다", () => {
    render(<SvgShapeMaker />);
    fireEvent.click(screen.getByRole("button", { name: "위쪽 채우기" }));
    expect(previewPath().getAttribute("d")).toMatch(/L1200,0L0,0Z$/);
  });

  it("블롭으로 바꾸면 블롭 조절판과 200×200 상자가 나온다", () => {
    render(<SvgShapeMaker />);
    fireEvent.click(screen.getByRole("button", { name: "블롭" }));
    expect(screen.queryByRole("slider", { name: /물결 개수/ })).toBeNull();
    expect(slider("꼭짓점 개수")).toBeTruthy();
    expect(codeText()).toContain('viewBox="0 0 200 200"');
    expect(screen.getByRole("img").getAttribute("aria-label")).toBe("블롭 미리보기");
  });

  it("다시 뽑기는 시드를 바꾸고 모양도 바뀐다", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    render(<SvgShapeMaker />);
    fireEvent.click(screen.getByRole("button", { name: "블롭" }));
    const before = previewPath().getAttribute("d");
    fireEvent.click(screen.getByRole("button", { name: "다시 뽑기" }));
    expect((slider("시드") as HTMLInputElement).value).toBe("500");
    expect(previewPath().getAttribute("d")).not.toBe(before);
  });

  it("같은 시드를 다시 고르면 같은 모양으로 돌아온다", () => {
    render(<SvgShapeMaker />);
    fireEvent.click(screen.getByRole("button", { name: "블롭" }));
    const first = previewPath().getAttribute("d");
    fireEvent.change(slider("시드"), { target: { value: "300" } });
    fireEvent.change(slider("시드"), { target: { value: "7" } });
    expect(previewPath().getAttribute("d")).toBe(first);
  });
});

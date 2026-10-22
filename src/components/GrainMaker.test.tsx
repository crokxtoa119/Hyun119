import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_GRAIN, grainDataUri, grainToCss } from "@/lib/grain";
import GrainMaker from "./GrainMaker";

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
});

const codeText = () => document.querySelector("pre")!.textContent;
const slider = (name: string) => screen.getByRole("slider", { name: new RegExp(name) });
const layer = () => document.querySelector<HTMLElement>("[role=img] > div[aria-hidden]");

describe("GrainMaker", () => {
  it("처음에는 기본 질감의 CSS를 보여준다", () => {
    render(<GrainMaker />);
    expect(codeText()).toBe(grainToCss(DEFAULT_GRAIN));
  });

  it("미리보기 층은 코드와 같은 데이터 주소, 불투명도, 섞기 방식을 쓴다", () => {
    render(<GrainMaker />);
    const el = layer()!;
    expect(el.style.backgroundImage).toContain(grainDataUri(DEFAULT_GRAIN).slice(0, 60));
    expect(el.style.opacity).toBe("0.3");
    expect(el.style.mixBlendMode).toBe("overlay");
  });

  it("진하기를 바꾸면 미리보기와 코드가 함께 바뀐다", () => {
    render(<GrainMaker />);
    fireEvent.change(slider("진하기"), { target: { value: "55" } });
    expect(layer()!.style.opacity).toBe("0.55");
    expect(codeText()).toContain("opacity: 0.55;");
  });

  it("알갱이 고움과 겹 수와 시드가 코드의 feTurbulence 값으로 들어간다", () => {
    render(<GrainMaker />);
    fireEvent.change(slider("알갱이 고움"), { target: { value: "120" } });
    fireEvent.change(slider("겹 수"), { target: { value: "5" } });
    fireEvent.change(slider("시드"), { target: { value: "42" } });
    const css = decodeURIComponent(codeText());
    expect(css).toContain("baseFrequency='1.2'");
    expect(css).toContain("numOctaves='5'");
    expect(css).toContain("seed='42'");
  });

  it("섞기 방식을 normal로 하면 코드와 미리보기에서 mix-blend-mode가 빠진다", () => {
    render(<GrainMaker />);
    fireEvent.click(screen.getByRole("button", { name: "normal" }));
    expect(codeText()).not.toContain("mix-blend-mode");
    expect(layer()!.style.mixBlendMode).toBe("");
  });

  it("흑백 알갱이를 끄면 feColorMatrix가 빠진다", () => {
    render(<GrainMaker />);
    expect(decodeURIComponent(codeText())).toContain("feColorMatrix");
    fireEvent.click(screen.getByRole("button", { name: "흑백 알갱이" }));
    expect(decodeURIComponent(codeText())).not.toContain("feColorMatrix");
  });

  it("질감 없이 보기를 켜면 질감 층이 사라지고 코드는 그대로다", () => {
    render(<GrainMaker />);
    const before = codeText();
    fireEvent.click(screen.getByRole("button", { name: "질감 없이 보기" }));
    expect(layer()).toBeNull();
    expect(screen.getByRole("img").getAttribute("aria-label")).toBe("질감 없는 원본 미리보기");
    expect(codeText()).toBe(before);
  });

  it("배경을 바꿔도 코드는 바뀌지 않는다", () => {
    render(<GrainMaker />);
    const before = codeText();
    fireEvent.click(screen.getByRole("button", { name: "밝은 단색" }));
    expect(codeText()).toBe(before);
  });
});

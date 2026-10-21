import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import ClipPathMaker from "./ClipPathMaker";

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
});

const codeText = () => document.querySelector("pre")!.textContent;
const handle = (n: number) => screen.getByRole("button", { name: new RegExp(`^꼭짓점 ${n},`) });

describe("ClipPathMaker", () => {
  it("처음에는 육각형 CSS를 보여준다", () => {
    render(<ClipPathMaker />);
    expect(codeText()).toBe(
      "clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);",
    );
  });

  it("방향키로 꼭짓점을 1씩, Shift와 함께 10씩 옮긴다", () => {
    render(<ClipPathMaker />);
    fireEvent.keyDown(handle(1), { key: "ArrowRight" });
    expect(codeText()).toContain("polygon(26% 0%,");
    fireEvent.keyDown(handle(1), { key: "ArrowDown", shiftKey: true });
    expect(codeText()).toContain("polygon(26% 10%,");
  });

  it("범위를 넘지 않는다", () => {
    render(<ClipPathMaker />);
    fireEvent.keyDown(handle(1), { key: "ArrowUp", shiftKey: true });
    expect(codeText()).toContain("polygon(25% 0%,");
  });

  it("점을 추가하고 삭제하며, 한도에서 버튼이 꺼진다", () => {
    render(<ClipPathMaker />);
    const add = screen.getByRole("button", { name: "점 추가" }) as HTMLButtonElement;
    const del = screen.getByRole("button", { name: "점 삭제" }) as HTMLButtonElement;
    for (let i = 0; i < 6; i++) fireEvent.click(add);
    expect(document.querySelectorAll("button[aria-label^='꼭짓점']")).toHaveLength(12);
    expect(add.disabled).toBe(true);
    for (let i = 0; i < 9; i++) fireEvent.click(del);
    expect(document.querySelectorAll("button[aria-label^='꼭짓점']")).toHaveLength(3);
    expect(del.disabled).toBe(true);
  });

  it("모양 칩을 누르면 그 모양으로 바뀐다", () => {
    render(<ClipPathMaker />);
    fireEvent.click(screen.getByRole("button", { name: "삼각형" }));
    expect(codeText()).toBe("clip-path: polygon(50% 0%, 100% 100%, 0% 100%);");
  });
});

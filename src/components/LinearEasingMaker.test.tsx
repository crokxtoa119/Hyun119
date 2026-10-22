import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_EASING, linearEasingToCss, linearValue } from "@/lib/linearEasing";
import LinearEasingMaker from "./LinearEasingMaker";

beforeEach(() => {
  localStorage.clear();
  // jsdom에는 matchMedia가 없어서 "움직임 줄이기"가 꺼진 기기를 흉내 낸다
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
});
afterEach(() => {
  cleanup();
  localStorage.clear();
});

const codeText = () => document.querySelector("pre")!.textContent;
const slider = (name: string) => screen.getByRole("slider", { name: new RegExp(name) });
const box = () => document.querySelector<HTMLElement>("[class*='bg-accent']")!;

describe("LinearEasingMaker", () => {
  it("처음에는 기본 바운스의 CSS를 보여준다", () => {
    render(<LinearEasingMaker />);
    expect(codeText()).toBe(linearEasingToCss(DEFAULT_EASING));
    expect(codeText()).toMatch(/^\.box \{\n {2}transition: transform 0\.8s linear\(0, /);
  });

  it("점 개수를 바꾸면 linear() 안의 값 개수가 같아진다", () => {
    render(<LinearEasingMaker />);
    fireEvent.change(slider("점 개수"), { target: { value: "12" } });
    const inner = /linear\((.*)\)/.exec(codeText())![1];
    expect(inner.split(", ")).toHaveLength(12);
  });

  it("미리보기 상자는 코드와 같은 linear() 값과 재생 시간을 쓴다", () => {
    render(<LinearEasingMaker />);
    fireEvent.change(slider("재생 시간"), { target: { value: "1.5" } });
    expect(box().style.transitionDuration).toBe("1.5s");
    expect(box().style.transitionTimingFunction).toBe(
      linearValue({ ...DEFAULT_EASING, duration: 1.5 }),
    );
  });

  it("재생을 누르면 상자가 끝으로 이동하고 되돌리기로 바뀐다", () => {
    render(<LinearEasingMaker />);
    expect(box().style.transform).toBe("none");
    fireEvent.click(screen.getByRole("button", { name: "재생" }));
    expect(box().style.transform).toContain("translateX");
    expect(screen.getByRole("button", { name: "되돌리기" })).toBeTruthy();
  });

  it("스프링으로 바꾸면 슬라이더 이름이 바뀌고 코드도 바뀐다", () => {
    render(<LinearEasingMaker />);
    const before = codeText();
    fireEvent.click(screen.getByRole("button", { name: "스프링" }));
    expect(slider("흔들리는 횟수")).toBeTruthy();
    expect(codeText()).not.toBe(before);
  });

  it("그래프는 뽑은 점 개수만큼 점을 그린다", () => {
    render(<LinearEasingMaker />);
    expect(document.querySelectorAll("svg[role=img] circle")).toHaveLength(DEFAULT_EASING.points);
    fireEvent.change(slider("점 개수"), { target: { value: "10" } });
    expect(document.querySelectorAll("svg[role=img] circle")).toHaveLength(10);
  });

  it("초기화하면 기본값으로 돌아온다", () => {
    render(<LinearEasingMaker />);
    fireEvent.change(slider("감쇠"), { target: { value: "90" } });
    fireEvent.click(screen.getByRole("button", { name: "초기화" }));
    expect(codeText()).toBe(linearEasingToCss(DEFAULT_EASING));
  });
});

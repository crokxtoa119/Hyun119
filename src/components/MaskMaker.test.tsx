import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_MASK, maskToCss, maskValue } from "@/lib/mask";
import MaskMaker from "./MaskMaker";

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
});

const codeText = () => document.querySelector("pre")!.textContent;
const slider = (name: string) => screen.getByRole("slider", { name: new RegExp(name) });
const preview = () => screen.getByRole("img") as HTMLElement;

describe("MaskMaker", () => {
  it("처음에는 기본 마스크의 CSS를 보여준다", () => {
    render(<MaskMaker />);
    expect(codeText()).toBe(maskToCss(DEFAULT_MASK));
  });

  it("미리보기와 코드가 같은 마스크 값을 쓴다", () => {
    render(<MaskMaker />);
    fireEvent.change(slider("그대로 보이는 지점"), { target: { value: "20" } });
    const expected = maskValue({ ...DEFAULT_MASK, solid: 20 });
    expect(codeText()).toContain(`mask-image: ${expected};`);
    // 브라우저(jsdom)는 #000을 rgb(0, 0, 0)으로 바꿔 돌려주므로 같은 표기로 맞춰 비교한다
    const applied = preview().style.maskImage || preview().style.getPropertyValue("-webkit-mask-image");
    expect(applied).toBe(expected.replace("#000", "rgb(0, 0, 0)"));
  });

  it("보이는 지점을 사라지는 지점 근처까지 올리면 사라지는 지점이 따라 올라간다", () => {
    render(<MaskMaker />);
    fireEvent.change(slider("그대로 보이는 지점"), { target: { value: "95" } });
    expect(codeText()).toContain("#000 95%, transparent 100%");
    fireEvent.change(slider("완전히 사라지는 지점"), { target: { value: "50" } });
    expect(codeText()).toContain("#000 95%, transparent 100%");
  });

  it("원형으로 바꾸면 방향 슬라이더가 꺼지고 radial-gradient가 나온다", () => {
    render(<MaskMaker />);
    expect((slider("방향") as HTMLInputElement).disabled).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "원형" }));
    expect((slider("방향") as HTMLInputElement).disabled).toBe(true);
    expect(codeText()).toContain("radial-gradient(circle, #000 60%, transparent 100%)");
  });

  it("바꾸기를 누르면 투명에서 불투명으로 바뀐다", () => {
    render(<MaskMaker />);
    fireEvent.click(screen.getByRole("button", { name: "보이는 곳과 사라지는 곳 바꾸기" }));
    expect(codeText()).toContain("transparent 60%, #000 100%");
  });

  it("마스크 없이 보기를 켜면 미리보기에서 마스크가 빠지고 코드는 그대로다", () => {
    render(<MaskMaker />);
    const before = codeText();
    fireEvent.click(screen.getByRole("button", { name: "마스크 없이 보기" }));
    expect(preview().getAttribute("aria-label")).toBe("마스크 없는 원본 미리보기");
    expect(preview().style.maskImage).toBe("");
    expect(codeText()).toBe(before);
  });

  it("초기화하면 기본값으로 돌아온다", () => {
    render(<MaskMaker />);
    fireEvent.change(slider("방향"), { target: { value: "45" } });
    fireEvent.click(screen.getByRole("button", { name: "초기화" }));
    expect(codeText()).toBe(maskToCss(DEFAULT_MASK));
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { EMPTY_KIT, kitToCss } from "@/lib/styleKit";

vi.mock("next/navigation", () => ({
  usePathname: () => "/style-kit",
  useRouter: () => ({ push: vi.fn() }),
}));

import StyleKitMaker from "./StyleKitMaker";

const glass = { glassBlur: 10, glassAlpha: 0.2, borderAlpha: 0.2, saturate: 150, tint: "#FFFFFF" };
const SEED: Record<string, unknown> = {
  "sc-palette-presets": [{ id: "1", name: "바다", data: { h: 200, s: 75, l: 50, harmony: "triadic" } }],
  "sc-gradient-presets": [
    { id: "1", name: "노을", data: { kind: "linear", angle: 120, stops: [{ color: "#F97316", pos: 0 }, { color: "#EC4899", pos: 100 }] } },
  ],
  "sc-type-scale-presets": [{ id: "1", name: "큼직", data: { base: 18, ratio: 1.333, up: 5, down: 2, unit: "px" } }],
  "sc-typography-presets": [
    { id: "1", name: "세리프", data: { fontKey: "playfair", text: "Aa", size: 56, weight: 700, tracking: -0.02, leading: 1.2, align: "left" } },
  ],
  "sc-radius-presets": [
    { id: "1", name: "둥글게", data: { tlH: 20, trH: 20, brH: 20, blH: 20, tlV: 20, trV: 20, brV: 20, blV: 20, linked: true } },
  ],
  "sc-shadow-presets": [
    { id: "1", name: "부드럽게", data: { mode: "shadow", x: 0, y: 12, blur: 32, spread: -4, shadowColor: "#000000", shadowAlpha: 0.25, inset: false, ...glass } },
    { id: "2", name: "유리", data: { mode: "glass", x: 0, y: 0, blur: 0, spread: 0, shadowColor: "#000000", shadowAlpha: 0, inset: false, ...glass } },
  ],
};

const seed = () => {
  for (const [k, v] of Object.entries(SEED)) localStorage.setItem(k, JSON.stringify(v));
};

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
});

const codeText = () => document.querySelector("pre")!.textContent!;
const picker = (label: RegExp) => screen.getByRole("combobox", { name: label }) as HTMLSelectElement;
const choose = (label: RegExp, optionName: string) => {
  const select = picker(label);
  const option = within(select).getByRole("option", { name: optionName }) as HTMLOptionElement;
  fireEvent.change(select, { target: { value: option.value } });
};
const preview = () => screen.getByRole("img", { name: /^샘플 화면/ }) as HTMLElement;
const roleRow = (name: RegExp) => screen.getByRole("group", { name });
const pressedRole = (name: RegExp) =>
  within(roleRow(name)).getAllByRole("button").findIndex((b) => b.getAttribute("aria-pressed") === "true");

describe("StyleKitMaker: 처음", () => {
  it("아무것도 고르지 않으면 기본 키트의 CSS를 보여준다", () => {
    render(<StyleKitMaker />);
    expect(codeText()).toBe(kitToCss(EMPTY_KIT));
  });

  it("프리셋이 없으면 각 도구로 가는 링크 안내를 보여준다", () => {
    render(<StyleKitMaker />);
    expect(screen.getAllByText(/저장한 프리셋이 없습니다/).length).toBeGreaterThanOrEqual(6);
    expect(screen.getByRole("link", { name: "Color Palette에서 만들기" }).getAttribute("href")).toBe("/palette");
    expect(screen.getByRole("link", { name: "Type Scale에서 만들기" }).getAttribute("href")).toBe("/type-scale");
  });

  it("도구마다 저장한 프리셋이 선택지로 나오고, 글래스 그림자 프리셋은 빠진다", () => {
    seed();
    render(<StyleKitMaker />);
    expect(within(picker(/색: Color Palette/)).getAllByRole("option").map((o) => o.textContent)).toEqual(["기본값", "바다"]);
    expect(within(picker(/그림자/)).getAllByRole("option").map((o) => o.textContent)).toEqual(["기본값", "부드럽게"]);
  });

  it("샘플 화면에 키트의 CSS 변수가 걸려 있다", () => {
    render(<StyleKitMaker />);
    expect(preview().style.getPropertyValue("--color-primary")).toBe("var(--color-3)");
    expect(preview().style.getPropertyValue("--radius")).toBe("12px");
  });
});

describe("StyleKitMaker: 프리셋 고르기", () => {
  it("팔레트를 고르면 색과 역할이 그 배색 규칙의 기본으로 바뀐다", () => {
    seed();
    render(<StyleKitMaker />);
    choose(/색: Color Palette/, "바다");
    expect(codeText()).toContain("--color-1: #209FDF;");
    // 삼각 배색은 기준색이 첫째라 주색이 색 1이다
    expect(codeText()).toContain("--color-primary: var(--color-1);");
    expect(pressedRole(/주색/)).toBe(0);
    expect(pressedRole(/보조색/)).toBe(2);
    expect(pressedRole(/강조색/)).toBe(3);
  });

  it("그라디언트, 타입 스케일, 글꼴, 모서리, 그림자를 고르면 코드에 반영된다", () => {
    seed();
    render(<StyleKitMaker />);
    choose(/그라디언트/, "노을");
    choose(/글자 크기/, "큼직");
    choose(/글꼴/, "세리프");
    choose(/모서리/, "둥글게");
    choose(/그림자/, "부드럽게");
    const css = codeText();
    expect(css).toContain("--gradient: linear-gradient(120deg, #F97316 0%, #EC4899 100%);");
    expect(css).toContain("--step-0: 18px;");
    expect(css).toContain('--font-family: "Playfair Display", serif;');
    expect(css).toContain("--heading-weight: 700;");
    expect(css).toContain("--radius: 20%;");
    expect(css).toContain("--shadow: 0px 12px 32px -4px rgba(0, 0, 0, 0.25);");
  });

  it("샘플 화면의 글꼴은 미리보기용 폰트 변수를 쓰고 내려받는 코드는 폰트 이름을 쓴다", () => {
    seed();
    render(<StyleKitMaker />);
    choose(/글꼴/, "세리프");
    expect(preview().style.getPropertyValue("--font-family")).toBe("var(--font-playfair), serif");
    expect(codeText()).toContain('"Playfair Display", serif');
  });

  it("기본값을 고르면 그 항목만 기본값으로 돌아온다", () => {
    seed();
    render(<StyleKitMaker />);
    choose(/모서리/, "둥글게");
    choose(/그림자/, "부드럽게");
    fireEvent.change(picker(/모서리/), { target: { value: "" } });
    expect(codeText()).toContain("--radius: 12px;");
    expect(codeText()).toContain("rgba(0, 0, 0, 0.25)");
  });

  it("선택 상자는 지금 키트에 담긴 프리셋을 가리키고, 프리셋이 바뀌면 불러온 값으로 표시한다", () => {
    seed();
    render(<StyleKitMaker />);
    choose(/색: Color Palette/, "바다");
    expect(picker(/색: Color Palette/).selectedOptions[0].textContent).toBe("바다");
    // 도구에서 그 프리셋을 고쳐 저장하면 키트의 복사본과 달라진다
    act(() => {
      localStorage.setItem(
        "sc-palette-presets",
        JSON.stringify([{ id: "1", name: "바다", data: { h: 10, s: 75, l: 50, harmony: "triadic" } }]),
      );
      window.dispatchEvent(new StorageEvent("storage", { key: "sc-palette-presets" }));
    });
    expect(picker(/색: Color Palette/).selectedOptions[0].textContent).toBe("불러온 값");
    // 키트의 복사본은 그대로라 코드도 그대로다
    expect(codeText()).toContain("--color-1: #209FDF;");
  });
});

describe("StyleKitMaker: 색의 역할", () => {
  it("스와치를 누르면 그 역할이 가리키는 색이 바뀐다", () => {
    render(<StyleKitMaker />);
    const buttons = within(roleRow(/주색/)).getAllByRole("button");
    expect(buttons).toHaveLength(5);
    fireEvent.click(buttons[4]);
    expect(codeText()).toContain("--color-primary: var(--color-5);");
    expect(pressedRole(/주색/)).toBe(4);
    expect(preview().style.getPropertyValue("--color-primary")).toBe("var(--color-5)");
  });

  it("스와치의 이름에 역할과 색이 들어 있다", () => {
    render(<StyleKitMaker />);
    expect(screen.getByRole("button", { name: "강조색 (accent)을 색 5 #A73CDD로" })).toBeTruthy();
  });

  it("글자색은 역할 색에 맞춰 자동으로 바뀐다", () => {
    render(<StyleKitMaker />);
    // 기본 팔레트의 보조색(#3CC2DD)은 밝아서 검은 글자, 주색(#3C71DD)은 흰 글자다
    expect(codeText()).toContain("--color-on-primary: #FFFFFF;");
    expect(codeText()).toContain("--color-on-secondary: #000000;");
    fireEvent.click(within(roleRow(/보조색/)).getAllByRole("button")[3]);
    expect(codeText()).toContain("--color-on-secondary: #FFFFFF;");
  });
});

describe("StyleKitMaker: 화면 조작", () => {
  it("어두운 배경으로 보기는 샘플 화면의 바탕을 바꾸되 코드는 그대로다", () => {
    render(<StyleKitMaker />);
    const before = codeText();
    const light = preview().style.background;
    fireEvent.click(screen.getByRole("button", { name: "어두운 배경으로 보기" }));
    expect(preview().style.background).not.toBe(light);
    expect(codeText()).toBe(before);
  });

  it("초기화하면 고른 프리셋이 모두 기본값으로 돌아온다", () => {
    seed();
    render(<StyleKitMaker />);
    choose(/색: Color Palette/, "바다");
    choose(/모서리/, "둥글게");
    fireEvent.click(screen.getByRole("button", { name: "초기화" }));
    expect(codeText()).toBe(kitToCss(EMPTY_KIT));
  });
});

describe("StyleKitMaker: 키트 저장", () => {
  it("키트를 이름 붙여 저장하고 다른 구성으로 바꾼 뒤 불러온다", () => {
    seed();
    render(<StyleKitMaker />);
    choose(/색: Color Palette/, "바다");
    choose(/모서리/, "둥글게");
    const saved = codeText();
    fireEvent.change(screen.getByLabelText("프리셋 이름"), { target: { value: "내 키트" } });
    fireEvent.submit(screen.getByLabelText("프리셋 이름").closest("form")!);

    const stored = JSON.parse(localStorage.getItem("sc-style-kit-presets")!);
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe("내 키트");
    // 키트에는 프리셋 id가 아니라 값의 복사본이 담긴다
    expect(stored[0].data.palette).toEqual({ h: 200, s: 75, l: 50, harmony: "triadic" });

    fireEvent.click(screen.getByRole("button", { name: "초기화" }));
    expect(codeText()).not.toBe(saved);
    fireEvent.click(screen.getByRole("button", { name: "내 키트" }));
    expect(codeText()).toBe(saved);
  });
});

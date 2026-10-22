import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { EXPERIMENTS, getNeighbors } from "@/lib/experiments";
import { OPEN_SETTINGS_EVENT, OPEN_SHORTCUTS_EVENT, SHORTCUTS, setShortcutsEnabled } from "@/lib/shortcuts";

const nav = vi.hoisted(() => ({ pathname: "/gradient", push: vi.fn() }));

vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useRouter: () => ({ push: nav.push }),
}));

import Shortcuts from "./Shortcuts";

// jsdom은 <dialog>의 showModal/close와 matchMedia를 구현하지 않을 수 있어 대역을 둔다
beforeAll(() => {
  window.matchMedia = ((query: string) => ({ matches: true, media: query })) as unknown as typeof window.matchMedia;
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  };
});

beforeEach(() => {
  nav.pathname = "/gradient";
  nav.push.mockClear();
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  document.body.innerHTML = "";
});

const press = (key: string, init: KeyboardEventInit = {}, target: Element | Window = window) =>
  fireEvent.keyDown(target, { key, ...init });
const help = () => document.querySelector<HTMLDialogElement>("dialog[aria-labelledby=shortcuts-title]")!;

describe("Shortcuts: 이전·다음 도구", () => {
  it("]는 다음 도구로, [는 이전 도구로 이동한다", () => {
    render(<Shortcuts />);
    const { prev, next } = getNeighbors("gradient");
    press("]");
    expect(nav.push).toHaveBeenLastCalledWith(next!.href);
    press("[");
    expect(nav.push).toHaveBeenLastCalledWith(prev!.href);
  });

  it("첫 도구에서 [, 마지막 도구에서 ]는 아무 일도 하지 않는다", () => {
    nav.pathname = EXPERIMENTS[0].href;
    render(<Shortcuts />);
    press("[");
    nav.pathname = EXPERIMENTS[EXPERIMENTS.length - 1].href;
    cleanup();
    render(<Shortcuts />);
    press("]");
    expect(nav.push).not.toHaveBeenCalled();
  });

  it("도구 페이지가 아니면 이동하지 않는다", () => {
    nav.pathname = "/";
    render(<Shortcuts />);
    press("]");
    press("[");
    expect(nav.push).not.toHaveBeenCalled();
  });
});

describe("Shortcuts: 무시해야 하는 경우", () => {
  it("입력 요소에 포커스가 있으면 무시한다", () => {
    render(
      <>
        <input aria-label="이름" />
        <Shortcuts />
      </>,
    );
    press("]", {}, screen.getByLabelText("이름"));
    expect(nav.push).not.toHaveBeenCalled();
  });

  it("Ctrl이나 ⌘과 함께 누르면 무시한다", () => {
    render(<Shortcuts />);
    press("]", { ctrlKey: true });
    press("[", { metaKey: true });
    expect(nav.push).not.toHaveBeenCalled();
  });

  it("다른 모달이 열려 있으면 무시한다", () => {
    render(<Shortcuts />);
    const other = document.createElement("dialog");
    other.setAttribute("open", "");
    document.body.append(other);
    press("]");
    press("?");
    expect(nav.push).not.toHaveBeenCalled();
    expect(help().hasAttribute("open")).toBe(false);
  });

  it("설정에서 끄면 한 글자 단축키가 동작하지 않는다", () => {
    setShortcutsEnabled(false);
    render(<Shortcuts />);
    press("]");
    press("?");
    expect(nav.push).not.toHaveBeenCalled();
    expect(help().hasAttribute("open")).toBe(false);
  });

  it("꾹 누르고 있는 반복 입력은 무시한다", () => {
    render(<Shortcuts />);
    press("]", { repeat: true });
    expect(nav.push).not.toHaveBeenCalled();
  });
});

describe("Shortcuts: 도움말과 설정", () => {
  it("?를 누르면 단축키 도움말이 열리고 모든 단축키가 나온다", () => {
    render(<Shortcuts />);
    press("?", { shiftKey: true });
    expect(help().hasAttribute("open")).toBe(true);
    for (const s of SHORTCUTS) expect(screen.getByText(s.label)).toBeTruthy();
  });

  it("닫기 버튼으로 도움말을 닫는다", () => {
    render(<Shortcuts />);
    press("?", { shiftKey: true });
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(help().hasAttribute("open")).toBe(false);
  });

  it("외부에서 보내는 이벤트로도 도움말이 열린다", () => {
    render(<Shortcuts />);
    act(() => {
      window.dispatchEvent(new Event(OPEN_SHORTCUTS_EVENT));
    });
    expect(help().hasAttribute("open")).toBe(true);
  });

  it(",는 설정을 열라는 이벤트를 보낸다", () => {
    render(<Shortcuts />);
    const heard = vi.fn();
    window.addEventListener(OPEN_SETTINGS_EVENT, heard);
    press(",");
    window.removeEventListener(OPEN_SETTINGS_EVENT, heard);
    expect(heard).toHaveBeenCalledTimes(1);
  });
});

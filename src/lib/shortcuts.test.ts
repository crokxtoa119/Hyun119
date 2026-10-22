import { afterEach, describe, expect, it } from "vitest";
import {
  SHORTCUTS,
  actionForKey,
  isTypingTarget,
  readShortcutsEnabled,
  setShortcutsEnabled,
  shortcutFor,
} from "./shortcuts";

const ev = (key: string, patch: Record<string, unknown> = {}) => ({
  key,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  shiftKey: false,
  repeat: false,
  isComposing: false,
  defaultPrevented: false,
  target: document.body,
  ...patch,
});

afterEach(() => localStorage.clear());

describe("SHORTCUTS", () => {
  it("동작 이름이 겹치지 않고 한 글자 키도 겹치지 않는다", () => {
    const actions = SHORTCUTS.map((s) => s.action);
    expect(new Set(actions).size).toBe(actions.length);
    const keys = SHORTCUTS.filter((s) => s.single).map((s) => s.keys[0]);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("한 글자 단축키는 키가 정확히 하나이고, 조합 단축키는 여러 개다", () => {
    for (const s of SHORTCUTS) {
      if (s.single) expect(s.keys).toHaveLength(1);
      else expect(s.keys.length).toBeGreaterThan(1);
    }
  });
});

describe("actionForKey", () => {
  it("한 글자 키를 동작으로 바꾼다", () => {
    expect(actionForKey("?")).toBe("help");
    expect(actionForKey("[")).toBe("prev");
    expect(actionForKey("]")).toBe("next");
    expect(actionForKey(",")).toBe("settings");
  });

  it("목록에 없는 키와 조합 단축키의 글자는 null이다", () => {
    expect(actionForKey("x")).toBeNull();
    expect(actionForKey("k")).toBeNull();
    expect(actionForKey("Ctrl")).toBeNull();
  });
});

describe("isTypingTarget", () => {
  it("입력 요소와 편집 가능한 요소는 입력 중으로 본다", () => {
    for (const tag of ["input", "textarea", "select"]) {
      expect(isTypingTarget(document.createElement(tag))).toBe(true);
    }
    const range = document.createElement("input");
    range.type = "range";
    expect(isTypingTarget(range)).toBe(true);
    const div = document.createElement("div");
    Object.defineProperty(div, "isContentEditable", { value: true });
    expect(isTypingTarget(div)).toBe(true);
  });

  it("버튼, 링크, 본문은 입력 중이 아니다", () => {
    expect(isTypingTarget(document.createElement("button"))).toBe(false);
    expect(isTypingTarget(document.createElement("a"))).toBe(false);
    expect(isTypingTarget(document.body)).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
  });
});

describe("shortcutFor", () => {
  it("평범한 상태에서는 키에 맞는 동작을 돌려준다", () => {
    expect(shortcutFor(ev("]"), false)).toBe("next");
    expect(shortcutFor(ev(","), false)).toBe("settings");
  });

  it("?는 Shift와 함께 눌러도 되지만 다른 키는 Shift와 함께면 무시한다", () => {
    expect(shortcutFor(ev("?", { shiftKey: true }), false)).toBe("help");
    expect(shortcutFor(ev("[", { shiftKey: true }), false)).toBeNull();
  });

  it("Ctrl, ⌘, Alt와 함께 누르면 브라우저 단축키이므로 무시한다", () => {
    expect(shortcutFor(ev("[", { ctrlKey: true }), false)).toBeNull();
    expect(shortcutFor(ev("]", { metaKey: true }), false)).toBeNull();
    expect(shortcutFor(ev(",", { altKey: true }), false)).toBeNull();
  });

  it("꾹 누르기, 한글 조합 중, 이미 처리된 키는 무시한다", () => {
    expect(shortcutFor(ev("]", { repeat: true }), false)).toBeNull();
    expect(shortcutFor(ev("]", { isComposing: true }), false)).toBeNull();
    expect(shortcutFor(ev("]", { defaultPrevented: true }), false)).toBeNull();
  });

  it("입력 중이거나 모달이 열려 있으면 무시한다", () => {
    expect(shortcutFor(ev("]", { target: document.createElement("input") }), false)).toBeNull();
    expect(shortcutFor(ev("]"), true)).toBeNull();
  });
});

describe("단축키 설정", () => {
  it("저장된 값이 없으면 켜짐이고, 끄면 저장된다", () => {
    expect(readShortcutsEnabled()).toBe(true);
    setShortcutsEnabled(false);
    expect(localStorage.getItem("sc-shortcuts")).toBe("off");
    expect(readShortcutsEnabled()).toBe(false);
    setShortcutsEnabled(true);
    expect(localStorage.getItem("sc-shortcuts")).toBeNull();
  });
});

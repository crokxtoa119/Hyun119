"use client";

import { useSyncExternalStore } from "react";

const SHORTCUTS_KEY = "sc-shortcuts";
const listeners = new Set<() => void>();

/** 헤더 버튼과 단축키가 같은 모달을 열도록 주고받는 이벤트 이름. */
export const OPEN_SETTINGS_EVENT = "sc:open-settings";
export const OPEN_SHORTCUTS_EVENT = "sc:open-shortcuts";

export type ShortcutAction = "picker" | "help" | "prev" | "next" | "settings";

export type Shortcut = {
  action: ShortcutAction;
  /** 도움말에 보여 줄 키. */
  keys: string[];
  label: string;
  /** 수정 키 없이 한 글자만 누르는 단축키인지. 이런 키만 설정에서 끌 수 있다. */
  single: boolean;
};

/** 단축키 목록의 원본. 도움말 모달과 키 처리가 모두 이 목록을 읽는다. */
export const SHORTCUTS: Shortcut[] = [
  { action: "picker", keys: ["Ctrl", "K"], label: "도구 고르기 (Mac은 ⌘K)", single: false },
  { action: "help", keys: ["?"], label: "단축키 도움말", single: true },
  { action: "prev", keys: ["["], label: "이전 도구", single: true },
  { action: "next", keys: ["]"], label: "다음 도구", single: true },
  { action: "settings", keys: [","], label: "설정 열기", single: true },
];

/** 한 글자 단축키에 해당하는 동작. 없으면 null. */
export function actionForKey(key: string): ShortcutAction | null {
  return SHORTCUTS.find((s) => s.single && s.keys[0] === key)?.action ?? null;
}

/** 글자를 입력하는 요소인지. 이런 곳에서는 한 글자 단축키를 가로채지 않는다. */
export function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return true;
  // 슬라이더, 체크박스, 색 선택 등은 글자를 치지 않아도 방향키를 쓰므로 함께 제외한다
  return el instanceof HTMLInputElement;
}

type KeyLike = Pick<
  KeyboardEvent,
  "key" | "ctrlKey" | "metaKey" | "altKey" | "shiftKey" | "repeat" | "isComposing" | "defaultPrevented" | "target"
>;

/**
 * 키 입력이 한 글자 단축키로 처리되어야 하면 그 동작을, 아니면 null을 돌려준다.
 * 수정 키와 함께 눌렀거나, 꾹 누르고 있거나, 한글 조합 중이거나, 입력 중이거나,
 * 모달이 열려 있으면 처리하지 않는다.
 */
export function shortcutFor(e: KeyLike, modalOpen: boolean): ShortcutAction | null {
  if (e.defaultPrevented || e.repeat || e.isComposing) return null;
  if (e.ctrlKey || e.metaKey || e.altKey) return null;
  if (isTypingTarget(e.target) || modalOpen) return null;
  const action = actionForKey(e.key);
  // 기본 키보드에서 ?는 Shift와 함께 눌러야 하므로 그것만 Shift를 허용한다
  if (e.shiftKey && e.key !== "?") return null;
  return action;
}

/** 한 글자 단축키가 켜져 있는지. 저장된 값이 없으면 켜짐(기본값)이다. */
export function readShortcutsEnabled(): boolean {
  try {
    return localStorage.getItem(SHORTCUTS_KEY) !== "off";
  } catch {
    return true;
  }
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

export function setShortcutsEnabled(on: boolean) {
  try {
    if (on) localStorage.removeItem(SHORTCUTS_KEY);
    else localStorage.setItem(SHORTCUTS_KEY, "off");
  } catch {
    // 저장이 막힌 환경에서는 설정이 유지되지 않는다
    return;
  }
  listeners.forEach((l) => l());
}

export function useShortcutsEnabled(): boolean {
  return useSyncExternalStore(subscribe, readShortcutsEnabled, () => true);
}

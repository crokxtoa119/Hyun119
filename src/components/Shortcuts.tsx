"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { usePageNavigate } from "@/components/PageTransition";
import { EXPERIMENTS, getNeighbors } from "@/lib/experiments";
import { haptic } from "@/lib/haptics";
import {
  OPEN_SETTINGS_EVENT,
  OPEN_SHORTCUTS_EVENT,
  SHORTCUTS,
  readShortcutsEnabled,
  shortcutFor,
} from "@/lib/shortcuts";

/**
 * 한 글자 단축키를 처리하고 단축키 도움말 모달을 보여 준다. 레이아웃에 한 번만 둔다.
 * Ctrl+K는 ToolPicker가 직접 처리하고, 여기서는 설정에서 끌 수 있는 한 글자 키만 다룬다.
 */
export default function Shortcuts() {
  const pathname = usePathname();
  const navigate = usePageNavigate();
  const dialog = useRef<HTMLDialogElement>(null);

  const showHelp = () => {
    const el = dialog.current;
    if (!el || el.open) return;
    el.showModal();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(
        el,
        { opacity: 0, scale: 0.96, y: 12 },
        { opacity: 1, scale: 1, y: 0, duration: 0.25, ease: "power3.out", clearProps: "all" },
      );
    }
  };

  // 지금 보고 있는 도구 기준의 이전·다음. 도구 페이지가 아니면 둘 다 없다
  const current = EXPERIMENTS.find((e) => e.href === pathname);
  const { prev, next } = current ? getNeighbors(current.slug) : { prev: null, next: null };

  // 키 처리기가 최신 값을 보게 ref에 담아 두고, 리스너는 한 번만 등록한다
  const latest = useRef({ prev, next, navigate });
  useEffect(() => {
    latest.current = { prev, next, navigate };
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!readShortcutsEnabled()) return;
      const action = shortcutFor(e, !!document.querySelector("dialog[open]"));
      if (!action) return;
      const { prev, next, navigate } = latest.current;
      switch (action) {
        case "help":
          e.preventDefault();
          showHelp();
          break;
        case "settings":
          e.preventDefault();
          window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
          break;
        case "prev":
        case "next": {
          const target = action === "prev" ? prev : next;
          if (!target) return;
          e.preventDefault();
          haptic();
          navigate(target.href);
          break;
        }
      }
    };
    const onOpenHelp = () => showHelp();
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_SHORTCUTS_EVENT, onOpenHelp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_SHORTCUTS_EVENT, onOpenHelp);
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="shortcuts-title"
      // 배경(::backdrop)을 눌러 닫는다. 대화상자 안쪽 클릭은 target이 dialog 자신이 아니다.
      onClick={(e) => {
        if (e.target === e.currentTarget) dialog.current?.close();
      }}
      className="m-auto w-[min(92vw,28rem)] rounded-2xl border border-foreground/15 bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id="shortcuts-title" className="text-xl font-semibold tracking-tight">
            단축키
          </h2>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="min-h-10 rounded-full border border-foreground/20 px-4 py-1 text-xs transition-colors hover:border-foreground/50"
          >
            닫기
          </button>
        </div>

        <ul className="divide-y divide-foreground/10">
          {SHORTCUTS.map((s) => (
            <li key={s.action} className="flex items-center justify-between gap-4 py-2.5 text-sm">
              <span>{s.label}</span>
              <span className="flex shrink-0 gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="min-w-7 rounded-md border border-foreground/20 bg-foreground/5 px-2 py-0.5 text-center font-mono text-xs"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>

        <p className="text-xs text-foreground/60">
          글자를 입력하는 중이거나 모달이 열려 있을 때는 한 글자 단축키가 동작하지 않습니다. 설정에서 끌 수
          있고, 끄더라도 Ctrl+K는 계속 쓸 수 있습니다.
        </p>
      </div>
    </dialog>
  );
}

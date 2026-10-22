"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { TransitionLink } from "@/components/PageTransition";
import { CATEGORIES, EXPERIMENTS, categoryLabel, type CategoryId } from "@/lib/experiments";

type Filter = "all" | CategoryId;

const matches = (query: string, text: string) => text.toLowerCase().includes(query);

/**
 * 헤더의 "도구" 버튼과 Ctrl+K(Mac은 ⌘K)로 여는 도구 선택 모달.
 * 목록은 EXPERIMENTS에서 읽으므로 새 도구를 추가하면 저절로 나타난다.
 * 네이티브 <dialog>의 showModal()을 써서 포커스 가둠, Esc 닫기, 포커스 복귀를 브라우저가 처리한다.
 */
export default function ToolPicker() {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXPERIMENTS.filter((e) => {
      if (filter !== "all" && e.category !== filter) return false;
      if (!q) return true;
      return [e.title, e.slug, e.summary, categoryLabel(e.category), ...e.tech].some((t) =>
        matches(q, t),
      );
    });
  }, [query, filter]);

  const activeIndex = Math.min(active, Math.max(results.length - 1, 0));

  const open = () => {
    const el = dialog.current;
    if (!el || el.open) return;
    setQuery("");
    setFilter("all");
    setActive(0);
    el.showModal();
    input.current?.focus();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(
        el,
        { opacity: 0, scale: 0.96, y: 12 },
        { opacity: 1, scale: 1, y: 0, duration: 0.25, ease: "power3.out", clearProps: "all" },
      );
    }
  };

  const close = () => dialog.current?.close();

  // Ctrl+K / ⌘K로 열고 닫는다
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dialog.current?.open) dialog.current.close();
        else open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 방향키로 옮긴 항목이 목록 밖으로 나가 있으면 보이게 한다
  useEffect(() => {
    document.getElementById(`tool-option-${activeIndex}`)?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex]);

  const onInputKey = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((activeIndex + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((activeIndex - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      // 클릭과 같은 경로를 타서 커튼 전환이 그대로 적용된다
      document.getElementById(`tool-option-${activeIndex}`)?.click();
    }
  };

  const tabs: { id: Filter; label: string }[] = [{ id: "all", label: "전체" }, ...CATEGORIES];

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K"
        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-foreground/20 px-4 py-1 font-mono text-xs transition-colors hover:border-foreground/50"
      >
        도구
        <kbd className="hidden text-[10px] text-foreground/50 sm:inline">Ctrl K</kbd>
      </button>

      <dialog
        ref={dialog}
        aria-labelledby="tool-picker-title"
        // 배경(::backdrop)을 눌러 닫는다. 대화상자 안쪽 클릭은 target이 dialog 자신이 아니다.
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="m-auto h-[min(88vh,44rem)] w-[min(92vw,44rem)] flex-col overflow-hidden rounded-2xl border border-foreground/15 bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm open:flex"
      >
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id="tool-picker-title" className="text-xl font-semibold tracking-tight">
              도구 고르기
            </h2>
            <button
              type="button"
              onClick={close}
              className="min-h-10 rounded-full border border-foreground/20 px-4 py-1 text-xs transition-colors hover:border-foreground/50"
            >
              닫기
            </button>
          </div>

          <input
            ref={input}
            type="search"
            role="combobox"
            aria-expanded="true"
            aria-controls="tool-list"
            aria-activedescendant={results.length ? `tool-option-${activeIndex}` : undefined}
            aria-label="도구 검색"
            placeholder="이름, 설명, 기술로 검색"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            className="min-h-11 w-full rounded-xl border border-foreground/20 bg-transparent px-4 text-sm outline-none transition-colors placeholder:text-foreground/40 focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />

          <div role="group" aria-label="분류" className="flex flex-wrap gap-2">
            {tabs.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                aria-pressed={filter === id}
                onClick={() => {
                  setFilter(id);
                  setActive(0);
                }}
                className="min-h-9 rounded-full border border-foreground/20 px-4 py-1 font-mono text-xs transition-colors hover:border-foreground/50 aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-on-accent"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto border-t border-foreground/10 px-3 py-3 sm:px-4">
          <ul id="tool-list" role="listbox" aria-label="도구 목록" className="flex flex-col gap-1">
            {results.map((e, i) => (
              <li key={e.slug} role="presentation">
                <TransitionLink
                  id={`tool-option-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  href={e.href}
                  onNavigate={close}
                  onMouseMove={() => setActive(i)}
                  className="flex min-h-14 flex-col justify-center gap-0.5 rounded-xl px-3 py-2 transition-colors aria-selected:bg-foreground/10"
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium">{e.title}</span>
                    <span className="shrink-0 font-mono text-[11px] text-foreground/60">
                      {categoryLabel(e.category)}
                    </span>
                  </span>
                  <span className="text-xs text-foreground/70">{e.summary}</span>
                </TransitionLink>
              </li>
            ))}
          </ul>
          <p
            role="status"
            className={results.length ? "sr-only" : "px-3 py-8 text-center text-sm text-foreground/60"}
          >
            {results.length ? `${results.length}개의 도구` : "맞는 도구가 없습니다."}
          </p>
        </div>
      </dialog>
    </>
  );
}

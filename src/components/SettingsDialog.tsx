"use client";

import { useRef } from "react";
import gsap from "gsap";
import PresetBackup from "@/components/PresetBackup";
import { setAccent, useAccent } from "@/lib/accent";
import { ACCENTS } from "@/lib/accentPalette";
import { PRESET_TOOLS } from "@/lib/presetRegistry";
import { clearPresets, usePresetCount } from "@/lib/usePresets";
import { setTheme, THEMES, useTheme } from "@/lib/theme";
import { setTransitionsEnabled, useTransitionsEnabled } from "@/lib/settings";

function PresetRow({ storageKey, label }: { storageKey: string; label: string }) {
  const count = usePresetCount(storageKey);

  const clear = () => {
    if (window.confirm(`${label} 프리셋 ${count}개를 모두 삭제할까요? 되돌릴 수 없습니다.`)) {
      clearPresets(storageKey);
    }
  };

  return (
    <li className="flex items-center justify-between gap-3 py-2 text-sm">
      <span>
        {label} <span className="font-mono text-xs text-foreground/60">{count}개</span>
      </span>
      <button
        type="button"
        onClick={clear}
        disabled={count === 0}
        aria-label={`${label} 프리셋 모두 삭제`}
        className="rounded-full border border-foreground/20 px-3 py-1 text-xs transition-colors hover:border-foreground/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-foreground/20"
      >
        삭제
      </button>
    </li>
  );
}

/**
 * 헤더의 설정 버튼과 화면 중앙에 크게 뜨는 설정 모달.
 * 네이티브 <dialog>의 showModal()을 써서 포커스 가둠, Esc 닫기, 닫은 뒤 포커스 복귀를 브라우저가 처리한다.
 */
export default function SettingsDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const theme = useTheme();
  const accent = useAccent();
  const transitions = useTransitionsEnabled();

  const open = () => {
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

  const close = () => dialog.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        className="min-h-10 rounded-full border border-foreground/20 px-4 py-1 font-mono text-xs transition-colors hover:border-foreground/50"
      >
        설정
      </button>

      <dialog
        ref={dialog}
        aria-labelledby="settings-title"
        // 배경(::backdrop)을 눌러 닫는다. 대화상자 안쪽 클릭은 target이 dialog 자신이 아니다.
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="m-auto w-[min(92vw,40rem)] max-h-[88vh] overflow-y-auto rounded-2xl border border-foreground/15 bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        <div className="flex flex-col gap-8 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <h2 id="settings-title" className="text-xl font-semibold tracking-tight">
              설정
            </h2>
            <button
              type="button"
              onClick={close}
              className="rounded-full border border-foreground/20 px-3 py-1 text-xs transition-colors hover:border-foreground/50"
            >
              닫기
            </button>
          </div>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-sm font-medium">테마</legend>
            <div className="flex flex-wrap gap-2">
              {THEMES.map(({ value, label }) => (
                <label
                  key={value}
                  className="cursor-pointer rounded-full border border-foreground/20 px-4 py-1.5 font-mono text-xs transition-colors hover:border-foreground/50 has-[:checked]:border-accent has-[:checked]:bg-accent has-[:checked]:text-on-accent has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent"
                >
                  <input
                    type="radio"
                    name="theme"
                    value={value}
                    checked={theme === value}
                    onChange={(e) => {
                      // 라벨(보이는 버튼)의 중심에서 원이 퍼지게 한다
                      const r = e.currentTarget.parentElement!.getBoundingClientRect();
                      setTheme(value, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
                    }}
                    className="sr-only"
                  />
                  {label}
                </label>
              ))}
            </div>
            <p className="text-xs text-foreground/60">
              Auto는 기기의 라이트/다크 설정을 따릅니다. 선택은 바로 적용되고 이 브라우저에 저장됩니다.
            </p>
          </fieldset>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-sm font-medium">강조 컬러</legend>
            <div className="flex flex-wrap gap-2">
              {ACCENTS.map(({ id, label, light }) => (
                <label
                  key={id}
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-foreground/20 px-3 py-1.5 text-xs transition-colors hover:border-foreground/50 has-[:checked]:border-foreground has-[:checked]:bg-foreground/10 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent"
                >
                  <input
                    type="radio"
                    name="accent"
                    value={id}
                    checked={accent === id}
                    onChange={() => setAccent(id)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className="h-3.5 w-3.5 rounded-full border border-foreground/30"
                    style={{ background: id === "default" ? "var(--foreground)" : light.accent }}
                  />
                  {label}
                </label>
              ))}
            </div>
            <p className="text-xs text-foreground/60">
              선택한 칩, 슬라이더, 미리보기 도형, 홈의 진행 표시, 키보드 포커스 링에 쓰는 색입니다.
              라이트와 다크에서 모두 잘 보이도록 정해 둔 색만 고를 수 있습니다.
            </p>
          </fieldset>

          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 id="transitions-label" className="text-sm font-medium">
                  페이지 전환 효과
                </h3>
                <p className="mt-1 text-xs text-foreground/60">
                  링크를 누를 때 커튼이 화면을 덮는 애니메이션입니다. 기기의 &quot;움직임
                  줄이기&quot; 설정이 켜져 있으면 여기서 켜도 재생되지 않습니다.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={transitions}
                aria-labelledby="transitions-label"
                onClick={() => setTransitionsEnabled(!transitions)}
                className={`relative h-6 w-11 shrink-0 rounded-full border border-foreground/30 transition-colors ${
                  transitions ? "bg-foreground" : "bg-transparent"
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full transition-transform ${
                    transitions ? "translate-x-5 bg-background" : "bg-foreground"
                  }`}
                />
              </button>
            </div>
          </section>

          <section className="flex flex-col gap-1">
            <h3 className="text-sm font-medium">저장된 프리셋</h3>
            <p className="text-xs text-foreground/60">
              이 브라우저에 저장된 프리셋입니다. 삭제하면 되돌릴 수 없습니다.
            </p>
            <ul className="mt-2 divide-y divide-foreground/10">
              {PRESET_TOOLS.map(({ key, label }) => (
                <PresetRow key={key} storageKey={key} label={label} />
              ))}
            </ul>
          </section>

          <PresetBackup />
        </div>
      </dialog>
    </>
  );
}

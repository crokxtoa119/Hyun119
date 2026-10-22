"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion, useReducedMotion } from "@/lib/motion";
import {
  DEFAULT_SCROLL,
  EFFECTS,
  MIN_GAP,
  MODES,
  SCROLL_LIMITS,
  clampScroll,
  effectVars,
  isScrollTriggerState,
  scrollTriggerToJs,
  triggerVars,
  tweenVars,
  type ScrollTriggerState,
} from "@/lib/scrollTrigger";
import { usePresets } from "@/lib/usePresets";
import Chip from "@/components/ui/Chip";
import { SharedNotice } from "@/components/ui/Share";
import { ToolControls, ToolFooter, ToolPage } from "@/components/ui/ToolLayout";
import Slider from "@/components/ui/Slider";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** 미리보기 상자 위에 겹쳐서 start·end 기준선이 화면의 어디인지 보여 주는 선. */
function Guide({ label, percent }: { label: string; percent: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 border-t border-dashed border-accent"
      style={{ top: `${percent}%` }}
    >
      <span className="absolute right-3 -translate-y-full rounded-t bg-accent px-2 py-0.5 font-mono text-[11px] text-on-accent">
        {label}
      </span>
    </div>
  );
}

export default function ScrollTriggerPlayground() {
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ScrollTriggerState>(DEFAULT_SCROLL);
  const reduced = useReducedMotion();

  const update = (patch: Partial<ScrollTriggerState>) =>
    setState((s) => clampScroll({ ...s, ...patch }));

  const { presets, save, remove, isFull } = usePresets("sc-scroll-trigger-presets", isScrollTriggerState);
  const load = (s: ScrollTriggerState) => setState(clampScroll(s));

  // 설정이 바뀔 때마다 스크롤을 맨 위로 되돌리고 ScrollTrigger를 새로 만든다. 코드와 같은 값을 쓴다.
  useGSAP(
    () => {
      const el = box.current;
      const trigger = wrap.current;
      const area = scroller.current;
      if (!el || !trigger || !area) return;
      area.scrollTop = 0;
      const { from, to } = effectVars(state);
      if (prefersReducedMotion()) {
        gsap.set(el, to);
        return;
      }
      gsap.fromTo(el, from, {
        ...tweenVars(state),
        scrollTrigger: { ...triggerVars(state), trigger, scroller: area } as ScrollTrigger.Vars,
      });
    },
    { scope: root, dependencies: [state], revertOnUpdate: true },
  );

  const scrub = state.mode === "scrub";
  const moves = state.effect === "fade-up" || state.effect === "slide-left";

  return (
    <ToolPage
      rootRef={root}
      title="Scroll Trigger"
      description="스크롤 위치에 맞춰 요소가 움직이는 GSAP ScrollTrigger 설정을 만들고 코드를 복사하세요."
    >
      <SharedNotice validate={isScrollTriggerState} onApply={load} />

      <div className="relative mt-8">
        <div
          ref={scroller}
          tabIndex={0}
          role="region"
          aria-label="스크롤 미리보기"
          className="h-80 overflow-y-auto overscroll-contain rounded-2xl border border-foreground/10 bg-foreground/5"
        >
          <p className="px-6 py-3 text-xs text-foreground/60">↓ 이 영역을 스크롤해 보세요</p>
          <div className="h-64" />
          {/* 움직이는 상자가 아니라 움직이지 않는 부모를 trigger로 쓴다 */}
          <div ref={wrap} className="mx-auto size-24">
            <div ref={box} aria-hidden className="size-full rounded-xl bg-accent" />
          </div>
          <div className="h-[30rem]" />
        </div>
        <Guide label={`start · top ${state.start}%`} percent={state.start} />
        {scrub && <Guide label={`end · top ${state.end}%`} percent={state.end} />}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Chip
          active={false}
          onClick={() => {
            if (scroller.current) scroller.current.scrollTop = 0;
          }}
        >
          맨 위로
        </Chip>
        <Chip active={false} onClick={() => setState(DEFAULT_SCROLL)}>
          초기화
        </Chip>
      </div>
      {reduced && (
        <p role="status" className="mt-3 text-xs text-foreground/60">
          기기의 &quot;움직임 줄이기&quot; 설정이 켜져 있어 미리보기를 끝 모양으로 고정했습니다. 코드는 그대로
          복사할 수 있습니다.
        </p>
      )}

      <ToolControls>
        <div className="space-y-5">
          <fieldset>
            <legend className="mb-2 text-sm font-medium">효과</legend>
            <div className="flex flex-wrap gap-2">
              {EFFECTS.map(({ value, label }) => (
                <Chip key={value} active={state.effect === value} onClick={() => update({ effect: value })}>
                  {label}
                </Chip>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">재생 방식</legend>
            <div className="flex flex-wrap gap-2">
              {MODES.map(({ value, label }) => (
                <Chip key={value} active={state.mode === value} onClick={() => update({ mode: value })}>
                  {label}
                </Chip>
              ))}
            </div>
          </fieldset>
          <Slider
            label="움직이는 거리"
            value={state.distance}
            min={SCROLL_LIMITS.distance.min}
            max={SCROLL_LIMITS.distance.max}
            disabled={!moves}
            display={moves ? `${state.distance}px` : "해당 없음"}
            onChange={(n) => update({ distance: n })}
          />
        </div>

        <div className="space-y-5">
          <Slider
            label="start (위쪽이 화면의 몇 %에 닿으면 시작)"
            value={state.start}
            min={SCROLL_LIMITS.start.min}
            max={SCROLL_LIMITS.start.max}
            display={`top ${state.start}%`}
            onChange={(n) => update({ start: n })}
          />
          <Slider
            label={`end (최소 ${MIN_GAP}% 위)`}
            value={state.end}
            min={SCROLL_LIMITS.end.min}
            max={SCROLL_LIMITS.end.max}
            disabled={!scrub}
            display={scrub ? `top ${state.end}%` : "해당 없음"}
            onChange={(n) => update({ end: n })}
          />
          <Slider
            label="scrub 부드러움"
            value={state.smooth}
            min={SCROLL_LIMITS.smooth.min}
            max={SCROLL_LIMITS.smooth.max}
            step={0.5}
            disabled={!scrub}
            display={scrub ? (state.smooth === 0 ? "딱 붙음" : `${state.smooth}s`) : "해당 없음"}
            onChange={(n) => update({ smooth: n })}
          />
        </div>
      </ToolControls>

      <ToolFooter
        presets={presets}
        isFull={isFull}
        state={state}
        onSave={save}
        onLoad={load}
        onRemove={remove}
        code={{
          title: "GSAP 코드",
          code: scrollTriggerToJs(state),
          file: { name: "scroll-trigger", ext: "js" },
        }}
        note="움직이는 .box 대신 움직이지 않는 부모 .box-wrap을 trigger로 씁니다. 움직이는 요소를 trigger로 쓰면 이동한 만큼 시작 위치가 밀립니다. ScrollTrigger는 gsap/ScrollTrigger에서 가져오고, 미리보기에만 쓴 scroller 옵션은 일반 페이지에서 필요 없어서 뺐습니다."
      />
    </ToolPage>
  );
}

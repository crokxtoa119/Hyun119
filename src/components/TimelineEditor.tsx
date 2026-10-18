"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/lib/motion";
import { usePresets } from "@/lib/usePresets";
import {
  BOX_COUNT,
  buildTimelineCode,
  clampTween,
  DEFAULT_TWEENS,
  DURATION_RANGE,
  EASES,
  isTimeline,
  MAX_TWEENS,
  PROP_KEYS,
  PROPS,
  START_RANGE,
  totalDuration,
  type TimelineTween,
  type TweenProp,
} from "@/lib/timeline";
import CodeBlock from "@/components/ui/CodeBlock";
import PresetBar from "@/components/ui/PresetBar";
import { ShareButton, SharedNotice } from "@/components/ui/Share";
import Slider from "@/components/ui/Slider";

gsap.registerPlugin(useGSAP);

const selectClass =
  "rounded-lg border border-foreground/20 bg-background px-2 py-1.5 text-sm hover:border-foreground/50";

export default function TimelineEditor() {
  const root = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [tweens, setTweens] = useState<TimelineTween[]>(DEFAULT_TWEENS);

  const total = totalDuration(tweens);
  // 막대 그래프의 가로축 길이(초). 0.5초 단위로 올림하고 최소 2초.
  const axis = Math.max(2, Math.ceil(total * 2) / 2);

  const { presets, save, remove, isFull } = usePresets("sc-timeline-presets", isTimeline);
  const loadPreset = (list: TimelineTween[]) => setTweens(list.map(clampTween));

  // 자동으로 반복되는 움직임은 멈출 수 있어야 한다. "움직임 줄이기"를 켠 경우 기본은 정지.
  const reducedMotion = useReducedMotion();
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const paused = userPaused ?? reducedMotion;
  const pausedRef = useRef(paused);

  // 트윈이 바뀔 때마다 타임라인을 새로 만든다. 재생 위치는 처음으로 돌아간다.
  useGSAP(
    () => {
      const boxes = root.current?.querySelectorAll<HTMLElement>(".tl-box");
      const playheads = root.current?.querySelectorAll<HTMLElement>(".playhead");
      const scrub = root.current?.querySelector<HTMLInputElement>(".scrub");
      if (!boxes || boxes.length < BOX_COUNT) return;

      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 0.6,
        paused: pausedRef.current,
        // 재생 위치(막대 그래프의 선, 스크러버)는 렌더링을 거치지 않고 직접 갱신한다
        onUpdate: () => {
          const t = Math.min(tl.time(), total);
          playheads?.forEach((p) => (p.style.left = `${(t / axis) * 100}%`));
          if (scrub) scrub.value = String(t);
        },
      });
      tweens.forEach((t) => {
        tl.to(boxes[t.box], { [t.prop]: t.to, duration: t.duration, ease: t.ease }, t.start);
      });
      tlRef.current = tl;
      return () => {
        tlRef.current = null;
      };
    },
    { scope: root, dependencies: [tweens], revertOnUpdate: true },
  );

  useEffect(() => {
    pausedRef.current = paused;
    tlRef.current?.paused(paused);
  }, [paused]);

  const scrubTo = (v: number) => {
    setUserPaused(true);
    const tl = tlRef.current;
    if (!tl) return;
    tl.pause();
    tl.time(v);
  };

  const update = (i: number, patch: Partial<TimelineTween>) =>
    setTweens((list) => list.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));

  const changeProp = (i: number, prop: TweenProp) => update(i, { prop, to: PROPS[prop].initial });

  const addTween = () =>
    setTweens((list) =>
      list.length >= MAX_TWEENS
        ? list
        : [
            ...list,
            { box: list.length % BOX_COUNT, prop: "x", to: 100, start: 0, duration: 0.8, ease: "power2.out" },
          ],
    );

  const removeTween = (i: number) =>
    setTweens((list) => (list.length <= 1 ? list : list.filter((_, idx) => idx !== i)));

  return (
    <div ref={root} className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Timeline Editor</h1>
      <p className="mt-2 text-foreground/70">
        트윈 최대 3개의 시작 시점과 길이를 조절해 GSAP 타임라인을 만들어 봅니다.
      </p>

      <SharedNotice validate={isTimeline} onApply={loadPreset} />

      <div className="mt-8 rounded-2xl border border-foreground/10 p-4">
        <div className="flex flex-col gap-2">
          {Array.from({ length: BOX_COUNT }, (_, i) => (
            <div key={i} className="flex h-14 items-center justify-center rounded-xl bg-foreground/5">
              <div
                className="tl-box flex size-10 items-center justify-center rounded-lg bg-foreground font-mono text-sm text-background"
                aria-label={`상자 ${i + 1}`}
              >
                {i + 1}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setUserPaused(!paused)}
            className="shrink-0 rounded-lg border border-foreground/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/5"
          >
            {paused ? "▶ 재생" : "⏸ 일시정지"}
          </button>
          <input
            type="range"
            className="scrub h-2 w-full cursor-pointer appearance-none rounded-full bg-foreground/15 accent-foreground"
            aria-label="재생 위치"
            min={0}
            max={total}
            step={0.01}
            defaultValue={0}
            onInput={(e) => scrubTo(Number(e.currentTarget.value))}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-foreground/10 p-4">
        <div className="mb-2 flex justify-between font-mono text-xs text-foreground/60">
          <span>0s</span>
          <span>{axis}s</span>
        </div>
        <div className="flex flex-col gap-2" role="img" aria-label={`타임라인: 총 ${total.toFixed(1)}초`}>
          {tweens.map((t, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-24 shrink-0 truncate font-mono text-xs text-foreground/70">
                {t.box + 1} · {t.prop}
              </span>
              <div className="relative h-6 flex-1 rounded bg-foreground/5">
                <div
                  className="absolute top-1 bottom-1 rounded bg-foreground/70"
                  style={{ left: `${(t.start / axis) * 100}%`, width: `${(t.duration / axis) * 100}%` }}
                />
                <div className="playhead absolute top-0 bottom-0 w-px bg-foreground" style={{ left: 0 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {tweens.map((t, i) => {
          const p = PROPS[t.prop];
          return (
            <fieldset key={i} className="rounded-2xl border border-foreground/10 p-4">
              <legend className="px-2 text-sm font-medium">트윈 {i + 1}</legend>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  상자
                  <select
                    className={selectClass}
                    value={t.box}
                    onChange={(e) => update(i, { box: Number(e.target.value) })}
                  >
                    {Array.from({ length: BOX_COUNT }, (_, b) => (
                      <option key={b} value={b}>
                        {b + 1}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  속성
                  <select
                    className={selectClass}
                    value={t.prop}
                    onChange={(e) => changeProp(i, e.target.value as TweenProp)}
                  >
                    {PROP_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {PROPS[k].label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  이징
                  <select
                    className={selectClass}
                    value={t.ease}
                    onChange={(e) => update(i, { ease: e.target.value })}
                  >
                    {EASES.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => removeTween(i)}
                  disabled={tweens.length <= 1}
                  aria-label={`트윈 ${i + 1} 삭제`}
                  className="ml-auto rounded-full border border-foreground/20 px-3 py-1 text-xs transition-colors hover:border-foreground/50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  삭제
                </button>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <Slider
                  label="도착 값"
                  value={t.to}
                  min={p.min}
                  max={p.max}
                  step={p.step}
                  display={`${+t.to.toFixed(2)}${p.unit}`}
                  onChange={(v) => update(i, { to: v })}
                />
                <Slider
                  label="시작"
                  value={t.start}
                  {...START_RANGE}
                  display={`${t.start.toFixed(1)}s`}
                  onChange={(v) => update(i, { start: v })}
                />
                <Slider
                  label="길이"
                  value={t.duration}
                  {...DURATION_RANGE}
                  display={`${t.duration.toFixed(1)}s`}
                  onChange={(v) => update(i, { duration: v })}
                />
              </div>
            </fieldset>
          );
        })}
        <div>
          <button
            type="button"
            onClick={addTween}
            disabled={tweens.length >= MAX_TWEENS}
            className="rounded-lg border border-foreground/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            + 트윈 추가 ({tweens.length}/{MAX_TWEENS})
          </button>
        </div>
      </div>

      <div className="mt-8">
        <PresetBar
          presets={presets}
          isFull={isFull}
          onSave={(name) => save(name, tweens)}
          onLoad={loadPreset}
          onRemove={remove}
        />
        <div className="mt-4">
          <ShareButton current={tweens} />
        </div>
      </div>

      <div className="mt-8">
        <CodeBlock title="GSAP 코드" code={buildTimelineCode(tweens)} />
      </div>
    </div>
  );
}

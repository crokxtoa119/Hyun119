"use client";

import { useState, useSyncExternalStore } from "react";
import {
  CURVES,
  DEFAULT_EASING,
  EASING_LIMITS,
  clampEasing,
  curveAt,
  isLinearEasingState,
  linearEasingToCss,
  linearValue,
  sampleEasing,
  type LinearEasingState,
} from "@/lib/linearEasing";
import { useReducedMotion } from "@/lib/motion";
import { usePresets } from "@/lib/usePresets";
import Chip from "@/components/ui/Chip";
import { SharedNotice } from "@/components/ui/Share";
import { ToolControls, ToolFooter, ToolPage } from "@/components/ui/ToolLayout";
import Slider from "@/components/ui/Slider";

const W = 320;
const H = 180;
const PAD = 18;
const CURVE_STEPS = 160;

/** 이 브라우저가 linear() 이징을 이해하는지. 서버 렌더링 때는 지원하는 것으로 본다. */
function useLinearSupported(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () =>
      typeof CSS !== "undefined" &&
      typeof CSS.supports === "function" &&
      CSS.supports("transition-timing-function", "linear(0, 1)"),
    () => true,
  );
}

/** 곡선과 뽑은 점을 그린 그래프. 가로는 시간, 세로는 값(1이 도착점)이다. */
function Graph({ state }: { state: LinearEasingState }) {
  const samples = sampleEasing(state);
  const curve = Array.from({ length: CURVE_STEPS + 1 }, (_, i) => curveAt(state, i / CURVE_STEPS));
  const lo = Math.min(0, ...curve, ...samples);
  const hi = Math.max(1, ...curve, ...samples);
  const x = (t: number) => PAD + t * (W - PAD * 2);
  const y = (v: number) => H - PAD - ((v - lo) / (hi - lo)) * (H - PAD * 2);
  const path = curve.map((v, i) => `${i === 0 ? "M" : "L"}${x(i / CURVE_STEPS).toFixed(1)},${y(v).toFixed(1)}`).join("");

  return (
    <svg
      role="img"
      aria-label="이징 곡선 그래프. 가로는 시간, 세로는 진행 값입니다."
      viewBox={`0 0 ${W} ${H}`}
      className="block w-full"
    >
      {[0, 1].map((v) => (
        <line
          key={v}
          x1={PAD}
          x2={W - PAD}
          y1={y(v)}
          y2={y(v)}
          stroke="currentColor"
          strokeOpacity={0.25}
          strokeDasharray="4 4"
        />
      ))}
      <path d={path} fill="none" stroke="currentColor" strokeOpacity={0.35} strokeWidth={1.5} />
      <polyline
        points={samples.map((v, i) => `${x(i / (samples.length - 1)).toFixed(1)},${y(v).toFixed(1)}`).join(" ")}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2}
      />
      {samples.map((v, i) => (
        <circle key={i} cx={x(i / (samples.length - 1))} cy={y(v)} r={2.5} fill="var(--accent)" />
      ))}
    </svg>
  );
}

export default function LinearEasingMaker() {
  const [state, setState] = useState<LinearEasingState>(DEFAULT_EASING);
  const [on, setOn] = useState(false);
  const reduced = useReducedMotion();
  const supported = useLinearSupported();

  const update = (patch: Partial<LinearEasingState>) =>
    setState((s) => clampEasing({ ...s, ...patch }));

  const { presets, save, remove, isFull } = usePresets("sc-linear-easing-presets", isLinearEasingState);
  const load = (s: LinearEasingState) => setState(clampEasing(s));

  return (
    <ToolPage
      title="Linear Easing"
      description="바운스와 스프링 같은 움직임을 CSS linear() 이징으로 만들고 코드를 복사하세요."
    >
      <SharedNotice validate={isLinearEasingState} onApply={load} />

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-foreground/10 bg-foreground/5 p-4 text-foreground">
          <Graph state={state} />
          <p className="mt-2 text-xs text-foreground/60">
            회색은 원래 곡선, 색 점과 선은 linear()가 실제로 쓰는 {state.points}개의 점입니다.
          </p>
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-foreground/10 bg-foreground/5 p-4">
          <div aria-hidden className="relative h-12 [container-type:inline-size]">
            <div
              className="absolute top-0 left-0 size-12 rounded-xl bg-accent"
              style={{
                transform: on ? "translateX(calc(100cqw - 3rem))" : "none",
                transitionProperty: "transform",
                transitionDuration: reduced ? "0s" : `${state.duration}s`,
                transitionTimingFunction: linearValue(state),
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Chip active={on} onClick={() => setOn((v) => !v)}>
              {on ? "되돌리기" : "재생"}
            </Chip>
            <Chip active={false} onClick={() => setState(DEFAULT_EASING)}>
              초기화
            </Chip>
          </div>
          {reduced && (
            <p role="status" className="text-xs text-foreground/60">
              기기의 &quot;움직임 줄이기&quot; 설정이 켜져 있어 미리보기가 바로 이동합니다.
            </p>
          )}
          {!supported && (
            <p role="status" className="text-xs text-foreground/60">
              이 브라우저는 linear()를 지원하지 않아 미리보기가 기본 이징으로 움직입니다. 그래프와 코드는 그대로입니다.
            </p>
          )}
        </div>
      </div>

      <ToolControls>
        <div className="space-y-5">
          <fieldset>
            <legend className="mb-2 text-sm font-medium">곡선</legend>
            <div className="flex flex-wrap gap-2">
              {CURVES.map(({ value, label }) => (
                <Chip key={value} active={state.curve === value} onClick={() => update({ curve: value })}>
                  {label}
                </Chip>
              ))}
            </div>
          </fieldset>
          <Slider
            label={state.curve === "bounce" ? "튀는 횟수" : "흔들리는 횟수"}
            value={state.count}
            min={EASING_LIMITS.count.min}
            max={EASING_LIMITS.count.max}
            onChange={(n) => update({ count: n })}
          />
          <Slider
            label="감쇠 (클수록 빨리 잦아듦)"
            value={state.damping}
            min={EASING_LIMITS.damping.min}
            max={EASING_LIMITS.damping.max}
            display={`${state.damping}%`}
            onChange={(n) => update({ damping: n })}
          />
        </div>
        <div className="space-y-5">
          <Slider
            label="점 개수"
            value={state.points}
            min={EASING_LIMITS.points.min}
            max={EASING_LIMITS.points.max}
            onChange={(n) => update({ points: n })}
          />
          <Slider
            label="재생 시간"
            value={state.duration}
            min={EASING_LIMITS.duration.min}
            max={EASING_LIMITS.duration.max}
            step={0.1}
            display={`${state.duration}s`}
            onChange={(n) => update({ duration: n })}
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
          title: "CSS",
          code: linearEasingToCss(state),
          file: { name: "linear-easing", ext: "css" },
        }}
        note="linear()는 점들을 직선으로 이어 곡선을 흉내 냅니다. 점이 많을수록 부드럽지만 코드가 길어집니다. 2023년 이후의 브라우저에서 지원하고, 지원하지 않으면 transition이 기본 이징으로 동작합니다."
      />
    </ToolPage>
  );
}

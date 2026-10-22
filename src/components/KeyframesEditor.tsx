"use client";

import { useState } from "react";
import {
  DEFAULT_KEYFRAMES,
  DIRECTIONS,
  DURATION,
  EASINGS,
  FRAME_LIMITS,
  ITERATIONS,
  MID_AT,
  animationDeclaration,
  clampKeyframes,
  isKeyframesState,
  keyframesRule,
  keyframesToCss,
  type Frame,
  type KeyframesState,
} from "@/lib/keyframes";
import { usePresets } from "@/lib/usePresets";
import Chip from "@/components/ui/Chip";
import { SharedNotice } from "@/components/ui/Share";
import { ToolControls, ToolFooter, ToolPage } from "@/components/ui/ToolLayout";
import Slider from "@/components/ui/Slider";

const FRAME_FIELDS: { key: keyof Frame; label: string; unit: string }[] = [
  { key: "x", label: "가로 이동", unit: "px" },
  { key: "rotate", label: "회전", unit: "°" },
  { key: "scale", label: "크기", unit: "%" },
  { key: "opacity", label: "투명도", unit: "%" },
];

function FrameFields({
  legend,
  frame,
  onChange,
}: {
  legend: string;
  frame: Frame;
  onChange: (key: keyof Frame, value: number) => void;
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="mb-2 text-sm font-semibold">{legend}</legend>
      {FRAME_FIELDS.map(({ key, label, unit }) => (
        <Slider
          key={key}
          label={label}
          value={frame[key]}
          min={FRAME_LIMITS[key].min}
          max={FRAME_LIMITS[key].max}
          display={`${frame[key]}${unit}`}
          onChange={(n) => onChange(key, n)}
        />
      ))}
    </fieldset>
  );
}

function Options<T extends string>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 font-mono text-sm font-medium">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip key={o} active={value === o} onClick={() => onChange(o)}>
            {o}
          </Chip>
        ))}
      </div>
    </fieldset>
  );
}

export default function KeyframesEditor() {
  const [state, setState] = useState<KeyframesState>(DEFAULT_KEYFRAMES);
  // 다시 시작은 key를 바꿔 요소를 새로 만든다. 일시정지는 사용자가 눌렀을 때만 의미가 있다.
  const [run, setRun] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userPlayed, setUserPlayed] = useState(false);

  const setFrame = (which: "from" | "mid" | "to") => (key: keyof Frame, value: number) =>
    setState((s) => ({ ...s, [which]: { ...s[which], [key]: value } }));
  const set = <K extends keyof KeyframesState>(key: K, value: KeyframesState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const { presets, save, remove, isFull } = usePresets("sc-keyframes-presets", isKeyframesState);
  const load = (s: KeyframesState) => {
    setState(clampKeyframes(s));
    setRun((n) => n + 1);
  };

  // 미리보기용 이름과 규칙은 검증된 숫자와 고정 키워드로만 만든다
  const previewCss = `${keyframesRule(state, "sc-kf-preview")}
.sc-kf-box { ${animationDeclaration(state, "sc-kf-preview")} }
@media (prefers-reduced-motion: reduce) { .sc-kf-box:not([data-played]) { animation-play-state: paused; } }`;

  return (
    <ToolPage
      title="Keyframes"
      description="시작, 가운데, 끝 세 키프레임을 정해 CSS 애니메이션을 만들고 코드를 복사하세요."
    >
      <SharedNotice validate={isKeyframesState} onApply={load} />

      <style>{previewCss}</style>
      <div
        aria-hidden
        className="mt-8 flex h-56 items-center justify-center overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/5"
      >
        <div
          key={run}
          className="sc-kf-box size-16 rounded-xl bg-accent"
          data-played={userPlayed ? "" : undefined}
          style={{ animationPlayState: paused ? "paused" : undefined }}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Chip
          active={paused}
          onClick={() => {
            setUserPlayed(true);
            setPaused((p) => !p);
          }}
        >
          {paused ? "재생" : "일시정지"}
        </Chip>
        <Chip
          active={false}
          onClick={() => {
            setUserPlayed(true);
            setPaused(false);
            setRun((n) => n + 1);
          }}
        >
          처음부터
        </Chip>
        <Chip
          active={false}
          onClick={() => {
            setState(DEFAULT_KEYFRAMES);
            setRun((n) => n + 1);
          }}
        >
          초기화
        </Chip>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <FrameFields legend="시작 (0%)" frame={state.from} onChange={setFrame("from")} />
        <div className="space-y-4">
          <FrameFields legend={`가운데 (${state.midAt}%)`} frame={state.mid} onChange={setFrame("mid")} />
          <Slider
            label="가운데 위치"
            value={state.midAt}
            min={MID_AT.min}
            max={MID_AT.max}
            display={`${state.midAt}%`}
            onChange={(n) => set("midAt", n)}
          />
        </div>
        <FrameFields legend="끝 (100%)" frame={state.to} onChange={setFrame("to")} />
      </div>

      <ToolControls>
        <Slider
          label="animation-duration"
          value={state.duration}
          min={DURATION.min}
          max={DURATION.max}
          step={0.1}
          display={`${state.duration}s`}
          onChange={(n) => set("duration", n)}
        />
        <Options legend="timing-function" options={EASINGS} value={state.easing} onChange={(v) => set("easing", v)} />
        <Options legend="iteration-count" options={ITERATIONS} value={state.iterations} onChange={(v) => set("iterations", v)} />
        <Options legend="direction" options={DIRECTIONS} value={state.direction} onChange={(v) => set("direction", v)} />
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
          code: keyframesToCss(state),
          file: { name: "keyframes", ext: "css" },
        }}
      />
    </ToolPage>
  );
}

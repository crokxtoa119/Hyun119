"use client";

import { useState } from "react";
import {
  DEFAULT_TRANSFORM,
  PERSPECTIVE,
  TRANSFORM_SPECS,
  clampTransform,
  isTransformState,
  transformToCss,
  transformValue,
  type TransformState,
} from "@/lib/transform";
import { usePresets } from "@/lib/usePresets";
import Chip from "@/components/ui/Chip";
import CodeBlock from "@/components/ui/CodeBlock";
import PresetBar from "@/components/ui/PresetBar";
import { ShareButton, SharedNotice } from "@/components/ui/Share";
import Slider from "@/components/ui/Slider";

const LOOKS: { label: string; values: Partial<TransformState> }[] = [
  { label: "기울인 카드", values: { rotate: -6, skewX: -8, scale: 1.05 } },
  { label: "3D 카드", values: { rotateX: 25, rotateY: -30, scale: 1.1 } },
  { label: "뒤집기", values: { rotateY: 80 } },
  { label: "작게 밀기", values: { translateX: 60, translateY: 20, scale: 0.7 } },
];

export default function TransformPlayground() {
  const [state, setState] = useState<TransformState>(DEFAULT_TRANSFORM);

  const { presets, save, remove, isFull } = usePresets("sc-transform-presets", isTransformState);
  const load = (s: TransformState) => setState(clampTransform(s));

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Transform</h1>
      <p className="mt-2 text-foreground/70">
        이동, 회전, 크기, 기울임과 3D 원근을 조절하면 점선 틀 안의 카드가 바로 움직입니다.
      </p>

      <SharedNotice validate={isTransformState} onApply={load} />

      <div
        aria-hidden
        className="mt-8 flex h-72 items-center justify-center overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/5"
      >
        <div className="relative">
          {/* 원래 자리를 점선 틀로 보여 줘서 얼마나 움직였는지 비교할 수 있다 */}
          <div className="absolute inset-0 rounded-xl border-2 border-dashed border-foreground/30" />
          <div
            className="relative flex h-32 w-48 items-center justify-center rounded-xl bg-accent font-mono text-sm text-on-accent"
            style={{ transform: transformValue(state) }}
          >
            SketchCraft
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {LOOKS.map((l) => (
          <Chip
            key={l.label}
            active={false}
            onClick={() => setState({ ...DEFAULT_TRANSFORM, ...l.values })}
          >
            {l.label}
          </Chip>
        ))}
        <Chip active={false} onClick={() => setState(DEFAULT_TRANSFORM)}>
          초기화
        </Chip>
      </div>

      <div className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {TRANSFORM_SPECS.map((s) => (
          <Slider
            key={s.key}
            label={`${s.label} (${s.fn})`}
            value={state[s.key]}
            min={s.min}
            max={s.max}
            step={s.step}
            display={`${state[s.key]}${s.unit}`}
            onChange={(n) => setState((t) => ({ ...t, [s.key]: n }))}
          />
        ))}
        <Slider
          label="원근 (perspective)"
          value={state.perspective}
          min={PERSPECTIVE.min}
          max={PERSPECTIVE.max}
          step={PERSPECTIVE.step}
          display={state.perspective === 0 ? "없음" : `${state.perspective}px`}
          onChange={(n) => setState((t) => ({ ...t, perspective: n }))}
        />
      </div>
      <p className="mt-3 text-xs text-foreground/60">
        원근은 X·Y축 회전을 쓸 때만 CSS에 들어갑니다. 값이 작을수록 원근감이 강합니다.
      </p>

      <div className="mt-8">
        <PresetBar
          presets={presets}
          isFull={isFull}
          onSave={(name) => save(name, state)}
          onLoad={load}
          onRemove={remove}
        />
        <div className="mt-4">
          <ShareButton current={state} />
        </div>
      </div>

      <div className="mt-8">
        <CodeBlock title="CSS" code={transformToCss(state)} file={{ name: "transform", ext: "css" }} />
      </div>
    </div>
  );
}

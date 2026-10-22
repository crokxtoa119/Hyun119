"use client";

import { useState } from "react";
import {
  DEFAULT_SCALE,
  RATIOS,
  SCALE_LIMITS,
  clampTypeScale,
  formatSize,
  isTypeScaleState,
  scaleSteps,
  stepName,
  typeScaleToCss,
  type TypeScaleState,
  type TypeScaleUnit,
} from "@/lib/typeScale";
import { usePresets } from "@/lib/usePresets";
import Chip from "@/components/ui/Chip";
import { SharedNotice } from "@/components/ui/Share";
import { ToolControls, ToolFooter, ToolPage } from "@/components/ui/ToolLayout";
import Slider from "@/components/ui/Slider";

const SAMPLE = "Aa 가나다 SketchCraft";
/** 미리보기에서 글자를 이 크기까지만 키운다. 코드의 값은 그대로다. */
const PREVIEW_MAX_PX = 96;
const UNITS: TypeScaleUnit[] = ["rem", "px"];

export default function TypeScaleMaker() {
  const [state, setState] = useState<TypeScaleState>(DEFAULT_SCALE);
  const update = (patch: Partial<TypeScaleState>) => setState((s) => clampTypeScale({ ...s, ...patch }));

  const { presets, save, remove, isFull } = usePresets("sc-type-scale-presets", isTypeScaleState);
  const load = (s: TypeScaleState) => setState(clampTypeScale(s));

  // 큰 단계가 위로 오게 뒤집는다
  const steps = scaleSteps(state).reverse();
  const capped = steps.some((t) => t.px > PREVIEW_MAX_PX);

  return (
    <ToolPage
      title="Type Scale"
      description="기준 크기와 비율로 일관된 글자 크기 단계를 만들고 CSS 변수로 복사하세요."
    >
      <SharedNotice validate={isTypeScaleState} onApply={load} />

      <ul
        aria-label="글자 크기 단계 미리보기"
        className="mt-8 divide-y divide-foreground/10 overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/5"
      >
        {steps.map(({ step, px }) => (
          <li key={step} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-baseline sm:gap-4">
            <span className="shrink-0 font-mono text-xs text-foreground/60 sm:w-28">
              {stepName(step)} <span className="sm:block">{formatSize(px, state.unit)}</span>
            </span>
            <span
              className={`min-w-0 break-words leading-tight ${step === 0 ? "font-semibold" : ""}`}
              style={{ fontSize: `${Math.min(px, PREVIEW_MAX_PX)}px` }}
            >
              {SAMPLE}
            </span>
          </li>
        ))}
      </ul>
      {capped && (
        <p className="mt-2 text-xs text-foreground/60">
          미리보기는 글자를 {PREVIEW_MAX_PX}px까지만 키워 보여 줍니다. 코드에는 계산된 값이 그대로 들어갑니다.
        </p>
      )}

      <ToolControls>
        <div className="space-y-5">
          <Slider
            label="기준 크기 (step 0)"
            value={state.base}
            min={SCALE_LIMITS.base.min}
            max={SCALE_LIMITS.base.max}
            display={`${state.base}px`}
            onChange={(n) => update({ base: n })}
          />
          <Slider
            label="비율"
            value={state.ratio}
            min={SCALE_LIMITS.ratio.min}
            max={SCALE_LIMITS.ratio.max}
            step={0.005}
            display={`× ${state.ratio}`}
            onChange={(n) => update({ ratio: n })}
          />
          <fieldset>
            <legend className="mb-2 text-sm font-medium">대표 비율</legend>
            <div className="flex flex-wrap gap-2">
              {RATIOS.map(({ value, name }) => (
                <Chip key={value} active={state.ratio === value} onClick={() => update({ ratio: value })}>
                  {value} · {name}
                </Chip>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="space-y-5">
          <Slider
            label="큰 단계 수"
            value={state.up}
            min={SCALE_LIMITS.up.min}
            max={SCALE_LIMITS.up.max}
            onChange={(n) => update({ up: n })}
          />
          <Slider
            label="작은 단계 수"
            value={state.down}
            min={SCALE_LIMITS.down.min}
            max={SCALE_LIMITS.down.max}
            onChange={(n) => update({ down: n })}
          />
          <fieldset>
            <legend className="mb-2 text-sm font-medium">단위</legend>
            <div className="flex gap-2">
              {UNITS.map((u) => (
                <Chip key={u} active={state.unit === u} onClick={() => update({ unit: u })}>
                  {u}
                </Chip>
              ))}
            </div>
          </fieldset>
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
          title: "CSS 변수",
          code: typeScaleToCss(state),
          copyLabel: "전체 복사",
          file: { name: "type-scale", ext: "css" },
        }}
        note="rem은 브라우저 기본 글자 크기(16px) 기준이라 사용자가 글자 크기를 키워 두면 함께 커집니다. 화면 너비에 따라 부드럽게 변하게 하려면 각 단계에 Fluid Type의 clamp()를 쓰면 됩니다."
      />
    </ToolPage>
  );
}

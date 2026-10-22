"use client";

import { useState } from "react";
import {
  ALIGNS,
  DEFAULT_FLEX,
  DIRECTIONS,
  GAP_MAX,
  ITEMS_MAX,
  ITEMS_MIN,
  JUSTIFIES,
  WRAPS,
  clampFlex,
  flexToCss,
  isFlexState,
  type FlexState,
} from "@/lib/flex";
import { usePresets } from "@/lib/usePresets";
import Chip from "@/components/ui/Chip";
import { SharedNotice } from "@/components/ui/Share";
import { ToolControls, ToolFooter, ToolPage } from "@/components/ui/ToolLayout";
import Slider from "@/components/ui/Slider";

// 정렬 차이가 보이도록 아이템마다 크기를 다르게 한다
const SIZES = [
  [56, 40],
  [72, 72],
  [48, 96],
  [88, 56],
  [64, 80],
  [56, 48],
  [80, 64],
  [48, 72],
  [72, 40],
  [64, 96],
  [56, 64],
  [88, 48],
];

function Group<T extends string>({
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

export default function FlexPlayground() {
  const [state, setState] = useState<FlexState>(DEFAULT_FLEX);
  const set = <K extends keyof FlexState>(key: K, value: FlexState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const { presets, save, remove, isFull } = usePresets("sc-flexbox-presets", isFlexState);
  const load = (s: FlexState) => setState(clampFlex(s));

  const column = state.direction.startsWith("column");

  return (
    <ToolPage
      title="Flexbox"
      description="속성을 바꾸면 아래 상자 안의 아이템이 바로 움직입니다. 만든 CSS를 복사하세요."
    >
      <SharedNotice validate={isFlexState} onApply={load} />

      <div
        aria-hidden
        className="mt-8 overflow-auto rounded-2xl border border-dashed border-foreground/30 bg-foreground/5 p-4"
        style={{
          display: "flex",
          flexDirection: state.direction,
          flexWrap: state.wrap,
          justifyContent: state.justify,
          alignItems: state.align,
          gap: state.gap,
          height: column ? 360 : 280,
        }}
      >
        {Array.from({ length: state.items }, (_, i) => {
          const [w, h] = SIZES[i % SIZES.length];
          return (
            <div
              key={i}
              className="flex shrink-0 items-center justify-center rounded-lg bg-accent font-mono text-sm text-on-accent"
              style={{
                width: w,
                // stretch일 때는 교차축 크기를 비워야 늘어나는 모습이 보인다
                height: state.align === "stretch" && !column ? undefined : h,
                ...(state.align === "stretch" && column ? { width: undefined } : {}),
                minHeight: 32,
                minWidth: 32,
              }}
            >
              {i + 1}
            </div>
          );
        })}
      </div>

      <ToolControls>
        <Group legend="flex-direction" options={DIRECTIONS} value={state.direction} onChange={(v) => set("direction", v)} />
        <Group legend="flex-wrap" options={WRAPS} value={state.wrap} onChange={(v) => set("wrap", v)} />
        <Group legend="justify-content" options={JUSTIFIES} value={state.justify} onChange={(v) => set("justify", v)} />
        <Group legend="align-items" options={ALIGNS} value={state.align} onChange={(v) => set("align", v)} />
        <Slider
          label="gap"
          value={state.gap}
          max={GAP_MAX}
          display={`${state.gap}px`}
          onChange={(n) => set("gap", n)}
        />
        <Slider
          label="아이템 수"
          value={state.items}
          min={ITEMS_MIN}
          max={ITEMS_MAX}
          onChange={(n) => set("items", n)}
        />
      </ToolControls>

      <div className="mt-6">
        <Chip active={false} onClick={() => setState(DEFAULT_FLEX)}>
          초기화
        </Chip>
      </div>

      <ToolFooter
        presets={presets}
        isFull={isFull}
        state={state}
        onSave={save}
        onLoad={load}
        onRemove={remove}
        code={{
          title: "CSS",
          code: flexToCss(state),
          file: { name: "flexbox", ext: "css" },
        }}
      />
    </ToolPage>
  );
}

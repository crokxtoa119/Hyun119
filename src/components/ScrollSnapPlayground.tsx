"use client";

import { useState } from "react";
import {
  AXES,
  DEFAULT_SCROLL_SNAP,
  LIMITS,
  SNAP_ALIGNS,
  SNAP_TYPES,
  clampScrollSnap,
  containerDeclarations,
  isScrollSnapState,
  itemDeclarations,
  scrollSnapToCss,
  type ScrollSnapState,
} from "@/lib/scrollSnap";
import { usePresets } from "@/lib/usePresets";
import Chip from "@/components/ui/Chip";
import { SharedNotice } from "@/components/ui/Share";
import { ToolControls, ToolFooter, ToolPage } from "@/components/ui/ToolLayout";
import Slider from "@/components/ui/Slider";

const AXIS_LABEL = { x: "가로 (x)", y: "세로 (y)" } as const;

/** CSS 속성 이름("flex-direction")을 React style 키("flexDirection")로 바꾼다. */
const toStyle = (decls: [string, string][]) =>
  Object.fromEntries(
    decls.map(([k, v]) => [k.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()), v]),
  );

function Options<T extends string>({
  legend,
  options,
  value,
  label = (o) => o,
  onChange,
}: {
  legend: string;
  options: readonly T[];
  value: T;
  label?: (o: T) => string;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 font-mono text-sm font-medium">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip key={o} active={value === o} onClick={() => onChange(o)}>
            {label(o)}
          </Chip>
        ))}
      </div>
    </fieldset>
  );
}

export default function ScrollSnapPlayground() {
  const [state, setState] = useState<ScrollSnapState>(DEFAULT_SCROLL_SNAP);
  const set = <K extends keyof ScrollSnapState>(key: K, value: ScrollSnapState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const { presets, save, remove, isFull } = usePresets("sc-scroll-snap-presets", isScrollSnapState);
  const load = (s: ScrollSnapState) => setState(clampScrollSnap(s));

  const itemStyle = toStyle(itemDeclarations(state));

  return (
    <ToolPage
      title="Scroll Snap"
      description="아래 상자를 스크롤하거나 키보드 방향키로 움직여 보세요. 설정에 따라 멈추는 위치가 달라집니다."
    >
      <SharedNotice validate={isScrollSnapState} onApply={load} />

      {/* 키보드로도 스크롤할 수 있도록 포커스를 받는 영역으로 만든다 */}
      <div
        // 설정이 바뀌면 스크롤 위치를 처음으로 되돌리려고 key를 쓴다
        key={`${state.axis}-${state.type}-${state.align}-${state.size}`}
        role="region"
        tabIndex={0}
        aria-label="스크롤 스냅 미리보기"
        className="mt-8 rounded-2xl border border-foreground/10 bg-foreground/5 p-4"
        style={{ ...toStyle(containerDeclarations(state)), ...(state.axis === "x" ? { overflowY: "hidden" } : {}) }}
      >
        {Array.from({ length: state.items }, (_, i) => (
          <div
            key={i}
            className="flex h-44 items-center justify-center rounded-xl bg-accent font-mono text-2xl text-on-accent"
            style={{ ...itemStyle, ...(state.axis === "y" ? { minHeight: 120 } : {}) }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      <ToolControls>
        <Options legend="축" options={AXES} value={state.axis} label={(a) => AXIS_LABEL[a]} onChange={(v) => set("axis", v)} />
        <Options legend="scroll-snap-type" options={SNAP_TYPES} value={state.type} onChange={(v) => set("type", v)} />
        <Options legend="scroll-snap-align" options={SNAP_ALIGNS} value={state.align} onChange={(v) => set("align", v)} />
        <Slider
          label="아이템 수"
          value={state.items}
          min={LIMITS.items.min}
          max={LIMITS.items.max}
          onChange={(n) => set("items", n)}
        />
        <Slider
          label="아이템 크기"
          value={state.size}
          min={LIMITS.size.min}
          max={LIMITS.size.max}
          display={`${state.size}%`}
          onChange={(n) => set("size", n)}
        />
        <Slider
          label="간격 (gap)"
          value={state.gap}
          max={LIMITS.gap.max}
          display={`${state.gap}px`}
          onChange={(n) => set("gap", n)}
        />
        <Slider
          label="scroll-padding"
          value={state.padding}
          max={LIMITS.padding.max}
          display={`${state.padding}px`}
          onChange={(n) => set("padding", n)}
        />
        <div className="flex items-end">
          <Chip active={false} onClick={() => setState(DEFAULT_SCROLL_SNAP)}>
            초기화
          </Chip>
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
          code: scrollSnapToCss(state),
          file: { name: "scroll-snap", ext: "css" },
        }}
      />
    </ToolPage>
  );
}

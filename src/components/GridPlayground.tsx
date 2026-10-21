"use client";

import { useState } from "react";
import {
  DEFAULT_GRID,
  ITEM_ALIGNS,
  LIMITS,
  MODES,
  clampGrid,
  gapValue,
  gridToCss,
  isGridState,
  templateColumns,
  type GridState,
} from "@/lib/grid";
import { usePresets } from "@/lib/usePresets";
import Chip from "@/components/ui/Chip";
import CodeBlock from "@/components/ui/CodeBlock";
import PresetBar from "@/components/ui/PresetBar";
import { ShareButton, SharedNotice } from "@/components/ui/Share";
import Slider from "@/components/ui/Slider";

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

export default function GridPlayground() {
  const [state, setState] = useState<GridState>(DEFAULT_GRID);
  const set = <K extends keyof GridState>(key: K, value: GridState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const { presets, save, remove, isFull } = usePresets("sc-grid-presets", isGridState);
  const load = (s: GridState) => setState(clampGrid(s));

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Grid</h1>
      <p className="mt-2 text-foreground/70">
        열 개수와 간격, 정렬을 바꾸면 아래 격자가 바로 달라집니다. 만든 CSS를 복사하세요.
      </p>

      <SharedNotice validate={isGridState} onApply={load} />

      <div
        aria-hidden
        className="mt-8 rounded-2xl border border-dashed border-foreground/30 bg-foreground/5 p-4"
        style={{
          display: "grid",
          gridTemplateColumns: templateColumns(state),
          gridAutoRows: state.rowHeight,
          gap: gapValue(state),
          justifyItems: state.justify,
          alignItems: state.align,
        }}
      >
        {Array.from({ length: state.items }, (_, i) => (
          <div
            key={i}
            className="flex items-center justify-center rounded-lg bg-accent font-mono text-sm text-on-accent"
            style={{
              gridColumn: state.span && i === 0 ? "span 2" : undefined,
              // stretch가 아닐 때는 칸 안에서 정렬이 보이도록 크기를 줄인다
              width: state.justify === "stretch" ? undefined : "60%",
              height: state.align === "stretch" ? undefined : "60%",
              minWidth: 32,
              minHeight: 32,
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Options legend="열 방식" options={MODES} value={state.mode} onChange={(v) => set("mode", v)} />
        <Slider
          label="열 개수"
          value={state.columns}
          min={LIMITS.columns.min}
          max={LIMITS.columns.max}
          disabled={state.mode === "auto-fit"}
          display={state.mode === "auto-fit" ? "자동" : String(state.columns)}
          onChange={(n) => set("columns", n)}
        />
        <Slider
          label="행 높이"
          value={state.rowHeight}
          min={LIMITS.rowHeight.min}
          max={LIMITS.rowHeight.max}
          display={`${state.rowHeight}px`}
          onChange={(n) => set("rowHeight", n)}
        />
        <Slider
          label="아이템 수"
          value={state.items}
          min={LIMITS.items.min}
          max={LIMITS.items.max}
          onChange={(n) => set("items", n)}
        />
        <Slider
          label="열 간격 (column-gap)"
          value={state.columnGap}
          max={LIMITS.gap.max}
          display={`${state.columnGap}px`}
          onChange={(n) => set("columnGap", n)}
        />
        <Slider
          label="행 간격 (row-gap)"
          value={state.rowGap}
          max={LIMITS.gap.max}
          display={`${state.rowGap}px`}
          onChange={(n) => set("rowGap", n)}
        />
        <Options legend="justify-items" options={ITEM_ALIGNS} value={state.justify} onChange={(v) => set("justify", v)} />
        <Options legend="align-items" options={ITEM_ALIGNS} value={state.align} onChange={(v) => set("align", v)} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Chip active={state.span} onClick={() => set("span", !state.span)}>
          첫 아이템 2칸 차지
        </Chip>
        <Chip active={false} onClick={() => setState(DEFAULT_GRID)}>
          초기화
        </Chip>
      </div>

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
        <CodeBlock title="CSS" code={gridToCss(state)} file={{ name: "grid", ext: "css" }} />
      </div>
    </div>
  );
}

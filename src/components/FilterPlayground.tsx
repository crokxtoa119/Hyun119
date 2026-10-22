"use client";

import { useState } from "react";
import {
  DEFAULT_FILTER,
  FILTER_SPECS,
  clampFilter,
  filterToCss,
  filterValue,
  isFilterState,
  type FilterState,
} from "@/lib/filter";
import { usePresets } from "@/lib/usePresets";
import Chip from "@/components/ui/Chip";
import { SharedNotice } from "@/components/ui/Share";
import { ToolControls, ToolFooter, ToolPage } from "@/components/ui/ToolLayout";
import Slider from "@/components/ui/Slider";

// 자주 쓰는 조합. 누르면 모든 값이 이 조합으로 바뀐다.
const LOOKS: { label: string; values: Partial<FilterState> }[] = [
  { label: "흑백 사진", values: { grayscale: 100, contrast: 110 } },
  { label: "빈티지", values: { sepia: 60, contrast: 90, brightness: 110, saturate: 80 } },
  { label: "선명하게", values: { contrast: 125, saturate: 140 } },
  { label: "몽환적", values: { blur: 2, brightness: 110, saturate: 130 } },
  { label: "네거티브", values: { invert: 100 } },
];

export default function FilterPlayground() {
  const [state, setState] = useState<FilterState>(DEFAULT_FILTER);

  const { presets, save, remove, isFull } = usePresets("sc-filter-presets", isFilterState);
  const load = (s: FilterState) => setState(clampFilter(s));

  return (
    <ToolPage
      title="Filter"
      description="슬라이더로 CSS filter 함수를 조합하면 아래 샘플이 바로 바뀝니다. 만든 CSS를 복사하세요."
    >
      <SharedNotice validate={isFilterState} onApply={load} />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {/* 샘플은 그림 파일 없이 CSS 그라데이션과 도형으로만 만든다 */}
        <figure aria-hidden className="m-0">
          <div className="relative h-56 overflow-hidden rounded-2xl border border-foreground/10 bg-[linear-gradient(135deg,#f97316,#ec4899_45%,#6366f1)]">
            <div className="absolute bottom-6 left-6 size-20 rounded-full bg-[#fde047]" />
            <div className="absolute right-8 top-8 h-24 w-24 rotate-12 rounded-xl bg-[#22c55e]" />
            <div className="absolute inset-x-0 bottom-0 h-10 bg-[#0ea5e9]" />
          </div>
          <figcaption className="mt-2 text-xs text-foreground/60">원본</figcaption>
        </figure>
        <figure aria-hidden className="m-0">
          <div
            className="relative h-56 overflow-hidden rounded-2xl border border-foreground/10 bg-[linear-gradient(135deg,#f97316,#ec4899_45%,#6366f1)]"
            style={{ filter: filterValue(state) }}
          >
            <div className="absolute bottom-6 left-6 size-20 rounded-full bg-[#fde047]" />
            <div className="absolute right-8 top-8 h-24 w-24 rotate-12 rounded-xl bg-[#22c55e]" />
            <div className="absolute inset-x-0 bottom-0 h-10 bg-[#0ea5e9]" />
          </div>
          <figcaption className="mt-2 text-xs text-foreground/60">적용 결과</figcaption>
        </figure>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {LOOKS.map((l) => (
          <Chip
            key={l.label}
            active={false}
            onClick={() => setState({ ...DEFAULT_FILTER, ...l.values })}
          >
            {l.label}
          </Chip>
        ))}
        <Chip active={false} onClick={() => setState(DEFAULT_FILTER)}>
          초기화
        </Chip>
      </div>

      <ToolControls>
        {FILTER_SPECS.map((s) => (
          <Slider
            key={s.key}
            label={`${s.label} (${s.fn})`}
            value={state[s.key]}
            min={s.min}
            max={s.max}
            display={`${state[s.key]}${s.unit}`}
            onChange={(n) => setState((f) => ({ ...f, [s.key]: n }))}
          />
        ))}
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
          code: filterToCss(state),
          file: { name: "filter", ext: "css" },
        }}
      />
    </ToolPage>
  );
}

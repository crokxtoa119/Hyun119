"use client";

import { useState } from "react";
import {
  DEFAULT_FLUID,
  FLUID_LIMITS,
  clampFluid,
  fluidSizeAt,
  fluidToCss,
  fluidValue,
  isFluidState,
  type FluidState,
} from "@/lib/fluidType";
import { usePresets } from "@/lib/usePresets";
import { SharedNotice } from "@/components/ui/Share";
import { ToolControls, ToolFooter, ToolPage } from "@/components/ui/ToolLayout";
import Slider from "@/components/ui/Slider";

const SAMPLE = "빠른 갈색 여우가 게으른 개를 뛰어넘습니다. The quick brown fox.";
const PREVIEW_MIN = 200;
const PREVIEW_MAX = 2000;
const TABLE_WIDTHS = [320, 768, 1024, 1440];

// 크기-너비 그래프 좌표계
const CW = 320;
const CH = 120;

export default function FluidTypePlayground() {
  const [state, setState] = useState<FluidState>(DEFAULT_FLUID);
  const [previewVw, setPreviewVw] = useState(800);

  const { presets, save, remove, isFull } = usePresets("sc-fluid-type-presets", isFluidState);
  const load = (s: FluidState) => setState(clampFluid(s));
  const update = (patch: Partial<FluidState>) => setState((s) => clampFluid({ ...s, ...patch }));

  const L = FLUID_LIMITS;
  const size = fluidSizeAt(state, previewVw);

  // 그래프: 가로는 화면 너비, 세로는 글자 크기
  const yLo = Math.floor(state.minSize * 0.8);
  const yHi = Math.ceil(state.maxSize * 1.1) || yLo + 1;
  const gx = (vw: number) => ((vw - PREVIEW_MIN) / (PREVIEW_MAX - PREVIEW_MIN)) * CW;
  const gy = (px: number) => CH - ((px - yLo) / Math.max(1, yHi - yLo)) * CH;
  const line = [PREVIEW_MIN, state.minVw, state.maxVw, PREVIEW_MAX]
    .map((vw) => `${gx(vw).toFixed(1)},${gy(fluidSizeAt(state, vw)).toFixed(1)}`)
    .join(" ");

  return (
    <ToolPage
      title="Fluid Type"
      description="화면 너비에 따라 글자 크기가 부드럽게 변하는 clamp() 값을 계산합니다. 만든 CSS를 복사하세요."
    >
      <SharedNotice validate={isFluidState} onApply={load} />

      <div className="mt-8 grid gap-4 lg:grid-cols-[3fr_2fr]">
        <div className="rounded-2xl border border-foreground/10 bg-foreground/5 p-6">
          <p className="font-mono text-xs text-foreground/60">
            화면 너비 {previewVw}px → 글자 {size.toFixed(1)}px
          </p>
          {/* 실제 뷰포트가 아니라 고른 너비를 대입해 계산한 크기를 보여준다 */}
          <div className="mt-4 overflow-x-auto">
            <p aria-hidden style={{ fontSize: `${size}px`, lineHeight: 1.3 }}>
              {SAMPLE}
            </p>
          </div>
        </div>

        <figure aria-hidden className="m-0 rounded-2xl border border-foreground/10 p-4">
          <svg viewBox={`-4 -4 ${CW + 8} ${CH + 8}`} className="w-full overflow-visible">
            <line x1={0} y1={CH} x2={CW} y2={CH} stroke="currentColor" strokeOpacity={0.3} />
            <polyline points={line} fill="none" stroke="var(--accent)" strokeWidth={2.5} />
            <line
              x1={gx(previewVw)}
              x2={gx(previewVw)}
              y1={0}
              y2={CH}
              stroke="currentColor"
              strokeOpacity={0.4}
              strokeDasharray="3 3"
            />
            <circle cx={gx(previewVw)} cy={gy(size)} r={4.5} fill="var(--accent)" />
          </svg>
          <figcaption className="mt-2 text-xs text-foreground/60">
            가로: 화면 너비 {PREVIEW_MIN}~{PREVIEW_MAX}px, 세로: 글자 크기
          </figcaption>
        </figure>
      </div>

      <div className="mt-6">
        <Slider
          label="미리보기 화면 너비"
          value={previewVw}
          min={PREVIEW_MIN}
          max={PREVIEW_MAX}
          display={`${previewVw}px`}
          onChange={setPreviewVw}
        />
      </div>

      <ToolControls>
        <Slider
          label="최소 글자 크기"
          value={state.minSize}
          min={L.minSize.min}
          max={L.minSize.max}
          display={`${state.minSize}px`}
          onChange={(n) => update({ minSize: n })}
        />
        <Slider
          label="최대 글자 크기"
          value={state.maxSize}
          min={L.maxSize.min}
          max={L.maxSize.max}
          display={`${state.maxSize}px`}
          onChange={(n) => update({ maxSize: n })}
        />
        <Slider
          label="최소 화면 너비"
          value={state.minVw}
          min={L.minVw.min}
          max={L.minVw.max}
          display={`${state.minVw}px`}
          onChange={(n) => update({ minVw: n })}
        />
        <Slider
          label="최대 화면 너비"
          value={state.maxVw}
          min={L.maxVw.min}
          max={L.maxVw.max}
          display={`${state.maxVw}px`}
          onChange={(n) => update({ maxVw: n })}
        />
      </ToolControls>

      <table className="mt-8 w-full max-w-md text-sm">
        <caption className="mb-2 text-left text-sm font-medium">화면 너비별 글자 크기</caption>
        <thead>
          <tr className="border-b border-foreground/15 text-left text-xs text-foreground/60">
            <th scope="col" className="py-1.5 font-normal">
              화면 너비
            </th>
            <th scope="col" className="py-1.5 font-normal">
              글자 크기
            </th>
          </tr>
        </thead>
        <tbody>
          {TABLE_WIDTHS.map((vw) => (
            <tr key={vw} className="border-b border-foreground/10">
              <td className="py-1.5 font-mono">{vw}px</td>
              <td className="py-1.5 font-mono">{fluidSizeAt(state, vw).toFixed(1)}px</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ToolFooter
        presets={presets}
        isFull={isFull}
        state={state}
        onSave={save}
        onLoad={load}
        onRemove={remove}
        code={{
          title: "CSS",
          code: fluidToCss(state),
          file: { name: "fluid-type", ext: "css" },
        }}
        note={
          fluidValue(state).startsWith("clamp")
            ? "rem은 브라우저 기본 글자 크기(16px) 기준이라, 사용자가 글자 크기를 키워 두면 함께 커집니다."
            : "최소와 최대 크기가 같아서 clamp 없이 고정 크기입니다."
        }
      />
    </ToolPage>
  );
}

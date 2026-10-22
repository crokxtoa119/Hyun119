"use client";

import { useState } from "react";
import {
  BLENDS,
  DEFAULT_GRAIN,
  GRAIN_LIMITS,
  KINDS,
  clampGrain,
  grainDataUri,
  grainOpacity,
  grainToCss,
  isGrainState,
  type GrainState,
} from "@/lib/grain";
import { usePresets } from "@/lib/usePresets";
import Chip from "@/components/ui/Chip";
import { SharedNotice } from "@/components/ui/Share";
import { ToolControls, ToolFooter, ToolPage } from "@/components/ui/ToolLayout";
import Slider from "@/components/ui/Slider";

/** 질감이 어떻게 보이는지 비교하려고 깔아 보는 배경. 프리셋에는 저장하지 않는다. */
const BACKDROPS = [
  { id: "gradient", label: "그라디언트", css: "linear-gradient(135deg, #6366F1, #EC4899 60%, #F59E0B)" },
  { id: "dark", label: "어두운 단색", css: "#1F2937" },
  { id: "light", label: "밝은 단색", css: "#F3EBDD" },
] as const;

export default function GrainMaker() {
  const [state, setState] = useState<GrainState>(DEFAULT_GRAIN);
  const [backdrop, setBackdrop] = useState<(typeof BACKDROPS)[number]["id"]>("gradient");
  const [original, setOriginal] = useState(false);
  const update = (patch: Partial<GrainState>) => setState((s) => clampGrain({ ...s, ...patch }));

  const { presets, save, remove, isFull } = usePresets("sc-grain-presets", isGrainState);
  const load = (s: GrainState) => setState(clampGrain(s));

  const bg = BACKDROPS.find((b) => b.id === backdrop)!.css;

  return (
    <ToolPage
      title="Grain"
      description="SVG 노이즈로 종이나 필름 같은 질감을 만들고 CSS를 복사하세요. 이미지 파일 없이 코드만 씁니다."
    >
      <SharedNotice validate={isGrainState} onApply={load} />

      <div
        role="img"
        aria-label={original ? "질감 없는 원본 미리보기" : "질감을 입힌 미리보기"}
        className="relative mt-8 flex h-64 items-center justify-center overflow-hidden rounded-2xl border border-foreground/10 font-mono text-sm"
        style={{ background: bg, color: backdrop === "light" ? "#1F2937" : "#fff" }}
      >
        <span className="relative">{original ? "원본" : "grain"}</span>
        {!original && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `url("${grainDataUri(state)}")`,
              opacity: grainOpacity(state),
              mixBlendMode: state.blend === "normal" ? undefined : state.blend,
            }}
          />
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {BACKDROPS.map((b) => (
          <Chip key={b.id} active={backdrop === b.id} onClick={() => setBackdrop(b.id)}>
            {b.label}
          </Chip>
        ))}
        <Chip active={original} onClick={() => setOriginal((v) => !v)}>
          질감 없이 보기
        </Chip>
        <Chip active={false} onClick={() => setState(DEFAULT_GRAIN)}>
          초기화
        </Chip>
      </div>

      <ToolControls>
        <div className="space-y-5">
          <fieldset>
            <legend className="mb-2 text-sm font-medium">노이즈 종류</legend>
            <div className="flex flex-wrap gap-2">
              {KINDS.map(({ value, label }) => (
                <Chip key={value} active={state.kind === value} onClick={() => update({ kind: value })}>
                  {label}
                </Chip>
              ))}
            </div>
          </fieldset>
          <Slider
            label="알갱이 고움 (baseFrequency)"
            value={state.frequency}
            min={GRAIN_LIMITS.frequency.min}
            max={GRAIN_LIMITS.frequency.max}
            display={String(state.frequency / 100)}
            onChange={(n) => update({ frequency: n })}
          />
          <Slider
            label="겹 수 (numOctaves)"
            value={state.octaves}
            min={GRAIN_LIMITS.octaves.min}
            max={GRAIN_LIMITS.octaves.max}
            onChange={(n) => update({ octaves: n })}
          />
          <Slider
            label="시드"
            value={state.seed}
            min={GRAIN_LIMITS.seed.min}
            max={GRAIN_LIMITS.seed.max}
            onChange={(n) => update({ seed: n })}
          />
        </div>

        <div className="space-y-5">
          <Slider
            label="진하기 (opacity)"
            value={state.opacity}
            min={GRAIN_LIMITS.opacity.min}
            max={GRAIN_LIMITS.opacity.max}
            display={`${state.opacity}%`}
            onChange={(n) => update({ opacity: n })}
          />
          <fieldset>
            <legend className="mb-2 font-mono text-sm font-medium">mix-blend-mode</legend>
            <div className="flex flex-wrap gap-2">
              {BLENDS.map((b) => (
                <Chip key={b} active={state.blend === b} onClick={() => update({ blend: b })}>
                  {b}
                </Chip>
              ))}
            </div>
          </fieldset>
          <Chip active={state.mono} onClick={() => update({ mono: !state.mono })}>
            흑백 알갱이
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
          code: grainToCss(state),
          file: { name: "grain", ext: "css" },
        }}
        note="질감을 입힐 요소에 grain 클래스를 붙이면 ::after 층이 위에 깔립니다. stitchTiles 덕분에 200px 한 칸을 반복해도 이음새가 보이지 않고, pointer-events: none이라 클릭은 아래 요소로 전달됩니다."
      />
    </ToolPage>
  );
}

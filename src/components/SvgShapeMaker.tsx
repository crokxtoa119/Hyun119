"use client";

import { useState } from "react";
import {
  DEFAULT_SHAPE,
  KINDS,
  SHAPE_LIMITS,
  clampShape,
  isShapeState,
  shapeBox,
  shapePath,
  shapeToSvg,
  type ShapeState,
} from "@/lib/svgShape";
import { usePresets } from "@/lib/usePresets";
import Chip from "@/components/ui/Chip";
import { SharedNotice } from "@/components/ui/Share";
import { ToolControls, ToolFooter, ToolPage } from "@/components/ui/ToolLayout";
import Slider from "@/components/ui/Slider";

const NOTES = {
  wave:
    "처음과 끝의 높이가 같아서 같은 SVG를 가로로 나란히 놓아도 이음새가 보이지 않습니다. preserveAspectRatio=\"none\"이라 너비에 맞춰 늘어나고, 높이는 CSS로 정하면 됩니다.",
  blob: "시드가 같으면 항상 같은 모양이 나옵니다. 마음에 드는 모양의 시드를 기억해 두면 다시 만들 수 있습니다.",
} as const;

export default function SvgShapeMaker() {
  const [state, setState] = useState<ShapeState>(DEFAULT_SHAPE);
  const update = (patch: Partial<ShapeState>) => setState((s) => clampShape({ ...s, ...patch }));

  const { presets, save, remove, isFull } = usePresets("sc-svg-shape-presets", isShapeState);
  const load = (s: ShapeState) => setState(clampShape(s));

  const { width, height } = shapeBox(state);
  const wave = state.kind === "wave";

  return (
    <ToolPage
      title="Wave & Blob"
      description="웨이브와 블롭 모양을 만들고 SVG 코드를 복사하세요. 섹션 구분선이나 배경 장식에 쓸 수 있습니다."
    >
      <SharedNotice validate={isShapeState} onApply={load} />

      <div className="mt-8 overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/5 p-4">
        <svg
          role="img"
          aria-label={wave ? "웨이브 미리보기" : "블롭 미리보기"}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio={wave ? "none" : undefined}
          className={wave ? "block h-40 w-full" : "mx-auto block size-64"}
        >
          <path d={shapePath(state)} fill={state.color} />
        </svg>
      </div>

      <ToolControls>
        <div className="space-y-5">
          <fieldset>
            <legend className="mb-2 text-sm font-medium">모양</legend>
            <div className="flex flex-wrap gap-2">
              {KINDS.map(({ value, label }) => (
                <Chip key={value} active={state.kind === value} onClick={() => update({ kind: value })}>
                  {label}
                </Chip>
              ))}
            </div>
          </fieldset>
          <label className="flex items-center gap-3 text-sm font-medium">
            채우기 색
            <input
              type="color"
              value={state.color}
              onChange={(e) => update({ color: e.target.value })}
              className="h-8 w-10 cursor-pointer rounded border border-foreground/20 bg-transparent"
            />
            <span className="font-mono text-xs text-foreground/60">{state.color}</span>
          </label>
        </div>

        {wave ? (
          <div className="space-y-5">
            <Slider
              label="물결 개수"
              value={state.waves}
              min={SHAPE_LIMITS.waves.min}
              max={SHAPE_LIMITS.waves.max}
              onChange={(n) => update({ waves: n })}
            />
            <Slider
              label="물결 높이"
              value={state.amplitude}
              min={SHAPE_LIMITS.amplitude.min}
              max={SHAPE_LIMITS.amplitude.max}
              onChange={(n) => update({ amplitude: n })}
            />
            <Slider
              label="둥글기"
              value={state.round}
              min={SHAPE_LIMITS.round.min}
              max={SHAPE_LIMITS.round.max}
              display={state.round === 0 ? "지그재그" : `${state.round}%`}
              onChange={(n) => update({ round: n })}
            />
            <Chip active={state.flip} onClick={() => update({ flip: !state.flip })}>
              위쪽 채우기
            </Chip>
          </div>
        ) : (
          <div className="space-y-5">
            <Slider
              label="꼭짓점 개수"
              value={state.points}
              min={SHAPE_LIMITS.points.min}
              max={SHAPE_LIMITS.points.max}
              onChange={(n) => update({ points: n })}
            />
            <Slider
              label="일그러짐"
              value={state.randomness}
              min={SHAPE_LIMITS.randomness.min}
              max={SHAPE_LIMITS.randomness.max}
              display={`${state.randomness}%`}
              onChange={(n) => update({ randomness: n })}
            />
            <Slider
              label="시드"
              value={state.seed}
              min={SHAPE_LIMITS.seed.min}
              max={SHAPE_LIMITS.seed.max}
              onChange={(n) => update({ seed: n })}
            />
            <Chip
              active={false}
              onClick={() =>
                update({
                  seed: Math.floor(Math.random() * SHAPE_LIMITS.seed.max) + SHAPE_LIMITS.seed.min,
                })
              }
            >
              다시 뽑기
            </Chip>
          </div>
        )}
      </ToolControls>

      <ToolFooter
        presets={presets}
        isFull={isFull}
        state={state}
        onSave={save}
        onLoad={load}
        onRemove={remove}
        code={{
          title: "SVG 코드",
          code: shapeToSvg(state),
          file: { name: "svg-shape", ext: "svg" },
        }}
        note={NOTES[state.kind]}
      />
    </ToolPage>
  );
}

"use client";

import { useState } from "react";
import {
  DEFAULT_MASK,
  MASK_LIMITS,
  MIN_GAP,
  SHAPES,
  clampMask,
  isMaskState,
  maskToCss,
  maskValue,
  type MaskState,
} from "@/lib/mask";
import { usePresets } from "@/lib/usePresets";
import Chip from "@/components/ui/Chip";
import { SharedNotice } from "@/components/ui/Share";
import { ToolControls, ToolFooter, ToolPage } from "@/components/ui/ToolLayout";
import Slider from "@/components/ui/Slider";

export default function MaskMaker() {
  const [state, setState] = useState<MaskState>(DEFAULT_MASK);
  const [original, setOriginal] = useState(false);
  const update = (patch: Partial<MaskState>) => setState((s) => clampMask({ ...s, ...patch }));

  const { presets, save, remove, isFull } = usePresets("sc-mask-presets", isMaskState);
  const load = (s: MaskState) => setState(clampMask(s));

  const value = maskValue(state);
  const linear = state.shape === "linear";

  return (
    <ToolPage
      title="Mask"
      description="그라디언트로 요소의 가장자리를 부드럽게 지우는 mask-image를 만들고 CSS를 복사하세요."
    >
      <SharedNotice validate={isMaskState} onApply={load} />

      {/* 마스크는 뒤의 배경이 비쳐 보이게 하므로, 지워진 곳을 알아보기 쉽게 체크무늬를 깐다 */}
      <div
        className="mt-8 rounded-2xl border border-foreground/10 p-4"
        style={{
          backgroundImage:
            "conic-gradient(rgb(128 128 128 / 0.18) 25%, transparent 0 50%, rgb(128 128 128 / 0.18) 0 75%, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      >
        <div
          role="img"
          aria-label={original ? "마스크 없는 원본 미리보기" : "마스크를 적용한 미리보기"}
          className="flex h-64 items-center justify-center rounded-xl font-mono text-sm text-white"
          style={{
            background: "linear-gradient(135deg, #6366F1, #EC4899 60%, #F59E0B)",
            WebkitMaskImage: original ? undefined : value,
            maskImage: original ? undefined : value,
          }}
        >
          {original ? "원본" : "masked"}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Chip active={original} onClick={() => setOriginal((v) => !v)}>
          마스크 없이 보기
        </Chip>
        <Chip active={false} onClick={() => setState(DEFAULT_MASK)}>
          초기화
        </Chip>
      </div>

      <ToolControls>
        <div className="space-y-5">
          <fieldset>
            <legend className="mb-2 text-sm font-medium">모양</legend>
            <div className="flex flex-wrap gap-2">
              {SHAPES.map(({ value: v, label }) => (
                <Chip key={v} active={state.shape === v} onClick={() => update({ shape: v })}>
                  {label}
                </Chip>
              ))}
            </div>
          </fieldset>
          <Slider
            label="방향 (사라지는 쪽)"
            value={state.angle}
            min={MASK_LIMITS.angle.min}
            max={MASK_LIMITS.angle.max}
            disabled={!linear}
            display={linear ? `${state.angle}°` : "해당 없음"}
            onChange={(n) => update({ angle: n })}
          />
          <Chip active={state.invert} onClick={() => update({ invert: !state.invert })}>
            보이는 곳과 사라지는 곳 바꾸기
          </Chip>
        </div>

        <div className="space-y-5">
          <Slider
            label="그대로 보이는 지점"
            value={state.solid}
            min={MASK_LIMITS.solid.min}
            max={MASK_LIMITS.solid.max}
            display={`${state.solid}%`}
            onChange={(n) => update({ solid: n })}
          />
          <Slider
            label={`완전히 사라지는 지점 (최소 ${MIN_GAP}% 뒤)`}
            value={state.end}
            min={MASK_LIMITS.end.min}
            max={MASK_LIMITS.end.max}
            display={`${state.end}%`}
            onChange={(n) => update({ end: n })}
          />
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
          code: maskToCss(state),
          file: { name: "mask", ext: "css" },
        }}
        note="마스크는 색이 아니라 알파(불투명도)만 봅니다. 검정은 보이고 transparent는 사라집니다. 접두사가 붙은 -webkit-mask-image는 오래된 브라우저를 위해 함께 씁니다."
      />
    </ToolPage>
  );
}

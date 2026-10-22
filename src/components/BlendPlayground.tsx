"use client";

import { useState } from "react";
import {
  BLEND_MODES,
  BLEND_NOTES,
  DEFAULT_BLEND,
  OPACITY,
  blendToCss,
  clampBlend,
  isBlendState,
  type BlendState,
} from "@/lib/blend";
import { normalizeHex } from "@/lib/contrast";
import { usePresets } from "@/lib/usePresets";
import Chip from "@/components/ui/Chip";
import { SharedNotice } from "@/components/ui/Share";
import { ToolControls, ToolFooter, ToolPage } from "@/components/ui/ToolLayout";
import Slider from "@/components/ui/Slider";

/** 색 선택기와 hex 입력을 함께 쓰는 입력. 유효한 값일 때만 값을 올린다. */
function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const invalid = draft !== null && normalizeHex(draft) === null;

  return (
    <div>
      <label className="mb-1 block text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          aria-label={`${label} 색 선택`}
          value={value.toLowerCase()}
          onChange={(e) => {
            setDraft(null);
            onChange(e.target.value.toUpperCase());
          }}
          className="size-11 cursor-pointer rounded-lg border border-foreground/20 bg-transparent p-1"
        />
        <input
          id={id}
          type="text"
          spellCheck={false}
          autoComplete="off"
          value={draft ?? value}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-err` : undefined}
          onChange={(e) => {
            setDraft(e.target.value);
            const hex = normalizeHex(e.target.value);
            if (hex) onChange(hex);
          }}
          onBlur={() => setDraft(null)}
          className="w-32 rounded-lg border border-foreground/20 bg-transparent px-3 py-2 font-mono text-sm uppercase"
        />
      </div>
      {invalid && (
        <p id={`${id}-err`} className="mt-1 text-xs text-foreground/70">
          #RGB 또는 #RRGGBB 형식으로 입력하세요.
        </p>
      )}
    </div>
  );
}

export default function BlendPlayground() {
  const [state, setState] = useState<BlendState>(DEFAULT_BLEND);
  const set = <K extends keyof BlendState>(key: K, value: BlendState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const { presets, save, remove, isFull } = usePresets("sc-blend-presets", isBlendState);
  const load = (s: BlendState) => setState(clampBlend(s));

  return (
    <ToolPage
      title="Blend Mode"
      description="두 색을 겹쳐 mix-blend-mode가 어떻게 섞는지 보세요. 모드를 고르고 CSS를 복사하세요."
    >
      <SharedNotice validate={isBlendState} onApply={load} />

      {/* isolate로 섞임을 이 상자 안으로 가둬서 페이지 배경이 결과에 끼어들지 않게 한다 */}
      <div
        aria-hidden
        className="relative isolate mt-8 h-64 overflow-hidden rounded-2xl border border-foreground/10"
        style={{ backgroundColor: state.bottom }}
      >
        <div
          className="absolute left-[18%] top-[14%] size-44 rounded-full sm:size-56"
          style={{
            backgroundColor: state.top,
            mixBlendMode: state.mode,
            opacity: state.opacity / 100,
          }}
        />
        <div
          className="absolute bottom-[14%] right-[18%] h-28 w-40 rounded-xl sm:h-36 sm:w-56"
          style={{
            backgroundColor: state.top,
            mixBlendMode: state.mode,
            opacity: state.opacity / 100,
          }}
        />
      </div>

      <p role="status" className="mt-4 text-sm text-foreground/70">
        <span className="font-mono font-semibold text-foreground">{state.mode}</span> —{" "}
        {BLEND_NOTES[state.mode]}
      </p>

      <fieldset className="mt-6">
        <legend className="mb-2 font-mono text-sm font-medium">mix-blend-mode</legend>
        <div className="flex flex-wrap gap-2">
          {BLEND_MODES.map((m) => (
            <Chip key={m} active={state.mode === m} onClick={() => set("mode", m)}>
              {m}
            </Chip>
          ))}
        </div>
      </fieldset>

      <ToolControls>
        <ColorField id="blend-top" label="위 층 색" value={state.top} onChange={(c) => set("top", c)} />
        <ColorField
          id="blend-bottom"
          label="아래 층 색"
          value={state.bottom}
          onChange={(c) => set("bottom", c)}
        />
        <Slider
          label="위 층 불투명도"
          value={state.opacity}
          min={OPACITY.min}
          max={OPACITY.max}
          display={`${state.opacity}%`}
          onChange={(n) => set("opacity", n)}
        />
        <div className="flex items-end">
          <Chip active={false} onClick={() => setState(DEFAULT_BLEND)}>
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
          code: blendToCss(state),
          file: { name: "blend", ext: "css" },
        }}
      />
    </ToolPage>
  );
}

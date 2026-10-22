"use client";

import { useState } from "react";
import {
  DEFAULT_TEXT_EFFECT,
  LIMITS,
  TEXT_MODES,
  clampTextEffect,
  isTextEffectState,
  normalizeColor,
  textEffectDeclarations,
  textEffectToCss,
  type TextEffectState,
} from "@/lib/textEffect";
import { usePresets } from "@/lib/usePresets";
import Chip from "@/components/ui/Chip";
import { SharedNotice } from "@/components/ui/Share";
import { ToolControls, ToolFooter, ToolPage } from "@/components/ui/ToolLayout";
import Slider from "@/components/ui/Slider";

const MODE_LABEL: Record<TextEffectState["mode"], string> = {
  shadow: "글자 그림자",
  gradient: "그라데이션 글자",
  clamp: "줄 수 제한",
};

const SAMPLE =
  "만들면서 배우는 실험실입니다. 작은 도구를 하나씩 만들고, 배운 것을 페이지로 남깁니다. 글이 길어지면 정해 둔 줄 수에서 잘리고 말줄임표가 붙습니다. 카드 목록의 설명처럼 길이가 제각각인 글을 같은 높이로 맞출 때 씁니다.";

/** 색 선택기와 입력칸을 함께 쓰는 입력. 알파가 있는 8자리 색은 입력칸으로만 쓸 수 있다. */
function ColorField({
  id,
  label,
  value,
  allowAlpha,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  allowAlpha?: boolean;
  onChange: (c: string) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const parse = (v: string) => {
    const c = normalizeColor(v);
    return c && (allowAlpha || c.length === 7) ? c : null;
  };
  const invalid = draft !== null && parse(draft) === null;

  return (
    <div>
      <label className="mb-1 block text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          aria-label={`${label} 색 선택`}
          value={value.slice(0, 7).toLowerCase()}
          onChange={(e) => {
            setDraft(null);
            // 알파가 있던 색은 색 선택기로 바꿀 때 알파를 유지한다
            onChange(e.target.value.toUpperCase() + (value.length === 9 ? value.slice(7) : ""));
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
            const c = parse(e.target.value);
            if (c) onChange(c);
          }}
          onBlur={() => setDraft(null)}
          className="w-36 rounded-lg border border-foreground/20 bg-transparent px-3 py-2 font-mono text-sm uppercase"
        />
      </div>
      {invalid && (
        <p id={`${id}-err`} className="mt-1 text-xs text-foreground/70">
          {allowAlpha ? "#RRGGBB 또는 #RRGGBBAA" : "#RGB 또는 #RRGGBB"} 형식으로 입력하세요.
        </p>
      )}
    </div>
  );
}

export default function TextEffectsPlayground() {
  const [state, setState] = useState<TextEffectState>(DEFAULT_TEXT_EFFECT);
  const set = <K extends keyof TextEffectState>(key: K, value: TextEffectState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const { presets, save, remove, isFull } = usePresets("sc-text-effects-presets", isTextEffectState);
  const load = (s: TextEffectState) => setState(clampTextEffect(s));

  // 미리보기도 복사용 코드와 같은 선언 목록을 쓴다
  const effectStyle = Object.fromEntries(
    textEffectDeclarations(state).map(([k, v]) => [
      k.replace(/^-webkit-/, "Webkit-").replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()),
      v,
    ]),
  );

  return (
    <ToolPage
      title="Text Effects"
      description="글자 그림자, 그라데이션 글자, 줄 수 제한 중 하나를 골라 값을 조절하고 CSS를 복사하세요."
    >
      <SharedNotice validate={isTextEffectState} onApply={load} />

      {/* 테마와 관계없이 글자가 보이도록 밝은 고정 배경과 어두운 글자색을 쓴다 */}
      <div
        aria-hidden
        className="mt-8 flex min-h-56 items-center justify-center rounded-2xl border border-foreground/10 p-8"
        style={{ backgroundColor: "#F3F4F6", color: "#111827" }}
      >
        {state.mode === "clamp" ? (
          <p className="w-full max-w-md text-base leading-relaxed" style={effectStyle}>
            {SAMPLE}
          </p>
        ) : (
          <p className="text-5xl font-extrabold tracking-tight sm:text-7xl" style={effectStyle}>
            SketchCraft
          </p>
        )}
      </div>

      <fieldset className="mt-6">
        <legend className="mb-2 text-sm font-medium">효과</legend>
        <div className="flex flex-wrap gap-2">
          {TEXT_MODES.map((m) => (
            <Chip key={m} active={state.mode === m} onClick={() => set("mode", m)}>
              {MODE_LABEL[m]}
            </Chip>
          ))}
          <Chip active={false} onClick={() => setState(DEFAULT_TEXT_EFFECT)}>
            초기화
          </Chip>
        </div>
      </fieldset>

      <ToolControls>
        {state.mode === "shadow" && (
          <>
            <Slider
              label="가로 거리"
              value={state.shadowX}
              min={LIMITS.shadowOffset.min}
              max={LIMITS.shadowOffset.max}
              display={`${state.shadowX}px`}
              onChange={(n) => set("shadowX", n)}
            />
            <Slider
              label="세로 거리"
              value={state.shadowY}
              min={LIMITS.shadowOffset.min}
              max={LIMITS.shadowOffset.max}
              display={`${state.shadowY}px`}
              onChange={(n) => set("shadowY", n)}
            />
            <Slider
              label="흐림"
              value={state.shadowBlur}
              min={LIMITS.shadowBlur.min}
              max={LIMITS.shadowBlur.max}
              display={`${state.shadowBlur}px`}
              onChange={(n) => set("shadowBlur", n)}
            />
            <ColorField
              id="text-shadow-color"
              label="그림자 색"
              value={state.shadowColor}
              allowAlpha
              onChange={(c) => set("shadowColor", c)}
            />
          </>
        )}

        {state.mode === "gradient" && (
          <>
            <Slider
              label="각도"
              value={state.gradAngle}
              min={LIMITS.gradAngle.min}
              max={LIMITS.gradAngle.max}
              display={`${state.gradAngle}°`}
              onChange={(n) => set("gradAngle", n)}
            />
            <div />
            <ColorField
              id="text-grad-from"
              label="시작 색"
              value={state.gradFrom}
              onChange={(c) => set("gradFrom", c)}
            />
            <ColorField
              id="text-grad-to"
              label="끝 색"
              value={state.gradTo}
              onChange={(c) => set("gradTo", c)}
            />
          </>
        )}

        {state.mode === "clamp" && (
          <Slider
            label="최대 줄 수"
            value={state.lines}
            min={LIMITS.lines.min}
            max={LIMITS.lines.max}
            display={`${state.lines}줄`}
            onChange={(n) => set("lines", n)}
          />
        )}
      </ToolControls>

      {state.mode === "gradient" && (
        <p className="mt-4 text-xs text-foreground/60">
          그라데이션 글자는 양 끝 색이 모두 배경과 충분히 달라야 읽을 수 있습니다. Contrast
          Checker로 두 색을 각각 확인해 보세요.
        </p>
      )}

      <ToolFooter
        presets={presets}
        isFull={isFull}
        state={state}
        onSave={save}
        onLoad={load}
        onRemove={remove}
        code={{
          title: "CSS",
          code: textEffectToCss(state),
          file: { name: "text-effects", ext: "css" },
        }}
      />
    </ToolPage>
  );
}

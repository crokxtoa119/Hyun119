"use client";

import { useState } from "react";
import {
  DEFAULT_CONTRAST,
  contrastRatio,
  formatRatio,
  gradeContrast,
  isContrastState,
  normalizeHex,
  suggestForeground,
  type ContrastState,
} from "@/lib/contrast";
import { usePresets } from "@/lib/usePresets";
import Chip from "@/components/ui/Chip";
import { SharedNotice } from "@/components/ui/Share";
import { ToolControls, ToolFooter, ToolPage } from "@/components/ui/ToolLayout";

/** 색 선택기와 hex 입력을 함께 쓰는 입력. 잘못된 글자는 입력 중에만 허용하고 유효할 때만 값을 올린다. */
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
  const text = draft ?? value;
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
          value={text}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-err` : undefined}
          onChange={(e) => {
            const v = e.target.value;
            setDraft(v);
            const hex = normalizeHex(v);
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

function Badge({ pass, label }: { pass: boolean; label: string }) {
  return (
    <li className="flex items-center justify-between gap-3 py-2 text-sm">
      <span>{label}</span>
      <span
        className={`rounded-full border px-3 py-0.5 font-mono text-xs ${
          pass ? "border-foreground bg-foreground text-background" : "border-foreground/30"
        }`}
      >
        {pass ? "통과" : "실패"}
      </span>
    </li>
  );
}

export default function ContrastChecker() {
  const [state, setState] = useState<ContrastState>(DEFAULT_CONTRAST);
  const { fg, bg } = state;

  const ratio = contrastRatio(fg, bg);
  const grades = gradeContrast(ratio);
  const fix = grades.aa ? null : suggestForeground(fg, bg);

  const { presets, save, remove, isFull } = usePresets("sc-contrast-presets", isContrastState);
  const load = (s: ContrastState) =>
    setState({ fg: normalizeHex(s.fg) ?? fg, bg: normalizeHex(s.bg) ?? bg });

  const css = `color: ${fg};\nbackground-color: ${bg};`;

  return (
    <ToolPage
      title="Contrast Checker"
      description="글자색과 배경색의 명암비를 계산하고 WCAG 2.2 기준을 통과하는지 확인하세요."
    >
      <SharedNotice validate={isContrastState} onApply={load} />

      <ToolControls>
        <div className="space-y-6">
          <ColorField
            id="contrast-fg"
            label="글자색"
            value={fg}
            onChange={(hex) => setState((s) => ({ ...s, fg: hex }))}
          />
          <ColorField
            id="contrast-bg"
            label="배경색"
            value={bg}
            onChange={(hex) => setState((s) => ({ ...s, bg: hex }))}
          />
          <div className="flex flex-wrap gap-2">
            <Chip active={false} onClick={() => setState({ fg: bg, bg: fg })}>
              색 바꾸기
            </Chip>
            <Chip active={false} onClick={() => setState(DEFAULT_CONTRAST)}>
              초기화
            </Chip>
            {fix && (
              <Chip active={false} onClick={() => setState((s) => ({ ...s, fg: fix }))}>
                AA 통과 색으로 보정 ({fix})
              </Chip>
            )}
          </div>
        </div>

        <div
          className="flex flex-col justify-center gap-3 rounded-2xl border border-foreground/10 p-8"
          style={{ color: fg, backgroundColor: bg }}
        >
          <p className="text-3xl font-bold">큰 글자 Aa 샘플</p>
          <p className="text-base">
            본문 글자 예시입니다. 배경과 글자색의 차이가 충분해야 누구나 편하게 읽을 수 있습니다.
          </p>
          <p className="text-xs">작은 글자 12px — The quick brown fox jumps over the lazy dog.</p>
        </div>
      </ToolControls>

      <section
        aria-labelledby="ratio-title"
        className="mt-8 rounded-2xl border border-foreground/10 p-6"
      >
        <h2 id="ratio-title" className="text-sm font-medium text-foreground/70">
          명암비
        </h2>
        <p className="mt-1 font-mono text-4xl font-bold" role="status">
          {formatRatio(ratio)}
        </p>
        <ul className="mt-4 divide-y divide-foreground/10">
          <Badge pass={grades.aa} label="일반 글자 AA (4.5:1)" />
          <Badge pass={grades.aaLarge} label="큰 글자 AA (3:1)" />
          <Badge pass={grades.aaa} label="일반 글자 AAA (7:1)" />
          <Badge pass={grades.aaaLarge} label="큰 글자 AAA (4.5:1)" />
          <Badge pass={grades.ui} label="UI 구성요소·그래픽 (3:1)" />
        </ul>
        <p className="mt-3 text-xs text-foreground/60">
          큰 글자는 24px 이상, 또는 굵은 글자 약 18.7px 이상입니다. 소수 셋째 자리는 내림해서
          보여줍니다.
        </p>
      </section>

      <ToolFooter
        presets={presets}
        isFull={isFull}
        state={state}
        onSave={save}
        onLoad={load}
        onRemove={remove}
        code={{
          title: "CSS",
          code: css,
          file: { name: "contrast", ext: "css" },
        }}
      />
    </ToolPage>
  );
}

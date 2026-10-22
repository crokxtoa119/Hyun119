"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { FONTS, fontByKey } from "@/lib/fontOptions";
import { prefersReducedMotion } from "@/lib/motion";
import { isTypographyPreset, type TypographyAlign, type TypographyPreset } from "@/lib/presetValidators";
import { usePresets } from "@/lib/usePresets";
import Chip from "@/components/ui/Chip";
import { SharedNotice } from "@/components/ui/Share";
import { ToolFooter, ToolPage } from "@/components/ui/ToolLayout";
import Slider from "@/components/ui/Slider";

gsap.registerPlugin(useGSAP);

type Align = TypographyAlign;
const ALIGNS: { value: Align; label: string }[] = [
  { value: "left", label: "왼쪽" },
  { value: "center", label: "가운데" },
  { value: "right", label: "오른쪽" },
];

const SAMPLE = "The quick brown fox jumps over the lazy dog.\n다람쥐 헌 쳇바퀴에 타고파.";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export default function TypographyPlayground() {
  const root = useRef<HTMLDivElement>(null);
  const [fontKey, setFontKey] = useState("playfair");
  const [text, setText] = useState(SAMPLE);
  const [size, setSize] = useState(56);
  const [weight, setWeight] = useState(600);
  const [tracking, setTracking] = useState(0);
  const [leading, setLeading] = useState(1.2);
  const [align, setAlign] = useState<Align>("left");

  const font = fontByKey(fontKey);
  // 선택한 폰트가 지원하는 굵기 범위로 맞춘다
  const effectiveWeight = clamp(weight, font.wMin, font.wMax);

  const { contextSafe } = useGSAP({ scope: root });
  const flash = contextSafe(() => {
    if (prefersReducedMotion()) return;
    gsap.fromTo(
      ".preview-text",
      { opacity: 0.2, y: 8 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
    );
  });

  const changeFont = (key: string) => {
    setFontKey(key);
    flash();
  };

  const { presets, save, remove, isFull } = usePresets(
    "sc-typography-presets",
    isTypographyPreset,
  );

  const loadPreset = (p: TypographyPreset) => {
    setFontKey(p.fontKey);
    setText(p.text.slice(0, 500));
    setSize(clamp(p.size, 12, 120));
    setWeight(clamp(p.weight, 100, 900));
    setTracking(clamp(p.tracking, -0.1, 0.5));
    setLeading(clamp(p.leading, 0.8, 2.4));
    setAlign(p.align);
    flash();
  };

  const css = [
    `font-family: ${font.cssName};`,
    `font-size: ${size}px;`,
    `font-weight: ${effectiveWeight};`,
    `letter-spacing: ${tracking.toFixed(2)}em;`,
    `line-height: ${leading.toFixed(2)};`,
    `text-align: ${align};`,
  ].join("\n");

  return (
    <ToolPage
      rootRef={root}
      title="Typography Playground"
      description="폰트와 크기, 굵기, 자간, 행간을 조절하며 결과를 미리 보고 CSS를 복사하세요."
    >
      <SharedNotice validate={isTypographyPreset} onApply={loadPreset} />

      <div className="mt-8 overflow-hidden rounded-2xl border border-foreground/10 p-6 sm:p-10">
        <p
          className="preview-text whitespace-pre-wrap break-words"
          style={{
            fontFamily: font.stack,
            fontSize: size,
            fontWeight: effectiveWeight,
            letterSpacing: `${tracking}em`,
            lineHeight: leading,
            textAlign: align,
          }}
        >
          {text || " "}
        </p>
      </div>
      <p className="mt-2 text-xs text-foreground/60">
        한글은 &quot;(한글)&quot; 표시가 있는 폰트에서만 해당 폰트로 보이고, 나머지는 기본 폰트로 대체됩니다.
      </p>

      <div className="mt-8 space-y-6">
        <div>
          <p className="mb-2 text-sm font-medium">폰트</p>
          <div className="flex flex-wrap gap-2">
            {FONTS.map((f) => (
              <Chip key={f.key} active={fontKey === f.key} onClick={() => changeFont(f.key)}>
                {f.label}
              </Chip>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">미리보기 문장</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            className="w-full resize-y rounded-lg border border-foreground/20 bg-transparent p-3 text-sm focus-visible:outline-2 focus-visible:outline-foreground"
          />
        </label>

        <div className="grid gap-6 sm:grid-cols-2">
          <Slider
            label="크기"
            value={size}
            min={12}
            max={120}
            display={`${size}px`}
            onChange={setSize}
          />
          <Slider
            label="굵기"
            value={effectiveWeight}
            min={font.wMin}
            max={font.wMax}
            step={50}
            onChange={setWeight}
          />
          <Slider
            label="자간"
            value={tracking}
            min={-0.1}
            max={0.5}
            step={0.01}
            display={`${tracking.toFixed(2)}em`}
            onChange={setTracking}
          />
          <Slider
            label="행간"
            value={leading}
            min={0.8}
            max={2.4}
            step={0.05}
            display={leading.toFixed(2)}
            onChange={setLeading}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">정렬</p>
          <div className="flex gap-2">
            {ALIGNS.map(({ value, label }) => (
              <Chip key={value} active={align === value} onClick={() => setAlign(value)}>
                {label}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <ToolFooter
        presets={presets}
        isFull={isFull}
        state={{ fontKey, text, size, weight, tracking, leading, align }}
        onSave={save}
        onLoad={loadPreset}
        onRemove={remove}
        code={{
          title: "CSS",
          code: css,
          file: { name: "typography", ext: "css" },
        }}
      />
    </ToolPage>
  );
}

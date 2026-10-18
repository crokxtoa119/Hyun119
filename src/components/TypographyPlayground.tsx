"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { isFiniteNumber, isRecord, usePresets } from "@/lib/usePresets";
import Chip from "@/components/ui/Chip";
import CodeBlock from "@/components/ui/CodeBlock";
import PresetBar from "@/components/ui/PresetBar";
import { ShareButton, SharedNotice } from "@/components/ui/Share";
import Slider from "@/components/ui/Slider";

gsap.registerPlugin(useGSAP);

type FontOption = {
  key: string;
  label: string;
  /** 미리보기에 쓰는 실제 font-family 값 (next/font CSS 변수) */
  stack: string;
  /** 복사용 CSS에 넣는 font-family 값 */
  cssName: string;
  wMin: number;
  wMax: number;
};

const FONTS: FontOption[] = [
  {
    key: "geist",
    label: "Geist",
    stack: "var(--font-geist-sans), sans-serif",
    cssName: '"Geist", sans-serif',
    wMin: 100,
    wMax: 900,
  },
  {
    key: "grotesk",
    label: "Space Grotesk",
    stack: "var(--font-space-grotesk), sans-serif",
    cssName: '"Space Grotesk", sans-serif',
    wMin: 300,
    wMax: 700,
  },
  {
    key: "playfair",
    label: "Playfair Display",
    stack: "var(--font-playfair), serif",
    cssName: '"Playfair Display", serif',
    wMin: 400,
    wMax: 900,
  },
  {
    key: "fraunces",
    label: "Fraunces",
    stack: "var(--font-fraunces), serif",
    cssName: '"Fraunces", serif',
    wMin: 100,
    wMax: 900,
  },
  {
    key: "notosans",
    label: "Noto Sans KR (한글)",
    stack: "var(--font-noto-sans-kr), sans-serif",
    cssName: '"Noto Sans KR", sans-serif',
    wMin: 100,
    wMax: 900,
  },
  {
    key: "notoserif",
    label: "Noto Serif KR (한글)",
    stack: "var(--font-noto-serif-kr), serif",
    cssName: '"Noto Serif KR", serif',
    wMin: 200,
    wMax: 900,
  },
  {
    key: "mono",
    label: "Geist Mono",
    stack: "var(--font-geist-mono), monospace",
    cssName: '"Geist Mono", monospace',
    wMin: 100,
    wMax: 900,
  },
];

type Align = "left" | "center" | "right";
const ALIGNS: { value: Align; label: string }[] = [
  { value: "left", label: "왼쪽" },
  { value: "center", label: "가운데" },
  { value: "right", label: "오른쪽" },
];

const SAMPLE = "The quick brown fox jumps over the lazy dog.\n다람쥐 헌 쳇바퀴에 타고파.";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

type TypographyPreset = {
  fontKey: string;
  text: string;
  size: number;
  weight: number;
  tracking: number;
  leading: number;
  align: Align;
};

function isTypographyPreset(d: unknown): d is TypographyPreset {
  return (
    isRecord(d) &&
    FONTS.some((f) => f.key === d.fontKey) &&
    typeof d.text === "string" &&
    isFiniteNumber(d.size) &&
    isFiniteNumber(d.weight) &&
    isFiniteNumber(d.tracking) &&
    isFiniteNumber(d.leading) &&
    ALIGNS.some((a) => a.value === d.align)
  );
}

export default function TypographyPlayground() {
  const root = useRef<HTMLDivElement>(null);
  const [fontKey, setFontKey] = useState("playfair");
  const [text, setText] = useState(SAMPLE);
  const [size, setSize] = useState(56);
  const [weight, setWeight] = useState(600);
  const [tracking, setTracking] = useState(0);
  const [leading, setLeading] = useState(1.2);
  const [align, setAlign] = useState<Align>("left");

  const font = FONTS.find((f) => f.key === fontKey) ?? FONTS[0];
  // 선택한 폰트가 지원하는 굵기 범위로 맞춘다
  const effectiveWeight = clamp(weight, font.wMin, font.wMax);

  const { contextSafe } = useGSAP({ scope: root });
  const flash = contextSafe(() => {
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
    <div ref={root} className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Typography Playground</h1>
      <p className="mt-2 text-foreground/70">
        폰트와 크기, 굵기, 자간, 행간을 조절하며 결과를 미리 보고 CSS를 복사하세요.
      </p>

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
      <p className="mt-2 text-xs text-foreground/50">
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
            className="w-full resize-y rounded-lg border border-foreground/20 bg-transparent p-3 text-sm focus-visible:outline-2 focus-visible:outline-foreground/50"
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

      <div className="mt-8">
        <PresetBar
          presets={presets}
          isFull={isFull}
          onSave={(name) =>
            save(name, { fontKey, text, size, weight, tracking, leading, align })
          }
          onLoad={loadPreset}
          onRemove={remove}
        />
        <div className="mt-4">
          <ShareButton
            current={{ fontKey, text, size, weight, tracking, leading, align }}
          />
        </div>
      </div>

      <div className="mt-8">
        <CodeBlock title="CSS" code={css} />
      </div>
    </div>
  );
}

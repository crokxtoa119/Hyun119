"use client";

import { useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  HARMONIES,
  generatePalette,
  hslToHex,
  randomBase,
  readableTextColor,
  type Harmony,
  type HSL,
} from "@/lib/color";
import { prefersReducedMotion } from "@/lib/motion";
import { useCopy } from "@/lib/useCopy";
import { isFiniteNumber, isRecord, usePresets } from "@/lib/usePresets";
import Chip from "@/components/ui/Chip";
import CodeBlock from "@/components/ui/CodeBlock";
import PresetBar from "@/components/ui/PresetBar";
import { ShareButton, SharedNotice } from "@/components/ui/Share";
import Slider from "@/components/ui/Slider";

gsap.registerPlugin(useGSAP);

type PalettePreset = HSL & { harmony: Harmony };

function isPalettePreset(d: unknown): d is PalettePreset {
  return (
    isRecord(d) &&
    isFiniteNumber(d.h) &&
    isFiniteNumber(d.s) &&
    isFiniteNumber(d.l) &&
    HARMONIES.some((h) => h.value === d.harmony)
  );
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export default function PaletteGenerator() {
  const root = useRef<HTMLDivElement>(null);
  const [base, setBase] = useState<HSL>({ h: 220, s: 70, l: 55 });
  const [harmony, setHarmony] = useState<Harmony>("analogous");
  const { copied, copy } = useCopy();
  const { presets, save, remove, isFull } = usePresets("sc-palette-presets", isPalettePreset);

  const colors = useMemo(
    () => generatePalette(base, harmony).map(hslToHex),
    [base, harmony],
  );

  // 배색 규칙이 바뀌거나 랜덤 생성 시 스와치가 순서대로 올라오는 연출
  const { contextSafe } = useGSAP({ scope: root });
  const playIntro = contextSafe(() => {
    if (prefersReducedMotion()) return;
    gsap.fromTo(
      ".swatch",
      { yPercent: 12, opacity: 0.4 },
      { yPercent: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: "power3.out" },
    );
  });

  const update = (patch: Partial<HSL>) => setBase((b) => ({ ...b, ...patch }));

  const changeHarmony = (value: Harmony) => {
    setHarmony(value);
    playIntro();
  };

  const shuffle = () => {
    setBase(randomBase());
    playIntro();
  };

  const loadPreset = (p: PalettePreset) => {
    setBase({ h: clamp(p.h, 0, 360), s: clamp(p.s, 0, 100), l: clamp(p.l, 0, 100) });
    setHarmony(p.harmony);
    playIntro();
  };

  const cssVars = colors.map((c, i) => `  --color-${i + 1}: ${c};`).join("\n");

  return (
    <div ref={root} className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Color Palette</h1>
      <p className="mt-2 text-foreground/70">
        기준 색과 배색 규칙을 고르면 5색 팔레트를 만들어 줍니다. 색을 클릭하면 HEX가 복사됩니다.
      </p>

      <SharedNotice validate={isPalettePreset} onApply={loadPreset} />

      <p role="status" className="sr-only">
        {copied ? `${copied} 색상을 복사했습니다.` : ""}
      </p>

      <div className="mt-8 flex h-64 overflow-hidden rounded-2xl border border-foreground/10">
        {colors.map((hex, i) => (
          <button
            // 색이 겹칠 수 있으므로(예: 채도 0, 명도 100) 색 대신 칸 순서를 key로 쓴다
            key={i}
            type="button"
            onClick={() => copy(hex)}
            style={{ backgroundColor: hex, color: readableTextColor(hex) }}
            className="swatch flex min-w-0 flex-1 items-end justify-center p-1.5 font-mono text-[10px] transition-[flex-grow,background-color] sm:p-3 sm:text-xs duration-300 hover:flex-[1.6] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-current"
            aria-label={`${hex} 복사`}
          >
            {copied === hex ? "Copied!" : hex}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <Slider
            label="Hue"
            value={base.h}
            max={360}
            onChange={(h) => update({ h })}
            track="linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)"
          />
          <Slider
            label="Saturation"
            value={base.s}
            max={100}
            onChange={(s) => update({ s })}
          />
          <Slider
            label="Lightness"
            value={base.l}
            max={100}
            onChange={(l) => update({ l })}
          />
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">배색 규칙</p>
            <div className="flex flex-wrap gap-2">
              {HARMONIES.map(({ value, label }) => (
                <Chip
                  key={value}
                  active={harmony === value}
                  onClick={() => changeHarmony(value)}
                >
                  {label}
                </Chip>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={shuffle}
            className="rounded-lg border border-foreground/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/5"
          >
            랜덤 생성
          </button>
        </div>
      </div>

      <div className="mt-8">
        <PresetBar
          presets={presets}
          isFull={isFull}
          onSave={(name) => save(name, { ...base, harmony })}
          onLoad={loadPreset}
          onRemove={remove}
        />
        <div className="mt-4">
          <ShareButton current={{ ...base, harmony }} />
        </div>
      </div>

      <div className="mt-8">
        <CodeBlock
          title="CSS 변수"
          code={`:root {\n${cssVars}\n}`}
          copyLabel="전체 복사"
        />
      </div>
    </div>
  );
}

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

gsap.registerPlugin(useGSAP);

export default function PaletteGenerator() {
  const root = useRef<HTMLDivElement>(null);
  const [base, setBase] = useState<HSL>({ h: 220, s: 70, l: 55 });
  const [harmony, setHarmony] = useState<Harmony>("analogous");
  const [copied, setCopied] = useState<string | null>(null);

  const colors = useMemo(
    () => generatePalette(base, harmony).map(hslToHex),
    [base, harmony],
  );

  // 배색 규칙이 바뀌거나 랜덤 생성 시 스와치가 순서대로 올라오는 연출
  const { contextSafe } = useGSAP({ scope: root });
  const playIntro = contextSafe(() => {
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

  const copy = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(hex);
      setTimeout(() => setCopied((c) => (c === hex ? null : c)), 1200);
    } catch {
      // 클립보드 권한이 없는 환경에서는 조용히 무시
    }
  };

  const cssVars = colors.map((c, i) => `  --color-${i + 1}: ${c};`).join("\n");

  return (
    <div ref={root} className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Color Palette</h1>
      <p className="mt-2 text-foreground/70">
        기준 색과 배색 규칙을 고르면 5색 팔레트를 만들어 줍니다. 색을 클릭하면 HEX가 복사됩니다.
      </p>

      <div className="mt-8 flex h-64 overflow-hidden rounded-2xl border border-foreground/10">
        {colors.map((hex) => (
          <button
            key={hex}
            type="button"
            onClick={() => copy(hex)}
            style={{ backgroundColor: hex, color: readableTextColor(hex) }}
            className="swatch flex flex-1 items-end justify-center p-3 font-mono text-xs transition-[flex-grow,background-color] duration-300 hover:flex-[1.6] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-current"
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
                <button
                  key={value}
                  type="button"
                  onClick={() => changeHarmony(value)}
                  aria-pressed={harmony === value}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    harmony === value
                      ? "border-foreground bg-foreground text-background"
                      : "border-foreground/20 hover:border-foreground/50"
                  }`}
                >
                  {label}
                </button>
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
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium">CSS 변수</p>
          <button
            type="button"
            onClick={() => copy(`:root {\n${cssVars}\n}`)}
            className="text-xs text-foreground/60 underline hover:text-foreground"
          >
            전체 복사
          </button>
        </div>
        <pre className="overflow-x-auto rounded-xl bg-foreground/5 p-4 font-mono text-xs leading-relaxed">
          {`:root {\n${cssVars}\n}`}
        </pre>
      </div>
    </div>
  );
}

type SliderProps = {
  label: string;
  value: number;
  max: number;
  onChange: (v: number) => void;
  track?: string;
};

function Slider({ label, value, max, onChange, track }: SliderProps) {
  return (
    <label className="block">
      <span className="mb-1 flex justify-between text-sm font-medium">
        {label}
        <span className="font-mono text-foreground/60">{value}</span>
      </span>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={track ? { background: track } : undefined}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-foreground/15 accent-foreground"
      />
    </label>
  );
}

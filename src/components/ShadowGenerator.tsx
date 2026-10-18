"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { hexToRgba } from "@/lib/color";
import Chip from "@/components/ui/Chip";
import CodeBlock from "@/components/ui/CodeBlock";
import Slider from "@/components/ui/Slider";

gsap.registerPlugin(useGSAP);

type Mode = "shadow" | "glass";

const MODES: { value: Mode; label: string }[] = [
  { value: "shadow", label: "그림자" },
  { value: "glass", label: "글래스모피즘" },
];

export default function ShadowGenerator() {
  const root = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("shadow");

  // box-shadow
  const [x, setX] = useState(0);
  const [y, setY] = useState(12);
  const [blur, setBlur] = useState(32);
  const [spread, setSpread] = useState(-4);
  const [shadowColor, setShadowColor] = useState("#000000");
  const [shadowAlpha, setShadowAlpha] = useState(0.25);
  const [inset, setInset] = useState(false);

  // glassmorphism
  const [glassBlur, setGlassBlur] = useState(16);
  const [glassAlpha, setGlassAlpha] = useState(0.2);
  const [borderAlpha, setBorderAlpha] = useState(0.35);
  const [saturate, setSaturate] = useState(160);
  const [tint, setTint] = useState("#FFFFFF");

  const { contextSafe } = useGSAP({ scope: root });
  const pop = contextSafe(() => {
    gsap.fromTo(
      ".demo-card",
      { scale: 0.94, opacity: 0.5 },
      { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.6)" },
    );
  });

  const changeMode = (value: Mode) => {
    setMode(value);
    pop();
  };

  const shadowValue = `${inset ? "inset " : ""}${x}px ${y}px ${blur}px ${spread}px ${hexToRgba(shadowColor, shadowAlpha)}`;
  const backdrop = `blur(${glassBlur}px) saturate(${saturate}%)`;
  const glassBg = hexToRgba(tint, glassAlpha);
  const glassBorder = `1px solid ${hexToRgba("#FFFFFF", borderAlpha)}`;

  const css =
    mode === "shadow"
      ? `box-shadow: ${shadowValue};`
      : [
          `background: ${glassBg};`,
          `backdrop-filter: ${backdrop};`,
          `-webkit-backdrop-filter: ${backdrop};`,
          `border: ${glassBorder};`,
        ].join("\n");

  return (
    <div ref={root} className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Shadow &amp; Glass</h1>
      <p className="mt-2 text-foreground/70">
        box-shadow와 글래스모피즘 값을 조절하고 CSS를 복사하세요.
      </p>

      <div className="mt-8 flex gap-2">
        {MODES.map(({ value, label }) => (
          <Chip key={value} active={mode === value} onClick={() => changeMode(value)}>
            {label}
          </Chip>
        ))}
      </div>

      {/* 미리보기 배경은 테마와 무관하게 고정색을 써서 그림자/유리 효과가 잘 보이게 한다 */}
      <div
        className="relative mt-6 flex h-72 items-center justify-center overflow-hidden rounded-2xl border border-foreground/10"
        style={
          mode === "shadow"
            ? { background: "#E5E7EB" }
            : { background: "linear-gradient(135deg, #6366F1, #EC4899 55%, #F59E0B)" }
        }
      >
        {mode === "glass" && (
          <>
            <span className="absolute left-[18%] top-[22%] size-24 rounded-full bg-white/70" />
            <span className="absolute bottom-[16%] right-[20%] size-32 rounded-full bg-cyan-300/80" />
          </>
        )}
        <div
          className="demo-card relative flex h-40 w-64 items-center justify-center rounded-2xl text-sm font-medium"
          style={
            mode === "shadow"
              ? { background: "#FFFFFF", color: "#111827", boxShadow: shadowValue }
              : {
                  background: glassBg,
                  color: "#FFFFFF",
                  border: glassBorder,
                  backdropFilter: backdrop,
                  WebkitBackdropFilter: backdrop,
                }
          }
        >
          {mode === "shadow" ? "Shadow" : "Glass"}
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {mode === "shadow" ? (
          <>
            <Slider label="X 오프셋" value={x} min={-50} max={50} display={`${x}px`} onChange={setX} />
            <Slider label="Y 오프셋" value={y} min={-50} max={50} display={`${y}px`} onChange={setY} />
            <Slider label="블러" value={blur} min={0} max={100} display={`${blur}px`} onChange={setBlur} />
            <Slider label="스프레드" value={spread} min={-30} max={30} display={`${spread}px`} onChange={setSpread} />
            <Slider
              label="투명도"
              value={shadowAlpha}
              min={0}
              max={1}
              step={0.01}
              display={shadowAlpha.toFixed(2)}
              onChange={setShadowAlpha}
            />
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-3 text-sm font-medium">
                색상
                <input
                  type="color"
                  value={shadowColor}
                  onChange={(e) => setShadowColor(e.target.value.toUpperCase())}
                  className="h-8 w-10 cursor-pointer rounded border border-foreground/20 bg-transparent"
                />
              </label>
              <Chip active={inset} onClick={() => setInset((v) => !v)}>
                inset
              </Chip>
            </div>
          </>
        ) : (
          <>
            <Slider label="블러" value={glassBlur} min={0} max={40} display={`${glassBlur}px`} onChange={setGlassBlur} />
            <Slider
              label="배경 투명도"
              value={glassAlpha}
              min={0}
              max={1}
              step={0.01}
              display={glassAlpha.toFixed(2)}
              onChange={setGlassAlpha}
            />
            <Slider
              label="테두리 투명도"
              value={borderAlpha}
              min={0}
              max={1}
              step={0.01}
              display={borderAlpha.toFixed(2)}
              onChange={setBorderAlpha}
            />
            <Slider
              label="채도"
              value={saturate}
              min={100}
              max={250}
              display={`${saturate}%`}
              onChange={setSaturate}
            />
            <label className="flex items-center gap-3 text-sm font-medium">
              유리 색상
              <input
                type="color"
                value={tint}
                onChange={(e) => setTint(e.target.value.toUpperCase())}
                className="h-8 w-10 cursor-pointer rounded border border-foreground/20 bg-transparent"
              />
            </label>
          </>
        )}
      </div>

      <div className="mt-8">
        <CodeBlock title="CSS" code={css} />
      </div>
    </div>
  );
}

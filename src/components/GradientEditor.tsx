"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { readableTextColor } from "@/lib/color";

gsap.registerPlugin(useGSAP);

type Kind = "linear" | "radial" | "conic";
type Stop = { id: number; color: string; pos: number };

const KINDS: { value: Kind; label: string }[] = [
  { value: "linear", label: "선형" },
  { value: "radial", label: "원형" },
  { value: "conic", label: "원뿔" },
];

const EXTRA_COLORS = ["#F59E0B", "#10B981", "#3B82F6", "#EF4444", "#8B5CF6"];

const MAX_STOPS = 5;
const MIN_STOPS = 2;

function buildCss(kind: Kind, angle: number, stops: Stop[]): string {
  const list = [...stops]
    .sort((a, b) => a.pos - b.pos)
    .map((s) => `${s.color} ${s.pos}%`)
    .join(", ");
  if (kind === "radial") return `radial-gradient(circle, ${list})`;
  if (kind === "conic") return `conic-gradient(from ${angle}deg, ${list})`;
  return `linear-gradient(${angle}deg, ${list})`;
}

export default function GradientEditor() {
  const root = useRef<HTMLDivElement>(null);
  const nextId = useRef(3);
  const [kind, setKind] = useState<Kind>("linear");
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<Stop[]>([
    { id: 1, color: "#6366F1", pos: 0 },
    { id: 2, color: "#EC4899", pos: 100 },
  ]);
  const [copied, setCopied] = useState(false);

  const css = buildCss(kind, angle, stops);
  const declaration = `background: ${css};`;
  const textColor = readableTextColor(stops[0].color);

  const { contextSafe } = useGSAP({ scope: root });
  const pulsePreview = contextSafe(() => {
    gsap.fromTo(
      ".preview",
      { scale: 0.97 },
      { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.6)" },
    );
  });

  const updateStop = (id: number, patch: Partial<Stop>) =>
    setStops((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const addStop = () => {
    if (stops.length >= MAX_STOPS) return;
    const id = nextId.current++;
    const color = EXTRA_COLORS[id % EXTRA_COLORS.length];
    setStops((list) => [...list, { id, color, pos: 50 }]);
    pulsePreview();
  };

  const removeStop = (id: number) => {
    if (stops.length <= MIN_STOPS) return;
    setStops((list) => list.filter((s) => s.id !== id));
    pulsePreview();
  };

  const changeKind = (value: Kind) => {
    setKind(value);
    pulsePreview();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(declaration);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // 클립보드 권한이 없는 환경에서는 조용히 무시
    }
  };

  return (
    <div ref={root} className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Gradient Editor</h1>
      <p className="mt-2 text-foreground/70">
        색 정지점과 각도를 조절해 CSS 그라디언트를 만들고 코드를 복사하세요.
      </p>

      <div
        className="preview mt-8 flex h-64 items-center justify-center rounded-2xl border border-foreground/10 font-mono text-sm"
        style={{ background: css, color: textColor }}
      >
        {kind} gradient
      </div>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-medium">종류</p>
            <div className="flex gap-2">
              {KINDS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => changeKind(value)}
                  aria-pressed={kind === value}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    kind === value
                      ? "border-foreground bg-foreground text-background"
                      : "border-foreground/20 hover:border-foreground/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <label className={`block ${kind === "radial" ? "opacity-40" : ""}`}>
            <span className="mb-1 flex justify-between text-sm font-medium">
              각도
              <span className="font-mono text-foreground/60">{angle}°</span>
            </span>
            <input
              type="range"
              min={0}
              max={360}
              value={angle}
              disabled={kind === "radial"}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-foreground/15 accent-foreground"
            />
          </label>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">색 정지점</p>
            <button
              type="button"
              onClick={addStop}
              disabled={stops.length >= MAX_STOPS}
              className="rounded-lg border border-foreground/20 px-3 py-1 text-xs transition-colors hover:bg-foreground/5 disabled:opacity-40"
            >
              + 추가
            </button>
          </div>
          {stops.map((s) => (
            <div key={s.id} className="flex items-center gap-3">
              <input
                type="color"
                value={s.color}
                onChange={(e) => updateStop(s.id, { color: e.target.value.toUpperCase() })}
                className="h-8 w-10 shrink-0 cursor-pointer rounded border border-foreground/20 bg-transparent"
                aria-label="정지점 색상"
              />
              <input
                type="range"
                min={0}
                max={100}
                value={s.pos}
                onChange={(e) => updateStop(s.id, { pos: Number(e.target.value) })}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-foreground/15 accent-foreground"
                aria-label="정지점 위치"
              />
              <span className="w-10 shrink-0 text-right font-mono text-xs text-foreground/60">
                {s.pos}%
              </span>
              <button
                type="button"
                onClick={() => removeStop(s.id)}
                disabled={stops.length <= MIN_STOPS}
                className="shrink-0 text-foreground/50 hover:text-foreground disabled:opacity-30"
                aria-label="정지점 삭제"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium">CSS</p>
          <button
            type="button"
            onClick={copy}
            className="text-xs text-foreground/60 underline hover:text-foreground"
          >
            {copied ? "Copied!" : "복사"}
          </button>
        </div>
        <pre className="overflow-x-auto rounded-xl bg-foreground/5 p-4 font-mono text-xs leading-relaxed">
          {declaration}
        </pre>
      </div>
    </div>
  );
}

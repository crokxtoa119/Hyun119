"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { readableTextColor } from "@/lib/color";
import { prefersReducedMotion } from "@/lib/motion";
import { isGradientPreset, type GradientKind, type GradientPreset } from "@/lib/presetValidators";
import { usePresets } from "@/lib/usePresets";
import Chip from "@/components/ui/Chip";
import { SharedNotice } from "@/components/ui/Share";
import { ToolControls, ToolFooter, ToolPage } from "@/components/ui/ToolLayout";
import Slider, { RangeInput } from "@/components/ui/Slider";

gsap.registerPlugin(useGSAP);

type Kind = GradientKind;
type Stop = { id: number; color: string; pos: number };

const KINDS: { value: Kind; label: string }[] = [
  { value: "linear", label: "선형" },
  { value: "radial", label: "원형" },
  { value: "conic", label: "원뿔" },
];

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

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

  const css = buildCss(kind, angle, stops);
  const declaration = `background: ${css};`;
  const textColor = readableTextColor(stops[0].color);

  const { contextSafe } = useGSAP({ scope: root });
  const pulsePreview = contextSafe(() => {
    if (prefersReducedMotion()) return;
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

  const { presets, save, remove, isFull } = usePresets("sc-gradient-presets", isGradientPreset);

  const loadPreset = (p: GradientPreset) => {
    setKind(p.kind);
    setAngle(clamp(p.angle, 0, 360));
    // 정지점마다 새 id를 부여해 React key가 겹치지 않게 한다
    setStops(
      p.stops.map((s) => ({
        id: nextId.current++,
        color: s.color.toUpperCase(),
        pos: clamp(s.pos, 0, 100),
      })),
    );
    pulsePreview();
  };

  return (
    <ToolPage
      rootRef={root}
      title="Gradient Editor"
      description="색 정지점과 각도를 조절해 CSS 그라디언트를 만들고 코드를 복사하세요."
    >
      <SharedNotice validate={isGradientPreset} onApply={loadPreset} />

      <div
        className="preview mt-8 flex h-64 items-center justify-center rounded-2xl border border-foreground/10 font-mono text-sm"
        style={{ background: css, color: textColor }}
      >
        {kind} gradient
      </div>

      <ToolControls>
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-medium">종류</p>
            <div className="flex gap-2">
              {KINDS.map(({ value, label }) => (
                <Chip
                  key={value}
                  active={kind === value}
                  onClick={() => changeKind(value)}
                >
                  {label}
                </Chip>
              ))}
            </div>
          </div>

          <Slider
            label="각도"
            value={angle}
            max={360}
            display={`${angle}°`}
            disabled={kind === "radial"}
            onChange={setAngle}
          />
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
              <RangeInput
                value={s.pos}
                max={100}
                onChange={(pos) => updateStop(s.id, { pos })}
                aria-label="정지점 위치"
              />
              <span className="w-10 shrink-0 text-right font-mono text-xs text-foreground/60">
                {s.pos}%
              </span>
              <button
                type="button"
                onClick={() => removeStop(s.id)}
                disabled={stops.length <= MIN_STOPS}
                className="inline-flex size-6 shrink-0 items-center justify-center text-foreground/60 hover:text-foreground disabled:opacity-30"
                aria-label="정지점 삭제"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </ToolControls>

      <ToolFooter
        presets={presets}
        isFull={isFull}
        state={{
          kind,
          angle,
          stops: stops.map(({ color, pos }) => ({ color, pos })),
        }}
        onSave={save}
        onLoad={loadPreset}
        onRemove={remove}
        code={{
          title: "CSS",
          code: declaration,
          file: { name: "gradient", ext: "css" },
        }}
      />
    </ToolPage>
  );
}

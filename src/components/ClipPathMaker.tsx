"use client";

import { useRef, useState } from "react";
import {
  CLIP_SHAPES,
  DEFAULT_CLIP,
  MAX_POINTS,
  MIN_POINTS,
  addPointAfter,
  clampClip,
  clipToCss,
  clipValue,
  isClipState,
  movePoint,
  removePoint,
  type ClipState,
} from "@/lib/clipPath";
import { usePresets } from "@/lib/usePresets";
import Chip from "@/components/ui/Chip";
import { SharedNotice } from "@/components/ui/Share";
import { ToolControls, ToolFooter, ToolPage } from "@/components/ui/ToolLayout";
import Slider from "@/components/ui/Slider";

const actionButton =
  "rounded-lg border border-foreground/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";

export default function ClipPathMaker() {
  const [state, setState] = useState<ClipState>(DEFAULT_CLIP);
  const [selected, setSelected] = useState(0);
  const box = useRef<HTMLDivElement>(null);

  const { presets, save, remove, isFull } = usePresets("sc-clip-path-presets", isClipState);

  const points = state.points;
  // 불러온 값 등으로 점이 줄었을 때를 대비해 선택 번호를 범위 안으로 맞춘다
  const sel = Math.min(selected, points.length - 1);
  const current = points[sel];

  const load = (s: ClipState) => {
    setState(clampClip(s));
    setSelected(0);
  };

  const move = (i: number, x: number, y: number) =>
    setState((s) => ({ points: movePoint(s.points, i, x, y) }));

  const dragTo = (i: number, clientX: number, clientY: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r || r.width === 0 || r.height === 0) return;
    move(i, ((clientX - r.left) / r.width) * 100, ((clientY - r.top) / r.height) * 100);
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 1;
    const d =
      e.key === "ArrowLeft" ? [-step, 0]
      : e.key === "ArrowRight" ? [step, 0]
      : e.key === "ArrowUp" ? [0, -step]
      : e.key === "ArrowDown" ? [0, step]
      : null;
    if (!d) return;
    e.preventDefault();
    move(i, points[i].x + d[0], points[i].y + d[1]);
  };

  const add = () => {
    const r = addPointAfter(points, sel);
    setState({ points: r.points });
    setSelected(r.index);
  };

  const del = () => {
    const r = removePoint(points, sel);
    setState({ points: r.points });
    setSelected(r.index);
  };

  return (
    <ToolPage
      title="Clip Path"
      description="꼭짓점을 끌어 옮기거나, 점을 고른 뒤 방향키로 움직여 polygon 모양을 만듭니다. 만든 CSS를 복사하세요."
    >
      <SharedNotice validate={isClipState} onApply={load} />

      <div className="mt-8 rounded-2xl border border-foreground/10 bg-foreground/5 p-8">
        <div ref={box} className="relative mx-auto aspect-square w-full max-w-sm">
          {/* 점선은 자르기 전 상자의 크기 */}
          <div aria-hidden className="absolute inset-0 border border-dashed border-foreground/30" />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(135deg,#f97316,#ec4899_45%,#6366f1)]"
            style={{ clipPath: clipValue(points) }}
          />
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 size-full overflow-visible text-foreground/60"
          >
            <polygon
              points={points.map((q) => `${q.x},${q.y}`).join(" ")}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {points.map((q, i) => (
            <button
              key={i}
              type="button"
              aria-pressed={sel === i}
              aria-label={`꼭짓점 ${i + 1}, 가로 ${q.x}%, 세로 ${q.y}%`}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setSelected(i);
              }}
              onPointerMove={(e) => {
                if (e.currentTarget.hasPointerCapture(e.pointerId)) dragTo(i, e.clientX, e.clientY);
              }}
              onKeyDown={(e) => onKeyDown(i, e)}
              style={{ left: `${q.x}%`, top: `${q.y}%` }}
              className={`absolute flex size-7 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none items-center justify-center rounded-full border-2 border-accent font-mono text-xs active:cursor-grabbing ${
                sel === i ? "bg-accent text-on-accent" : "bg-background text-foreground"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <p className="mt-10 text-center text-xs text-foreground/60">
          점을 끌어 옮기거나, 선택한 뒤 방향키(Shift를 누르면 10씩)로 움직입니다.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {CLIP_SHAPES.map((s) => (
          <Chip key={s.id} active={false} onClick={() => load({ points: s.points })}>
            {s.label}
          </Chip>
        ))}
      </div>

      <ToolControls>
        <Slider
          label={`꼭짓점 ${sel + 1} 가로`}
          value={current.x}
          max={100}
          display={`${current.x}%`}
          onChange={(n) => move(sel, n, current.y)}
        />
        <Slider
          label={`꼭짓점 ${sel + 1} 세로`}
          value={current.y}
          max={100}
          display={`${current.y}%`}
          onChange={(n) => move(sel, current.x, n)}
        />
      </ToolControls>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={add} disabled={points.length >= MAX_POINTS} className={actionButton}>
          점 추가
        </button>
        <button type="button" onClick={del} disabled={points.length <= MIN_POINTS} className={actionButton}>
          점 삭제
        </button>
        <span className="font-mono text-xs text-foreground/60">
          {points.length}개 ({MIN_POINTS}~{MAX_POINTS})
        </span>
      </div>

      <ToolFooter
        presets={presets}
        isFull={isFull}
        state={state}
        onSave={save}
        onLoad={load}
        onRemove={remove}
        code={{
          title: "CSS",
          code: clipToCss(state),
          file: { name: "clip-path", ext: "css" },
        }}
      />
    </ToolPage>
  );
}

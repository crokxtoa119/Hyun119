"use client";

import { useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/lib/motion";
import { isEasingPreset, type EasingDirection, type EasingPreset } from "@/lib/presetValidators";
import { usePresets } from "@/lib/usePresets";
import Chip from "@/components/ui/Chip";
import { SharedNotice } from "@/components/ui/Share";
import { ToolFooter, ToolPage } from "@/components/ui/ToolLayout";
import Slider from "@/components/ui/Slider";

gsap.registerPlugin(useGSAP);

type Family = { name: string; key: string };
type Direction = EasingDirection;

const FAMILIES: Family[] = [
  { name: "Power1", key: "power1" },
  { name: "Power2", key: "power2" },
  { name: "Power3", key: "power3" },
  { name: "Power4", key: "power4" },
  { name: "Sine", key: "sine" },
  { name: "Expo", key: "expo" },
  { name: "Circ", key: "circ" },
  { name: "Back", key: "back" },
  { name: "Elastic", key: "elastic" },
  { name: "Bounce", key: "bounce" },
];

const DIRECTIONS: Direction[] = ["in", "out", "inOut"];

const SAMPLES = 120;
// 오버슈트(back, elastic)가 잘리지 않도록 viewBox 위아래에 여유를 둔다
const VIEW_TOP = -40;
const VIEW_HEIGHT = 180;

function curvePath(ease: string): string {
  const fn = gsap.parseEase(ease);
  const pts: string[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    pts.push(`${(t * 100).toFixed(2)},${(100 - fn(t) * 100).toFixed(2)}`);
  }
  return `M${pts.join(" L")}`;
}

export default function EasingVisualizer() {
  const root = useRef<HTMLDivElement>(null);
  const [family, setFamily] = useState("power2");
  const [direction, setDirection] = useState<Direction>("out");
  const [duration, setDuration] = useState(1.2);

  const ease = `${family}.${direction}`;
  const path = useMemo(() => curvePath(ease), [ease]);

  const { presets, save, remove, isFull } = usePresets("sc-easing-presets", isEasingPreset);

  const loadPreset = (p: EasingPreset) => {
    setFamily(p.family);
    setDirection(p.direction);
    setDuration(Math.min(3, Math.max(0.3, p.duration)));
  };

  // 자동으로 계속 움직이는 요소는 멈출 수 있어야 한다. "움직임 줄이기"를 켠 경우 기본은 정지.
  const reducedMotion = useReducedMotion();
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const paused = userPaused ?? reducedMotion;

  useGSAP(
    () => {
      const track = root.current?.querySelector<HTMLElement>(".track");
      const ball = root.current?.querySelector<HTMLElement>(".ball");
      if (!track || !ball) return;
      const tween = gsap.fromTo(
        ball,
        { x: 0 },
        {
          x: () => track.clientWidth - ball.clientWidth - 16,
          ease,
          duration,
          repeat: -1,
          repeatDelay: 0.6,
          // 한 방향 재생 후 잠깐 멈추고 처음부터 다시
          repeatRefresh: true,
        },
      );
      if (paused) tween.pause(0);
    },
    { scope: root, dependencies: [ease, duration, paused], revertOnUpdate: true },
  );

  const snippet = `gsap.to(".box", { x: 300, duration: ${duration}, ease: "${ease}" });`;

  return (
    <ToolPage
      rootRef={root}
      title="Easing Visualizer"
      description="GSAP 이징을 고르면 곡선과 실제 움직임을 함께 볼 수 있습니다."
    >
      <SharedNotice validate={isEasingPreset} onApply={loadPreset} />

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_1.4fr]">
        <div className="rounded-2xl border border-foreground/10 p-4">
          <svg
            viewBox={`-6 ${VIEW_TOP} 112 ${VIEW_HEIGHT}`}
            className="mx-auto h-auto max-h-56 w-full md:max-h-none"
            role="img"
            aria-label={`${ease} 곡선`}
          >
            <line x1="0" y1="0" x2="100" y2="0" stroke="currentColor" strokeOpacity="0.15" strokeDasharray="2 2" />
            <line x1="0" y1="100" x2="100" y2="100" stroke="currentColor" strokeOpacity="0.15" strokeDasharray="2 2" />
            <path
              d={path}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <p className="mt-2 text-center font-mono text-xs text-foreground/60">{ease}</p>
        </div>

        <div className="flex flex-col justify-center gap-6">
          <div className="track relative h-14 rounded-full bg-foreground/5">
            <div className="ball absolute left-2 top-1/2 size-10 -translate-y-1/2 rounded-full bg-accent" />
          </div>

          <div>
            <button
              type="button"
              onClick={() => setUserPaused(!paused)}
              className="rounded-lg border border-foreground/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/5"
            >
              {paused ? "▶ 재생" : "⏸ 일시정지"}
            </button>
          </div>

          <Slider
            label="Duration"
            value={duration}
            min={0.3}
            max={3}
            step={0.1}
            display={`${duration.toFixed(1)}s`}
            onChange={setDuration}
          />
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium">이징 종류</p>
          <div className="flex flex-wrap gap-2">
            {FAMILIES.map(({ name, key }) => (
              <Chip key={key} active={family === key} onClick={() => setFamily(key)}>
                {name}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">방향</p>
          <div className="flex gap-2">
            {DIRECTIONS.map((d) => (
              <Chip key={d} active={direction === d} onClick={() => setDirection(d)}>
                {d}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <ToolFooter
        presets={presets}
        isFull={isFull}
        state={{ family, direction, duration }}
        onSave={save}
        onLoad={loadPreset}
        onRemove={remove}
        code={{
          title: "GSAP 코드",
          code: snippet,
          file: { name: "easing", ext: "js" },
        }}
      />
    </ToolPage>
  );
}

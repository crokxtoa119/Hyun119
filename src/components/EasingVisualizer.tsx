"use client";

import { useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

type Family = { name: string; key: string };
type Direction = "in" | "out" | "inOut";

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
  const [copied, setCopied] = useState(false);

  const ease = `${family}.${direction}`;
  const path = useMemo(() => curvePath(ease), [ease]);

  useGSAP(
    () => {
      const track = root.current?.querySelector<HTMLElement>(".track");
      const ball = root.current?.querySelector<HTMLElement>(".ball");
      if (!track || !ball) return;
      gsap.fromTo(
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
    },
    { scope: root, dependencies: [ease, duration], revertOnUpdate: true },
  );

  const snippet = `gsap.to(".box", { x: 300, duration: ${duration}, ease: "${ease}" });`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // 클립보드 권한이 없는 환경에서는 조용히 무시
    }
  };

  return (
    <div ref={root} className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Easing Visualizer</h1>
      <p className="mt-2 text-foreground/70">
        GSAP 이징을 고르면 곡선과 실제 움직임을 함께 볼 수 있습니다.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_1.4fr]">
        <div className="rounded-2xl border border-foreground/10 p-4">
          <svg
            viewBox={`-6 ${VIEW_TOP} 112 ${VIEW_HEIGHT}`}
            className="w-full"
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
            <div className="ball absolute left-2 top-1/2 size-10 -translate-y-1/2 rounded-full bg-foreground" />
          </div>

          <label className="block">
            <span className="mb-1 flex justify-between text-sm font-medium">
              Duration
              <span className="font-mono text-foreground/60">{duration.toFixed(1)}s</span>
            </span>
            <input
              type="range"
              min={0.3}
              max={3}
              step={0.1}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-foreground/15 accent-foreground"
            />
          </label>
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

      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium">GSAP 코드</p>
          <button
            type="button"
            onClick={copy}
            className="text-xs text-foreground/60 underline hover:text-foreground"
          >
            {copied ? "Copied!" : "복사"}
          </button>
        </div>
        <pre className="overflow-x-auto rounded-xl bg-foreground/5 p-4 font-mono text-xs leading-relaxed">
          {snippet}
        </pre>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-foreground/20 hover:border-foreground/50"
      }`}
    >
      {children}
    </button>
  );
}

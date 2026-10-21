"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import {
  DEFAULT_RADIUS,
  clampRadius,
  linkVertical,
  radiusToCss,
  randomBlob,
  type Radius,
} from "@/lib/radius";
import { isRadiusPreset, type RadiusPreset } from "@/lib/presetValidators";
import { usePresets } from "@/lib/usePresets";
import Chip from "@/components/ui/Chip";
import CodeBlock from "@/components/ui/CodeBlock";
import PresetBar from "@/components/ui/PresetBar";
import { ShareButton, SharedNotice } from "@/components/ui/Share";
import Slider from "@/components/ui/Slider";

const CORNERS: { key: "tl" | "tr" | "br" | "bl"; label: string }[] = [
  { key: "tl", label: "왼쪽 위" },
  { key: "tr", label: "오른쪽 위" },
  { key: "br", label: "오른쪽 아래" },
  { key: "bl", label: "왼쪽 아래" },
];

const MORPH_MS = 500;

export default function RadiusGenerator() {
  const [radius, setRadius] = useState<Radius>(DEFAULT_RADIUS);
  const [linked, setLinked] = useState(false);
  // 랜덤/불러오기처럼 값이 한 번에 바뀔 때만 모양이 부드럽게 변하게 한다(슬라이더를 끌 때는 즉시 반영)
  const [morphing, setMorphing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const morph = () => {
    if (prefersReducedMotion()) return;
    clearTimeout(timer.current);
    setMorphing(true);
    timer.current = setTimeout(() => setMorphing(false), MORPH_MS + 50);
  };

  const apply = (next: Radius, nextLinked = linked) => {
    morph();
    setRadius(nextLinked ? linkVertical(clampRadius(next)) : clampRadius(next));
  };

  const setValue = (key: keyof Radius, value: number) => {
    setRadius((r) => {
      const next = { ...r, [key]: value };
      return linked ? linkVertical(next) : next;
    });
  };

  const toggleLinked = () => {
    const next = !linked;
    setLinked(next);
    if (next) setRadius((r) => linkVertical(r));
  };

  const { presets, save, remove, isFull } = usePresets("sc-radius-presets", isRadiusPreset);

  const loadPreset = (p: RadiusPreset) => {
    setLinked(p.linked);
    apply(p, p.linked);
  };

  const css = radiusToCss(radius);
  const radiusValue = css.replace("border-radius: ", "").replace(";", "");

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Border Radius</h1>
      <p className="mt-2 text-foreground/70">
        모서리 여덟 값을 조절해 둥근 모서리부터 덩어리 모양까지 만들고 CSS를 복사하세요.
      </p>

      <SharedNotice validate={isRadiusPreset} onApply={loadPreset} />

      <div className="mt-8 flex items-center justify-center rounded-2xl border border-foreground/10 bg-foreground/5 py-10">
        <div
          aria-hidden
          className="size-56 bg-accent sm:size-64"
          style={{
            borderRadius: radiusValue,
            transition: morphing ? `border-radius ${MORPH_MS}ms ease-in-out` : "none",
          }}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Chip active={false} onClick={() => apply(randomBlob())}>
          랜덤 덩어리
        </Chip>
        <Chip active={false} onClick={() => apply(DEFAULT_RADIUS)}>
          초기화
        </Chip>
        <Chip active={linked} onClick={toggleLinked}>
          가로·세로 같게
        </Chip>
      </div>

      <div className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {CORNERS.map(({ key, label }) => {
          const h = `${key}H` as keyof Radius;
          const v = `${key}V` as keyof Radius;
          return (
            <fieldset key={key} className="space-y-4">
              <legend className="mb-2 text-sm font-semibold">{label}</legend>
              <Slider
                label="가로"
                value={radius[h]}
                max={100}
                display={`${radius[h]}%`}
                onChange={(n) => setValue(h, n)}
              />
              <Slider
                label="세로"
                value={radius[v]}
                max={100}
                display={`${radius[v]}%`}
                disabled={linked}
                onChange={(n) => setValue(v, n)}
              />
            </fieldset>
          );
        })}
      </div>

      <div className="mt-8">
        <PresetBar
          presets={presets}
          isFull={isFull}
          onSave={(name) => save(name, { ...radius, linked })}
          onLoad={loadPreset}
          onRemove={remove}
        />
        <div className="mt-4">
          <ShareButton current={{ ...radius, linked }} />
        </div>
      </div>

      <div className="mt-8">
        <CodeBlock title="CSS" code={css} file={{ name: "radius", ext: "css" }} />
      </div>
    </div>
  );
}

"use client";

import { useId, useState } from "react";
import {
  isGradientPreset,
  isPalettePreset,
  isRadiusPreset,
  isShadowPreset,
  isTypographyPreset,
} from "@/lib/presetValidators";
import {
  EMPTY_KIT,
  ROLE_KEYS,
  clampKit,
  defaultRoles,
  isStyleKit,
  kitColors,
  kitToCss,
  sameValue,
  toKitRadius,
  toKitShadow,
  toKitTypography,
  type RoleKey,
  type StyleKit,
} from "@/lib/styleKit";
import { isTypeScaleState } from "@/lib/typeScale";
import { usePresets, type Preset } from "@/lib/usePresets";
import Chip from "@/components/ui/Chip";
import { SharedNotice } from "@/components/ui/Share";
import { ToolControls, ToolFooter, ToolPage } from "@/components/ui/ToolLayout";
import { TransitionLink } from "@/components/PageTransition";
import StyleKitPreview from "@/components/StyleKitPreview";

const ROLE_LABEL: Record<RoleKey, string> = {
  primary: "주색 (primary)",
  secondary: "보조색 (secondary)",
  accent: "강조색 (accent)",
};

const LOADED = "__loaded";

type PickerProps<T, K> = {
  label: string;
  /** 이 도구의 프리셋을 만드는 페이지. */
  href: string;
  toolName: string;
  hint?: string;
  presets: Preset<T>[];
  /** 프리셋 데이터를 키트에 담는 값으로 바꾼다. null이면 키트에 담을 수 없는 프리셋이다. */
  convert: (data: T) => K | null;
  current: K | null;
  onPick: (value: K | null) => void;
};

/** 도구에서 저장한 프리셋 중 하나를 골라 키트에 담는 선택 상자. 고르지 않으면 기본값을 쓴다. */
function PresetPicker<T, K>({ label, href, toolName, hint, presets, convert, current, onPick }: PickerProps<T, K>) {
  const id = useId();
  const usable = presets.filter((p) => convert(p.data) !== null);
  const matched = usable.find((p) => sameValue(convert(p.data), current));
  // 키트에 담긴 값이 지금 저장된 프리셋과 같지 않으면(공유받았거나 프리셋을 지운 경우) 따로 표시한다
  const value = current === null ? "" : matched ? matched.id : LOADED;

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "") return onPick(null);
          const p = usable.find((x) => x.id === v);
          if (p) onPick(convert(p.data));
        }}
        className="min-h-10 w-full rounded-lg border border-foreground/20 bg-background px-3 text-sm"
      >
        <option value="">기본값</option>
        {value === LOADED && <option value={LOADED}>불러온 값</option>}
        {usable.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-foreground/60">
        {usable.length === 0 ? (
          <>
            저장한 프리셋이 없습니다.{" "}
            <TransitionLink href={href} className="underline hover:text-foreground">
              {toolName}에서 만들기
            </TransitionLink>
          </>
        ) : (
          hint
        )}
      </p>
    </div>
  );
}

export default function StyleKitMaker() {
  const [kit, setKit] = useState<StyleKit>(EMPTY_KIT);
  const [dark, setDark] = useState(false);

  const set = (patch: Partial<StyleKit>) => setKit((k) => clampKit({ ...k, ...patch }));

  // 키트 자체를 저장하는 프리셋(설정의 백업과 삭제에도 포함된다)과, 값을 가져올 각 도구의 프리셋
  const { presets, save, remove, isFull } = usePresets("sc-style-kit-presets", isStyleKit);
  const palettes = usePresets("sc-palette-presets", isPalettePreset).presets;
  const gradients = usePresets("sc-gradient-presets", isGradientPreset).presets;
  const scales = usePresets("sc-type-scale-presets", isTypeScaleState).presets;
  const typographies = usePresets("sc-typography-presets", isTypographyPreset).presets;
  const radii = usePresets("sc-radius-presets", isRadiusPreset).presets;
  const shadows = usePresets("sc-shadow-presets", isShadowPreset).presets;

  const load = (k: StyleKit) => setKit(clampKit(k));
  const colors = kitColors(kit);

  return (
    <ToolPage
      title="Style Kit"
      description="도구에서 저장한 프리셋을 한 벌로 묶어 샘플 화면에 적용해 보고, CSS 변수 파일로 복사하세요."
    >
      <SharedNotice validate={isStyleKit} onApply={load} />

      <StyleKitPreview kit={kit} dark={dark} />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Chip active={dark} onClick={() => setDark((v) => !v)}>
          어두운 배경으로 보기
        </Chip>
        <Chip active={false} onClick={() => setKit(EMPTY_KIT)}>
          초기화
        </Chip>
      </div>

      <h2 className="mt-10 text-lg font-semibold tracking-tight">구성</h2>
      <p className="mt-1 text-sm text-foreground/70">
        각 도구에서 프리셋을 저장해 두면 여기서 고를 수 있습니다. 고르지 않은 항목은 기본값으로 채워집니다.
      </p>
      <ToolControls>
        <PresetPicker
          label="색: Color Palette"
          href="/palette"
          toolName="Color Palette"
          presets={palettes}
          convert={(d) => d}
          current={kit.palette}
          onPick={(v) => set({ palette: v, roles: defaultRoles(v?.harmony ?? "analogous") })}
        />
        <PresetPicker
          label="그라디언트: Gradient Editor"
          href="/gradient"
          toolName="Gradient Editor"
          hint="고르지 않으면 주색에서 강조색으로 가는 그라디언트를 씁니다."
          presets={gradients}
          convert={(d) => d}
          current={kit.gradient}
          onPick={(v) => set({ gradient: v })}
        />
        <PresetPicker
          label="글자 크기: Type Scale"
          href="/type-scale"
          toolName="Type Scale"
          presets={scales}
          convert={(d) => d}
          current={kit.typeScale}
          onPick={(v) => set({ typeScale: v })}
        />
        <PresetPicker
          label="글꼴: Typography"
          href="/typography"
          toolName="Typography Playground"
          hint="폰트는 모든 글자에, 굵기·자간·행간은 제목에 적용합니다."
          presets={typographies}
          convert={toKitTypography}
          current={kit.typography}
          onPick={(v) => set({ typography: v })}
        />
        <PresetPicker
          label="모서리: Border Radius"
          href="/radius"
          toolName="Border Radius"
          hint="퍼센트(%) 값이라 요소의 크기에 따라 모양이 달라집니다."
          presets={radii}
          convert={toKitRadius}
          current={kit.radius}
          onPick={(v) => set({ radius: v })}
        />
        <PresetPicker
          label="그림자: Shadow & Glass"
          href="/shadow"
          toolName="Shadow & Glass"
          hint="그림자(shadow) 모드로 저장한 프리셋만 고를 수 있습니다."
          presets={shadows}
          convert={toKitShadow}
          current={kit.shadow}
          onPick={(v) => set({ shadow: v })}
        />
      </ToolControls>

      <h2 className="mt-10 text-lg font-semibold tracking-tight">색의 역할</h2>
      <p className="mt-1 text-sm text-foreground/70">
        팔레트 다섯 색 중 어느 색을 주색, 보조색, 강조색으로 쓸지 고릅니다. 팔레트를 바꾸면 배색 규칙에 맞는 기본
        지정으로 다시 시작합니다.
      </p>
      <div className="mt-4 space-y-4">
        {ROLE_KEYS.map((role) => (
          <fieldset key={role} className="flex flex-wrap items-center gap-3">
            <legend className="sr-only">{ROLE_LABEL[role]}</legend>
            <span aria-hidden className="w-36 text-sm font-medium">
              {ROLE_LABEL[role]}
            </span>
            <div className="flex gap-2">
              {colors.map((hex, i) => (
                <button
                  key={i}
                  type="button"
                  aria-pressed={kit.roles[role] === i}
                  aria-label={`${ROLE_LABEL[role]}을 색 ${i + 1} ${hex}로`}
                  onClick={() => set({ roles: { ...kit.roles, [role]: i } })}
                  className="size-9 rounded-full border border-foreground/20 transition-shadow aria-pressed:ring-2 aria-pressed:ring-foreground aria-pressed:ring-offset-2 aria-pressed:ring-offset-background"
                  style={{ background: hex }}
                />
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      <ToolFooter
        presets={presets}
        isFull={isFull}
        state={kit}
        onSave={save}
        onLoad={load}
        onRemove={remove}
        code={{
          title: "CSS 변수 (tokens)",
          code: kitToCss(kit),
          copyLabel: "전체 복사",
          file: { name: "style-kit", ext: "css" },
        }}
        note="이 파일을 :root에 두고 var(--color-primary), var(--step-2), var(--radius)처럼 쓰면 됩니다. 색 위에 올리는 글자색(--color-on-*)은 대비가 높은 흑 또는 백을 자동으로 고릅니다. 제목에는 font-weight: var(--heading-weight) 같은 --heading-* 변수를 쓰세요."
      />
    </ToolPage>
  );
}

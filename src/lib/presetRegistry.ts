import {
  isEasingPreset,
  isGradientPreset,
  isPalettePreset,
  isRadiusPreset,
  isShadowPreset,
  isTypographyPreset,
} from "./presetValidators";
import { isBlendState } from "./blend";
import { isClipState } from "./clipPath";
import { isConvState } from "./colorConvert";
import { isContrastState } from "./contrast";
import { isFilterState } from "./filter";
import { isFlexState } from "./flex";
import { isFluidState } from "./fluidType";
import { isGrainState } from "./grain";
import { isGridState } from "./grid";
import { isKeyframesState } from "./keyframes";
import { isLinearEasingState } from "./linearEasing";
import { isScrollSnapState } from "./scrollSnap";
import { isScrollTriggerState } from "./scrollTrigger";
import { isShapeState } from "./svgShape";
import { isTextEffectState } from "./textEffect";
import { isTimeline } from "./timeline";
import { isTransformState } from "./transform";
import { isTypeScaleState } from "./typeScale";

export type PresetTool = {
  /** 실험 슬러그와 같다 */
  slug: string;
  label: string;
  /** localStorage 키. 항상 `sc-<slug>-presets` */
  key: string;
  validate: (d: unknown) => boolean;
};

const tool = (slug: string, label: string, validate: (d: unknown) => boolean): PresetTool => ({
  slug,
  label,
  key: `sc-${slug}-presets`,
  validate,
});

/**
 * 프리셋을 저장하는 도구 목록. 설정 모달의 개수 표시와 삭제, 내보내기·가져오기가 모두 이 목록을 쓴다.
 * 새 도구를 추가하면 여기에도 넣어야 하고, 빠뜨리면 테스트가 실패한다.
 */
export const PRESET_TOOLS: PresetTool[] = [
  tool("palette", "Palette", isPalettePreset),
  tool("gradient", "Gradient", isGradientPreset),
  tool("contrast", "Contrast", isContrastState),
  tool("filter", "Filter", isFilterState),
  tool("blend", "Blend Mode", isBlendState),
  tool("shadow", "Shadow", isShadowPreset),
  tool("radius", "Radius", isRadiusPreset),
  tool("flexbox", "Flexbox", isFlexState),
  tool("grid", "Grid", isGridState),
  tool("scroll-snap", "Scroll Snap", isScrollSnapState),
  tool("typography", "Typography", isTypographyPreset),
  tool("text-effects", "Text Effects", isTextEffectState),
  tool("easing", "Easing", isEasingPreset),
  tool("timeline", "Timeline", isTimeline),
  tool("keyframes", "Keyframes", isKeyframesState),
  tool("transform", "Transform", isTransformState),
  tool("clip-path", "Clip Path", isClipState),
  tool("fluid-type", "Fluid Type", isFluidState),
  tool("color-converter", "Color Converter", isConvState),
  tool("scroll-trigger", "Scroll Trigger", isScrollTriggerState),
  tool("svg-shape", "Wave & Blob", isShapeState),
  tool("linear-easing", "Linear Easing", isLinearEasingState),
  tool("type-scale", "Type Scale", isTypeScaleState),
  tool("grain", "Grain", isGrainState),
];

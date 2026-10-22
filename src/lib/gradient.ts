import type { GradientKind } from "./presetValidators";

export type GradientStop = { color: string; pos: number };

/** 정지점을 위치 순서로 늘어놓은 그라디언트 값. 선형·원뿔은 각도를 쓰고 원형은 쓰지 않는다. */
export function gradientCss(kind: GradientKind, angle: number, stops: GradientStop[]): string {
  const list = [...stops]
    .sort((a, b) => a.pos - b.pos)
    .map((s) => `${s.color} ${s.pos}%`)
    .join(", ");
  if (kind === "radial") return `radial-gradient(circle, ${list})`;
  if (kind === "conic") return `conic-gradient(from ${angle}deg, ${list})`;
  return `linear-gradient(${angle}deg, ${list})`;
}

import { hexToRgba } from "./color";

export type BoxShadow = {
  x: number;
  y: number;
  blur: number;
  spread: number;
  shadowColor: string;
  shadowAlpha: number;
  inset: boolean;
};

/** box-shadow 값. 색은 #RRGGBB와 투명도를 rgba()로 합쳐 쓴다. */
export function boxShadowValue(s: BoxShadow): string {
  return `${s.inset ? "inset " : ""}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${hexToRgba(s.shadowColor, s.shadowAlpha)}`;
}

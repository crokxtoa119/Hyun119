import type { Metadata } from "next";
import ColorConverter from "@/components/ColorConverter";

export const metadata: Metadata = {
  title: "Color Converter · SketchCraft",
  description: "HEX, RGB, HSL, OKLCH 표기를 서로 바꾸고 CSS를 복사합니다.",
};

export default function ColorConverterPage() {
  return <ColorConverter />;
}

import type { Metadata } from "next";
import SvgShapeMaker from "@/components/SvgShapeMaker";

export const metadata: Metadata = {
  title: "Wave & Blob · SketchCraft",
  description: "웨이브와 블롭 모양을 만들고 SVG 코드를 복사합니다.",
};

export default function SvgShapePage() {
  return <SvgShapeMaker />;
}

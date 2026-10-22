import type { Metadata } from "next";
import GrainMaker from "@/components/GrainMaker";

export const metadata: Metadata = {
  title: "Grain · SketchCraft",
  description: "SVG 노이즈로 종이나 필름 같은 질감을 만들고 CSS를 복사합니다.",
};

export default function GrainPage() {
  return <GrainMaker />;
}

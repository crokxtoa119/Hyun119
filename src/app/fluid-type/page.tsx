import type { Metadata } from "next";
import FluidTypePlayground from "@/components/FluidTypePlayground";

export const metadata: Metadata = {
  title: "Fluid Type · SketchCraft",
  description: "화면 너비에 따라 글자 크기가 부드럽게 변하는 clamp() 값을 계산하고 CSS를 복사합니다.",
};

export default function FluidTypePage() {
  return <FluidTypePlayground />;
}

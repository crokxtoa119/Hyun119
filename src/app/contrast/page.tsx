import type { Metadata } from "next";
import ContrastChecker from "@/components/ContrastChecker";

export const metadata: Metadata = {
  title: "Contrast Checker · SketchCraft",
  description: "글자색과 배경색의 명암비를 계산하고 WCAG AA·AAA 통과 여부를 확인합니다.",
};

export default function ContrastPage() {
  return <ContrastChecker />;
}

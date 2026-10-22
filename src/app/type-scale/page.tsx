import type { Metadata } from "next";
import TypeScaleMaker from "@/components/TypeScaleMaker";

export const metadata: Metadata = {
  title: "Type Scale · SketchCraft",
  description: "기준 크기와 비율로 일관된 글자 크기 단계를 만들고 CSS 변수로 복사합니다.",
};

export default function TypeScalePage() {
  return <TypeScaleMaker />;
}

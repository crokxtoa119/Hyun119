import type { Metadata } from "next";
import LinearEasingMaker from "@/components/LinearEasingMaker";

export const metadata: Metadata = {
  title: "Linear Easing · SketchCraft",
  description: "바운스와 스프링 같은 움직임을 CSS linear() 이징으로 만들고 코드를 복사합니다.",
};

export default function LinearEasingPage() {
  return <LinearEasingMaker />;
}

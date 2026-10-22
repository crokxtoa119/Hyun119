import type { Metadata } from "next";
import ScrollTriggerPlayground from "@/components/ScrollTriggerPlayground";

export const metadata: Metadata = {
  title: "Scroll Trigger · SketchCraft",
  description: "스크롤 위치에 맞춰 요소가 움직이는 GSAP ScrollTrigger 설정을 만들고 코드를 복사합니다.",
};

export default function ScrollTriggerPage() {
  return <ScrollTriggerPlayground />;
}

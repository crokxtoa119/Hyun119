import type { Metadata } from "next";
import ScrollSnapPlayground from "@/components/ScrollSnapPlayground";

export const metadata: Metadata = {
  title: "Scroll Snap · SketchCraft",
  description: "스크롤이 멈추는 지점을 정하는 scroll-snap 설정을 바꿔 보고 CSS를 복사합니다.",
};

export default function ScrollSnapPage() {
  return <ScrollSnapPlayground />;
}

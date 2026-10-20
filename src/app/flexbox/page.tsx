import type { Metadata } from "next";
import FlexPlayground from "@/components/FlexPlayground";

export const metadata: Metadata = {
  title: "Flexbox · SketchCraft",
  description: "방향, 줄바꿈, 정렬, 간격을 바꿔 보며 flexbox 동작을 익히고 CSS를 복사합니다.",
};

export default function FlexboxPage() {
  return <FlexPlayground />;
}

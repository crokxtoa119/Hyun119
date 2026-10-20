import type { Metadata } from "next";
import KeyframesEditor from "@/components/KeyframesEditor";

export const metadata: Metadata = {
  title: "Keyframes · SketchCraft",
  description: "세 개의 키프레임으로 CSS 애니메이션을 만들고 @keyframes 코드를 복사합니다.",
};

export default function KeyframesPage() {
  return <KeyframesEditor />;
}

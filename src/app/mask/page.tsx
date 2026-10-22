import type { Metadata } from "next";
import MaskMaker from "@/components/MaskMaker";

export const metadata: Metadata = {
  title: "Mask · SketchCraft",
  description: "그라디언트로 요소의 가장자리를 부드럽게 지우는 mask-image를 만들고 CSS를 복사합니다.",
};

export default function MaskPage() {
  return <MaskMaker />;
}

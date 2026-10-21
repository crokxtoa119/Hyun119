import type { Metadata } from "next";
import ClipPathMaker from "@/components/ClipPathMaker";

export const metadata: Metadata = {
  title: "Clip Path · SketchCraft",
  description: "꼭짓점을 끌어 clip-path polygon 모양을 만들고 CSS를 복사합니다.",
};

export default function ClipPathPage() {
  return <ClipPathMaker />;
}

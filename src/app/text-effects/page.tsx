import type { Metadata } from "next";
import TextEffectsPlayground from "@/components/TextEffectsPlayground";

export const metadata: Metadata = {
  title: "Text Effects · SketchCraft",
  description: "글자 그림자, 그라데이션 글자, 줄 수 제한을 만들고 CSS를 복사합니다.",
};

export default function TextEffectsPage() {
  return <TextEffectsPlayground />;
}

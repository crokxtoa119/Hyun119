import type { Metadata } from "next";
import BlendPlayground from "@/components/BlendPlayground";

export const metadata: Metadata = {
  title: "Blend Mode · SketchCraft",
  description: "두 색을 겹쳐 mix-blend-mode 16가지가 어떻게 섞이는지 보고 CSS를 복사합니다.",
};

export default function BlendPage() {
  return <BlendPlayground />;
}

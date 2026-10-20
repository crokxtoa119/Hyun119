import type { Metadata } from "next";
import TransformPlayground from "@/components/TransformPlayground";

export const metadata: Metadata = {
  title: "Transform · SketchCraft",
  description: "이동, 회전, 크기, 기울임, 3D 원근을 조절하고 transform CSS를 복사합니다.",
};

export default function TransformPage() {
  return <TransformPlayground />;
}

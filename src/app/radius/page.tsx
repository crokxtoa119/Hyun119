import type { Metadata } from "next";
import RadiusGenerator from "@/components/RadiusGenerator";

export const metadata: Metadata = {
  title: "Border Radius · SketchCraft",
  description: "모서리 여덟 값을 조절해 덩어리 모양을 만들고 CSS를 복사합니다.",
};

export default function RadiusPage() {
  return <RadiusGenerator />;
}

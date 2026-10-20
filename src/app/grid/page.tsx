import type { Metadata } from "next";
import GridPlayground from "@/components/GridPlayground";

export const metadata: Metadata = {
  title: "Grid · SketchCraft",
  description: "열, 간격, 정렬을 바꿔 보며 CSS Grid 동작을 익히고 CSS를 복사합니다.",
};

export default function GridPage() {
  return <GridPlayground />;
}

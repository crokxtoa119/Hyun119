import type { Metadata } from "next";
import FilterPlayground from "@/components/FilterPlayground";

export const metadata: Metadata = {
  title: "Filter · SketchCraft",
  description: "흐림, 밝기, 대비, 색조 같은 CSS filter 값을 조절하고 CSS를 복사합니다.",
};

export default function FilterPage() {
  return <FilterPlayground />;
}

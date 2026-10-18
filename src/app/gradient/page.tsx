import type { Metadata } from "next";
import GradientEditor from "@/components/GradientEditor";

export const metadata: Metadata = {
  title: "Gradient Editor · SketchCraft",
};

export default function GradientPage() {
  return <GradientEditor />;
}

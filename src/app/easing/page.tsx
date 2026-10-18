import type { Metadata } from "next";
import EasingVisualizer from "@/components/EasingVisualizer";

export const metadata: Metadata = {
  title: "Easing Visualizer · SketchCraft",
};

export default function EasingPage() {
  return <EasingVisualizer />;
}

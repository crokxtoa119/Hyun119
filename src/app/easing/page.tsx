import type { Metadata } from "next";
import EasingVisualizer from "@/components/EasingVisualizer";

export const metadata: Metadata = {
  title: "Easing Visualizer · Design Lab",
};

export default function EasingPage() {
  return <EasingVisualizer />;
}

import type { Metadata } from "next";
import PaletteGenerator from "@/components/PaletteGenerator";

export const metadata: Metadata = {
  title: "Color Palette · SketchCraft",
};

export default function PalettePage() {
  return <PaletteGenerator />;
}

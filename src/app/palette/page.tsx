import type { Metadata } from "next";
import PaletteGenerator from "@/components/PaletteGenerator";

export const metadata: Metadata = {
  title: "Color Palette · Design Lab",
};

export default function PalettePage() {
  return <PaletteGenerator />;
}

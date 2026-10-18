import type { Metadata } from "next";
import ShadowGenerator from "@/components/ShadowGenerator";

export const metadata: Metadata = {
  title: "Shadow & Glass · SketchCraft",
};

export default function ShadowPage() {
  return <ShadowGenerator />;
}

import type { Metadata } from "next";
import TypographyPlayground from "@/components/TypographyPlayground";
import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Typography Playground · SketchCraft",
};

export default function TypographyPage() {
  return (
    <div className={fontVariables}>
      <TypographyPlayground />
    </div>
  );
}

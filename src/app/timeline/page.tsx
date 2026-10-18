import type { Metadata } from "next";
import TimelineEditor from "@/components/TimelineEditor";

export const metadata: Metadata = {
  title: "Timeline Editor · SketchCraft",
};

export default function TimelinePage() {
  return <TimelineEditor />;
}

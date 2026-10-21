import type { Metadata } from "next";
import RecordBoard from "@/components/RecordBoard";

export const metadata: Metadata = {
  title: "Record · SketchCraft",
  description: "어떤 도구를 얼마나 써 봤는지 내 브라우저에만 남기는 기록판",
  // 방문자마다 다른 개인 화면이라 검색 결과에는 올리지 않는다
  robots: { index: false },
};

export default function RecordPage() {
  return <RecordBoard />;
}

import type { Metadata } from "next";
import StyleKitMaker from "@/components/StyleKitMaker";
import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Style Kit · SketchCraft",
  description: "도구에서 저장한 팔레트, 타입 스케일, 글꼴, 모서리, 그림자를 한 벌로 묶어 샘플 화면에 적용하고 CSS 변수로 복사합니다.",
};

export default function StyleKitPage() {
  // 샘플 화면이 Typography 도구와 같은 폰트를 쓰도록 폰트 변수를 붙인다
  return (
    <div className={fontVariables}>
      <StyleKitMaker />
    </div>
  );
}

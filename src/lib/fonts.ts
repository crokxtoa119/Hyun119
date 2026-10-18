import {
  Fraunces,
  Noto_Sans_KR,
  Noto_Serif_KR,
  Playfair_Display,
  Space_Grotesk,
} from "next/font/google";

// 타이포그래피 플레이그라운드용 가변 폰트. Geist 계열은 layout.tsx에서 이미 로드한다.
export const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

// 한글 폰트는 글리프 조각이 매우 많아 미리 로드하지 않고, 화면에 쓰인 글자만 필요할 때 받는다.
export const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  preload: false,
});

export const notoSerifKr = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  preload: false,
});

export const fontVariables = [
  playfair.variable,
  spaceGrotesk.variable,
  fraunces.variable,
  notoSansKr.variable,
  notoSerifKr.variable,
].join(" ");

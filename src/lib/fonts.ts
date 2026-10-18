import { Fraunces, Playfair_Display, Space_Grotesk } from "next/font/google";

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

export const fontVariables = [
  playfair.variable,
  spaceGrotesk.variable,
  fraunces.variable,
].join(" ");

/**
 * 타이포그래피 도구와 스타일 키트가 함께 쓰는 폰트 목록.
 * 키는 presetValidators의 TYPOGRAPHY_FONT_KEYS와 같아야 한다(테스트가 확인한다).
 */
export type FontOption = {
  key: string;
  label: string;
  /** 미리보기에 쓰는 실제 font-family 값 (next/font CSS 변수) */
  stack: string;
  /** 복사용 CSS에 넣는 font-family 값 */
  cssName: string;
  wMin: number;
  wMax: number;
};

export const FONTS: FontOption[] = [
  {
    key: "geist",
    label: "Geist",
    stack: "var(--font-geist-sans), sans-serif",
    cssName: '"Geist", sans-serif',
    wMin: 100,
    wMax: 900,
  },
  {
    key: "grotesk",
    label: "Space Grotesk",
    stack: "var(--font-space-grotesk), sans-serif",
    cssName: '"Space Grotesk", sans-serif',
    wMin: 300,
    wMax: 700,
  },
  {
    key: "playfair",
    label: "Playfair Display",
    stack: "var(--font-playfair), serif",
    cssName: '"Playfair Display", serif',
    wMin: 400,
    wMax: 900,
  },
  {
    key: "fraunces",
    label: "Fraunces",
    stack: "var(--font-fraunces), serif",
    cssName: '"Fraunces", serif',
    wMin: 100,
    wMax: 900,
  },
  {
    key: "notosans",
    label: "Noto Sans KR (한글)",
    stack: "var(--font-noto-sans-kr), sans-serif",
    cssName: '"Noto Sans KR", sans-serif',
    wMin: 100,
    wMax: 900,
  },
  {
    key: "notoserif",
    label: "Noto Serif KR (한글)",
    stack: "var(--font-noto-serif-kr), serif",
    cssName: '"Noto Serif KR", serif',
    wMin: 200,
    wMax: 900,
  },
  {
    key: "mono",
    label: "Geist Mono",
    stack: "var(--font-geist-mono), monospace",
    cssName: '"Geist Mono", monospace',
    wMin: 100,
    wMax: 900,
  },
];

/** 키에 맞는 폰트. 모르는 키는 첫 번째 폰트로 돌려 불러온 값이 깨져도 화면이 무너지지 않게 한다. */
export function fontByKey(key: string): FontOption {
  return FONTS.find((f) => f.key === key) ?? FONTS[0];
}

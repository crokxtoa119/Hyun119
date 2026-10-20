// 서버(layout)와 클라이언트가 함께 쓰므로 "use client"를 붙이지 않는다

export type AccentId = "default" | "indigo" | "teal" | "green" | "orange" | "pink" | "red";

export type AccentOption = {
  id: AccentId;
  label: string;
  /** 라이트 배경 위의 강조색과 그 위에 올리는 글자색 */
  light: { accent: string; on: string };
  /** 다크 배경 위의 강조색과 그 위에 올리는 글자색 */
  dark: { accent: string; on: string };
};

/**
 * 고를 수 있는 강조 컬러. default는 강조색 없이 글자색을 그대로 쓰는 기존 모습이라 CSS에 값이 없다.
 * 나머지 값은 globals.css의 [data-accent] 규칙과 같아야 하며, accent.test.ts가 일치와 명암비를 검사한다.
 */
export const ACCENTS: AccentOption[] = [
  { id: "default", label: "기본", light: { accent: "#171717", on: "#FFFFFF" }, dark: { accent: "#EDEDED", on: "#0A0A0A" } },
  { id: "indigo", label: "인디고", light: { accent: "#4F46E5", on: "#FFFFFF" }, dark: { accent: "#818CF8", on: "#0A0A0A" } },
  { id: "teal", label: "청록", light: { accent: "#0F766E", on: "#FFFFFF" }, dark: { accent: "#2DD4BF", on: "#0A0A0A" } },
  { id: "green", label: "초록", light: { accent: "#15803D", on: "#FFFFFF" }, dark: { accent: "#4ADE80", on: "#0A0A0A" } },
  { id: "orange", label: "주황", light: { accent: "#C2410C", on: "#FFFFFF" }, dark: { accent: "#FB923C", on: "#0A0A0A" } },
  { id: "pink", label: "분홍", light: { accent: "#BE185D", on: "#FFFFFF" }, dark: { accent: "#F472B6", on: "#0A0A0A" } },
  { id: "red", label: "빨강", light: { accent: "#B91C1C", on: "#FFFFFF" }, dark: { accent: "#F87171", on: "#0A0A0A" } },
];

export function isAccentId(v: unknown): v is AccentId {
  return typeof v === "string" && ACCENTS.some((a) => a.id === v);
}

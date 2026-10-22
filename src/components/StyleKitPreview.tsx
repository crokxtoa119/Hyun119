import type { CSSProperties } from "react";
import { kitStyleVars, nearestStep, type StyleKit } from "@/lib/styleKit";
import { stepName } from "@/lib/typeScale";

type Props = { kit: StyleKit; dark: boolean };

const SURFACE = {
  light: { bg: "#FFFFFF", text: "#171717", card: "#FFFFFF", line: "rgba(0, 0, 0, 0.12)", muted: "rgba(23, 23, 23, 0.7)" },
  dark: { bg: "#121212", text: "#EDEDED", card: "#1C1C1C", line: "rgba(255, 255, 255, 0.16)", muted: "rgba(237, 237, 237, 0.72)" },
} as const;

/**
 * 키트의 CSS 변수만으로 꾸민 샘플 화면. 색, 글꼴, 글자 크기, 모서리, 그림자, 그라디언트가 모두 var()로 연결되어 있어서
 * 내려받는 tokens.css를 쓰면 같은 모양이 나온다. 보기용 그림이라 실제 버튼이나 입력창은 쓰지 않는다.
 */
export default function StyleKitPreview({ kit, dark }: Props) {
  const c = dark ? SURFACE.dark : SURFACE.light;
  // 큰 단계는 상자를 넘치지 않게 위아래 한도를 둔다(좁은 화면에서는 화면 너비에도 맞춘다).
  // 키트의 단계 수가 짧아도 있는 단계만 가리킨다
  const step = (n: number, max: string) =>
    `clamp(0.75rem, var(${stepName(nearestStep(kit, n))}), min(${max}, 11vw))`;

  const root = {
    ...kitStyleVars(kit),
    background: c.bg,
    color: c.text,
    fontFamily: "var(--font-family)",
    fontWeight: 400,
    lineHeight: 1.5,
  } as CSSProperties;

  // 굵기·자간·행간은 제목에만 쓴다. 본문은 보통 굵기와 넉넉한 행간이다
  const heading: CSSProperties = {
    fontWeight: "var(--heading-weight)" as unknown as number,
    letterSpacing: "var(--heading-letter-spacing)",
    lineHeight: "var(--heading-line-height)",
  };

  const button = (bg: string, fg: string): CSSProperties => ({
    background: bg,
    color: fg,
    borderRadius: "var(--radius)",
    padding: "0.5em 1.1em",
    fontSize: step(0, "1.25rem"),
    fontWeight: 600,
    display: "inline-block",
  });

  const card: CSSProperties = {
    background: c.card,
    border: `1px solid ${c.line}`,
    borderRadius: "var(--radius)",
    boxShadow: "var(--shadow)",
    padding: "1.1rem 1.25rem",
  };

  return (
    <div
      role="img"
      aria-label="샘플 화면: 헤더와 메뉴, 소개 문구와 버튼 두 개, 그라디언트 배너, 카드 두 장, 입력창과 버튼"
      className="mt-8 overflow-hidden rounded-2xl border border-foreground/10"
      style={root}
    >
      <div className="p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span style={{ fontSize: step(1, "1.75rem"), ...heading }}>
            <span
              style={{ display: "inline-block", width: "0.7em", height: "0.7em", marginRight: "0.4em", background: "var(--color-primary)", borderRadius: "var(--radius)" }}
            />
            Studio
          </span>
          <span className="flex flex-wrap gap-4" style={{ fontSize: step(-1, "1rem"), color: c.muted }}>
            <span>소개</span>
            <span>작업</span>
            <span>문의</span>
          </span>
        </div>

        <div className="mt-8">
          <span
            style={{ ...button("var(--color-accent)", "var(--color-on-accent)"), padding: "0.2em 0.8em", fontSize: step(-1, "1rem") }}
          >
            새 소식
          </span>
          <p style={{ fontSize: step(4, "3.5rem"), ...heading, marginTop: "0.5em", wordBreak: "keep-all", overflowWrap: "break-word" }}>
            한 벌의 값으로 화면을 만듭니다
          </p>
          <p style={{ fontSize: step(0, "1.25rem"), color: c.muted, marginTop: "0.75em", maxWidth: "34em" }}>
            색, 글자, 모서리, 그림자를 한곳에 모으면 어디서나 같은 느낌을 낼 수 있어요.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <span style={button("var(--color-primary)", "var(--color-on-primary)")}>시작하기</span>
            <span style={{ ...button("transparent", c.text), border: `1px solid ${c.line}` }}>더 알아보기</span>
          </div>
        </div>

        <div
          className="mt-8 flex items-center justify-center"
          style={{ background: "var(--gradient)", borderRadius: "var(--radius)", minHeight: "6rem", fontSize: step(1, "1.75rem"), ...heading }}
        >
          <span style={{ background: "rgba(0, 0, 0, 0.28)", color: "#FFFFFF", padding: "0.2em 0.7em", borderRadius: "var(--radius)" }}>
            그라디언트 배너
          </span>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div style={card}>
            <p style={{ fontSize: step(1, "1.75rem"), ...heading }}>카드 제목</p>
            <p style={{ fontSize: step(-1, "1rem"), color: c.muted, marginTop: "0.4em" }}>
              그림자와 모서리가 키트의 값을 그대로 따릅니다.
            </p>
            <p style={{ fontSize: step(-1, "1rem"), color: "var(--color-primary)", fontWeight: 600, marginTop: "0.8em" }}>
              자세히 보기 →
            </p>
          </div>
          <div style={card}>
            <p style={{ fontSize: step(1, "1.75rem"), ...heading }}>보조 색</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span style={{ ...button("var(--color-secondary)", "var(--color-on-secondary)"), padding: "0.15em 0.7em", fontSize: step(-1, "1rem") }}>
                태그
              </span>
              <span style={{ ...button("var(--color-accent)", "var(--color-on-accent)"), padding: "0.15em 0.7em", fontSize: step(-1, "1rem") }}>
                강조
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <span
            style={{ flex: "1 1 12rem", border: `1px solid ${c.line}`, borderRadius: "var(--radius)", padding: "0.5em 1em", color: c.muted, fontSize: step(0, "1.25rem") }}
          >
            이메일
          </span>
          <span style={button("var(--color-secondary)", "var(--color-on-secondary)")}>구독</span>
        </div>
      </div>
    </div>
  );
}

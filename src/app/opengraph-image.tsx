import { ImageResponse } from "next/og";

export const alt = "SketchCraft - design and interaction lab";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 한글 글꼴 파일을 싣지 않으려고 이미지 안의 글자는 영문만 쓴다
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "#0a0a0a",
          color: "#ededed",
        }}
      >
        <div style={{ fontSize: 144, fontWeight: 700, letterSpacing: -4, lineHeight: 1.05 }}>
          SketchCraft.
        </div>
        <div style={{ marginTop: 28, fontSize: 40, color: "#a3a3a3" }}>
          Next.js · Tailwind · GSAP experiments
        </div>
      </div>
    ),
    { ...size },
  );
}

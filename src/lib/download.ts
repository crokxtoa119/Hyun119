export type CodeExt = "css" | "js" | "svg";

const MIME: Record<CodeExt, string> = {
  css: "text/css",
  js: "text/javascript",
  svg: "image/svg+xml",
};

/** 사용자 시간대 기준 YYYY-MM-DD. */
export function localDateStamp(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** 도구 이름과 날짜로 만든 코드 파일 이름. 예: gradient-2026-10-20.css */
export function codeFilename(name: string, ext: CodeExt, d: Date): string {
  return `${name}-${localDateStamp(d)}.${ext}`;
}

/** 텍스트를 파일로 내려받는다. 브라우저 안에서만 처리하고 어디로도 보내지 않는다. */
export function downloadText(filename: string, text: string, ext: CodeExt) {
  const url = URL.createObjectURL(new Blob([text], { type: `${MIME[ext]};charset=utf-8` }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

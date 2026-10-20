export const SITE_NAME = "SketchCraft";
export const SITE_DESCRIPTION = "디자인과 인터랙션을 실험하는 학습용 사이트";

/**
 * 사이트 기준 주소. 도메인을 정하면 NEXT_PUBLIC_SITE_URL 하나만 바꾸면 sitemap, robots, 공유 미리보기 주소가 따라간다.
 * 끝의 슬래시는 떼어 둔다.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hyun119.vercel.app").replace(
  /\/+$/,
  "",
);

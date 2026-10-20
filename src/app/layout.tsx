import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { PageTransitionProvider, TransitionLink } from "@/components/PageTransition";
import SettingsDialog from "@/components/SettingsDialog";
import { ACCENTS } from "@/lib/accentPalette";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  // 제목과 설명은 지정하지 않아야 페이지마다 자기 title/description이 공유 미리보기에 쓰인다
  openGraph: { type: "website", siteName: SITE_NAME, locale: "ko_KR" },
  twitter: { card: "summary_large_image" },
};

const NAV = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/experiments", label: "Experiments" },
  { href: "/log", label: "Log" },
];

// 저장된 테마와 강조 컬러를 첫 페인트 전에 적용해 깜빡임을 막는다. 강조 컬러는 ACCENTS에 있는 id만 받는다
const THEME_INIT = `try{var d=document.documentElement,t=localStorage.getItem("theme");if(t==="light"||t==="dark")d.setAttribute("data-theme",t);var a=localStorage.getItem("sc-accent");if(${JSON.stringify(
  ACCENTS.filter((x) => x.id !== "default").map((x) => x.id),
)}.indexOf(a)>-1)d.setAttribute("data-accent",a)}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      // data-theme을 스크립트가 미리 바꾸므로 서버 HTML과 속성이 달라도 경고하지 않는다
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT}
        </Script>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-on-accent"
        >
          본문으로 건너뛰기
        </a>
        <PageTransitionProvider>
          <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-4 border-b border-foreground/10">
            <TransitionLink href="/" className="py-1.5 font-mono text-sm font-semibold">
              SketchCraft
            </TransitionLink>
            <nav
              aria-label="주 메뉴"
              className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm sm:gap-x-6"
            >
              {NAV.map(({ href, label }) => (
                <TransitionLink
                  key={href}
                  href={href}
                  className="py-1.5 transition-opacity hover:opacity-60 aria-[current=page]:underline aria-[current=page]:underline-offset-4"
                >
                  {label}
                </TransitionLink>
              ))}
              <SettingsDialog />
            </nav>
          </header>
          <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
        </PageTransitionProvider>
      </body>
    </html>
  );
}

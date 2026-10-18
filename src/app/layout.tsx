import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { PageTransitionProvider, TransitionLink } from "@/components/PageTransition";
import SettingsDialog from "@/components/SettingsDialog";
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
  title: "SketchCraft",
  description: "디자인과 인터랙션을 실험하는 학습용 사이트",
};

const NAV = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/palette", label: "Palette" },
  { href: "/gradient", label: "Gradient" },
  { href: "/easing", label: "Easing" },
  { href: "/typography", label: "Typography" },
  { href: "/shadow", label: "Shadow" },
  { href: "/timeline", label: "Timeline" },
];

// 저장된 테마를 첫 페인트 전에 적용해 라이트/다크 깜빡임을 막는다
const THEME_INIT = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

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
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-lg focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-background"
        >
          본문으로 건너뛰기
        </a>
        <PageTransitionProvider>
          <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-4 border-b border-foreground/10">
            <TransitionLink href="/" className="font-mono text-sm font-semibold">
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
                  className="transition-opacity hover:opacity-60 aria-[current=page]:underline aria-[current=page]:underline-offset-4"
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

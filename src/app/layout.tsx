import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PageTransitionProvider, TransitionLink } from "@/components/PageTransition";
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
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PageTransitionProvider>
          <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-4 border-b border-foreground/10">
            <TransitionLink href="/" className="font-mono text-sm font-semibold">
              SketchCraft
            </TransitionLink>
            <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm sm:gap-x-6">
              {NAV.map(({ href, label }) => (
                <TransitionLink
                  key={href}
                  href={href}
                  className="hover:opacity-60 transition-opacity"
                >
                  {label}
                </TransitionLink>
              ))}
            </nav>
          </header>
          <main className="flex-1">{children}</main>
        </PageTransitionProvider>
      </body>
    </html>
  );
}

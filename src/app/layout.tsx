import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 border-b border-foreground/10">
          <Link href="/" className="font-mono text-sm font-semibold">
            SketchCraft
          </Link>
          <nav className="flex gap-6 text-sm">
            <Link href="/" className="hover:opacity-60 transition-opacity">
              Home
            </Link>
            <Link href="/palette" className="hover:opacity-60 transition-opacity">
              Palette
            </Link>
            <Link href="/gradient" className="hover:opacity-60 transition-opacity">
              Gradient
            </Link>
            <Link href="/easing" className="hover:opacity-60 transition-opacity">
              Easing
            </Link>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}

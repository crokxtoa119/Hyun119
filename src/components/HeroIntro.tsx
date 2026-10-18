"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const experiments: { title: string; href?: string }[] = [
  { title: "Color Palette", href: "/palette" },
  { title: "Gradient Editor", href: "/gradient" },
  { title: "Easing Visualizer", href: "/easing" },
  { title: "Typography Playground", href: "/typography" },
];

export default function HeroIntro() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-line", { yPercent: 110, duration: 0.9, stagger: 0.12 })
        .from(".hero-sub", { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
        .from(".hero-card", { y: 30, opacity: 0, duration: 0.5, stagger: 0.1 }, "-=0.3");
    },
    { scope: root },
  );

  return (
    <div ref={root} className="mx-auto max-w-4xl px-6 py-24">
      <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05]">
        <span className="block overflow-hidden">
          <span className="hero-line block">Sketch</span>
        </span>
        <span className="block overflow-hidden">
          <span className="hero-line block">Craft.</span>
        </span>
      </h1>
      <p className="hero-sub mt-6 max-w-xl text-lg text-foreground/70">
        Next.js, Tailwind, GSAP로 디자인과 인터랙션을 하나씩 실험하는 공간입니다.
      </p>

      <div className="mt-16 grid gap-4 sm:grid-cols-2">
        {experiments.map(({ title, href }) => {
          const card = (
            <>
              <p className="font-mono text-xs text-foreground/50">
                {href ? "Open" : "Coming soon"}
              </p>
              <p className="mt-2 font-semibold">{title}</p>
            </>
          );
          const cls = "hero-card rounded-xl border border-foreground/10 p-5";
          return href ? (
            <Link
              key={title}
              href={href}
              className={`${cls} transition-colors hover:border-foreground/40`}
            >
              {card}
            </Link>
          ) : (
            <div key={title} className={cls}>
              {card}
            </div>
          );
        })}
      </div>
    </div>
  );
}

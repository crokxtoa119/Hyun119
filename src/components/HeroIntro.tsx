"use client";

import { useRef } from "react";
import { TransitionLink } from "@/components/PageTransition";
import { EXPERIMENTS } from "@/lib/experiments";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const experiments: { title: string; href?: string }[] = EXPERIMENTS;

export default function HeroIntro() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // "움직임 줄이기"를 켠 경우에는 연출 없이 바로 보여준다
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from(".hero-line", { yPercent: 110, duration: 0.9, stagger: 0.12 })
          .from(".hero-sub", { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
          .from(".hero-card", { y: 30, opacity: 0, duration: 0.5, stagger: 0.1 }, "-=0.3");

        // 스크롤을 내리면 히어로가 천천히 위로 밀리며 흐려진다 (intro 트윈과 겹치지 않게 컨테이너에 건다)
        gsap.to(root.current, {
          yPercent: -8,
          opacity: 0.2,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });
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
              <p className="font-mono text-xs text-foreground/60">
                {href ? "Open" : "Coming soon"}
              </p>
              <p className="mt-2 font-semibold">{title}</p>
            </>
          );
          const cls = "hero-card rounded-xl border border-foreground/10 p-5";
          return href ? (
            <TransitionLink
              key={title}
              href={href}
              className={`${cls} transition-colors hover:border-foreground/40`}
            >
              {card}
            </TransitionLink>
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

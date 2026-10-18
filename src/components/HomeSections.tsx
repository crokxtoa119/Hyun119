"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const STACK = [
  { name: "Next.js", note: "App Router, 정적 배포" },
  { name: "React", note: "상태 기반 UI" },
  { name: "TypeScript", note: "타입 안전한 컴포넌트" },
  { name: "Tailwind CSS", note: "유틸리티 스타일링" },
  { name: "GSAP", note: "타임라인, ScrollTrigger" },
  { name: "Vercel", note: "GitHub 푸시 자동 배포" },
];

const LOG = [
  { title: "Color Palette", text: "HSL 기반 배색 규칙으로 5색 팔레트를 만듭니다." },
  { title: "Gradient Editor", text: "정지점과 각도를 조절해 CSS 코드를 얻습니다." },
  { title: "Easing Visualizer", text: "GSAP 이징 곡선과 실제 움직임을 비교합니다." },
  { title: "Typography Playground", text: "폰트, 크기, 자간, 행간을 조절하고 CSS를 복사합니다." },
  { title: "Shadow & Glass", text: "box-shadow와 글래스모피즘 값을 조절하고 CSS를 복사합니다." },
  { title: "Timeline Editor", text: "트윈 3개의 시작과 길이를 조절해 GSAP 타임라인 코드를 얻습니다." },
];

export default function HomeSections() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // 움직임 줄이기 설정이면 연출 없이 바로 보여준다
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
          gsap.from(el, {
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            // 페이지 맨 아래 요소도 최대 스크롤에서 반드시 트리거되도록 95%로 둔다
            scrollTrigger: { trigger: el, start: "top 95%", once: true },
          });
        });

        gsap.from(".stack-item", {
          y: 24,
          opacity: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: { trigger: ".stack-grid", start: "top 85%", once: true },
        });

        gsap.to(".progress", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { scrub: 0.3, start: 0, end: "max" },
        });

        // 화면 중앙 근처에 온 실험 항목만 또렷하게 보여준다. 스크롤을 되돌리면 다시 흐려진다
        gsap.utils.toArray<HTMLElement>(".log-body").forEach((body) => {
          gsap.fromTo(
            body,
            { opacity: 0.35, x: 0 },
            {
              opacity: 1,
              x: 8,
              duration: 0.35,
              ease: "power2.out",
              scrollTrigger: {
                trigger: body,
                start: "top 70%",
                end: "bottom 40%",
                toggleActions: "play reverse play reverse",
              },
            },
          );
        });
      });

      // 마우스가 있는 환경에서만 버튼이 커서를 살짝 따라온다
      mm.add("(prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
        const wrap = root.current?.querySelector<HTMLElement>(".magnet");
        if (!wrap) return;
        const moveX = gsap.quickTo(wrap, "x", { duration: 0.4, ease: "power3.out" });
        const moveY = gsap.quickTo(wrap, "y", { duration: 0.4, ease: "power3.out" });

        const onMove = (e: MouseEvent) => {
          const r = wrap.getBoundingClientRect();
          moveX((e.clientX - (r.left + r.width / 2)) * 0.3);
          moveY((e.clientY - (r.top + r.height / 2)) * 0.3);
        };
        const onLeave = () => {
          moveX(0);
          moveY(0);
        };
        wrap.addEventListener("mousemove", onMove);
        wrap.addEventListener("mouseleave", onLeave);
        return () => {
          wrap.removeEventListener("mousemove", onMove);
          wrap.removeEventListener("mouseleave", onLeave);
        };
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <div
        className="progress fixed inset-x-0 top-0 z-50 h-0.5 origin-left scale-x-0 bg-foreground"
        aria-hidden
      />

      <section id="about" className="mx-auto max-w-4xl px-6 py-24">
        <p className="reveal font-mono text-xs uppercase tracking-widest text-foreground/60">
          About
        </p>
        <h2 className="reveal mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          만들면서 배우는 실험실
        </h2>
        <p className="reveal mt-5 max-w-2xl leading-relaxed text-foreground/70">
          이 사이트는 웹 디자인과 인터랙션을 직접 만들어 보며 익히기 위한 공간입니다.
          작은 도구를 하나씩 만들고, 배운 것을 페이지로 남깁니다.
        </p>
      </section>

      <section id="log" className="mx-auto max-w-4xl px-6 pb-24">
        <p className="reveal font-mono text-xs uppercase tracking-widest text-foreground/60">
          Experiments
        </p>
        <ol className="mt-6 divide-y divide-foreground/10 border-y border-foreground/10">
          {LOG.map((item, i) => (
            <li key={item.title} className="reveal py-6">
              <div className="log-body flex gap-6">
                <span className="font-mono text-sm text-foreground/60">0{i + 1}</span>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-foreground/70">{item.text}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="stack" className="mx-auto max-w-4xl px-6 pb-24">
        <p className="reveal font-mono text-xs uppercase tracking-widest text-foreground/60">
          Stack
        </p>
        <div className="stack-grid mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {STACK.map((s) => (
            <div
              key={s.name}
              className="stack-item rounded-xl border border-foreground/10 p-5"
            >
              <p className="font-semibold">{s.name}</p>
              <p className="mt-1 text-sm text-foreground/60">{s.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="border-t border-foreground/10">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="reveal text-2xl font-bold tracking-tight sm:text-3xl">
            코드가 궁금하신가요?
          </h2>
          <div className="magnet mt-6 inline-block">
            <a
              href="https://github.com/crokxtoa119/Hyun119"
              target="_blank"
              rel="noopener noreferrer"
              className="reveal inline-block rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-80"
            >
              GitHub에서 보기
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ComponentProps,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

type TransitionContextValue = { navigate: (href: string) => void };

const TransitionContext = createContext<TransitionContextValue | null>(null);

const pathOf = (href: string) => href.split(/[?#]/)[0] || "/";

/**
 * 링크를 누르면 커튼이 아래에서 올라와 화면을 덮고, 새 페이지로 바뀌면 위로 걷힌다.
 * 커튼은 layout에 항상 떠 있으므로 페이지가 바뀌어도 끊기지 않는다.
 */
export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const curtain = useRef<HTMLDivElement>(null);
  const covered = useRef(false);
  const busy = useRef(false);
  const failsafe = useRef<ReturnType<typeof setTimeout>>(undefined);

  // 커튼은 화면 아래에서 대기한다. JS가 준비되기 전에는 visibility로 숨겨 첫 화면을 가리지 않는다.
  useGSAP(() => {
    gsap.set(curtain.current, { yPercent: 100, visibility: "visible" });
  });

  const reveal = useCallback(() => {
    const el = curtain.current;
    clearTimeout(failsafe.current);
    if (!el) return;
    covered.current = false;
    gsap.to(el, {
      yPercent: -100,
      duration: 0.55,
      ease: "power3.inOut",
      onComplete: () => {
        gsap.set(el, { yPercent: 100 });
        busy.current = false;
      },
    });
  }, []);

  // 경로가 실제로 바뀌면 커튼을 걷는다
  useEffect(() => {
    if (covered.current) reveal();
  }, [pathname, reveal]);

  useEffect(() => () => clearTimeout(failsafe.current), []);

  const navigate = useCallback(
    (href: string) => {
      const el = curtain.current;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!el || reduced) {
        router.push(href);
        return;
      }
      if (busy.current) return;
      busy.current = true;
      gsap.to(el, {
        yPercent: 0,
        duration: 0.45,
        ease: "power3.inOut",
        onComplete: () => {
          covered.current = true;
          router.push(href);
          // 이동이 일어나지 않는 경우에도 커튼이 화면을 가리고 멈추지 않게 한다
          failsafe.current = setTimeout(reveal, 2500);
        },
      });
    },
    [router, reveal],
  );

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      <div
        ref={curtain}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-foreground font-mono text-sm text-background"
        style={{ visibility: "hidden" }}
      >
        SketchCraft
      </div>
    </TransitionContext.Provider>
  );
}

type TransitionLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/** next/link와 같지만, 다른 페이지로 갈 때 커튼 전환을 거친다. */
export function TransitionLink({ href, onNavigate, ...props }: TransitionLinkProps) {
  const ctx = useContext(TransitionContext);
  const pathname = usePathname();
  // 해시 없는 링크가 지금 보고 있는 페이지를 가리키면 현재 페이지로 표시한다
  const isCurrent = !href.includes("#") && pathOf(href) === pathname;

  return (
    <Link
      href={href}
      aria-current={isCurrent ? "page" : undefined}
      onNavigate={(e) => {
        onNavigate?.(e);
        // 같은 페이지 안의 앵커 이동이거나 Provider 밖이면 기본 동작을 따른다
        if (!ctx || pathOf(href) === pathname) return;
        e.preventDefault();
        ctx.navigate(href);
      }}
      {...props}
    />
  );
}

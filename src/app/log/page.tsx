import type { Metadata } from "next";
import { TransitionLink } from "@/components/PageTransition";
import { EXPERIMENTS } from "@/lib/experiments";

export const metadata: Metadata = {
  title: "Log · SketchCraft",
  description: "실험마다 무엇을 배웠는지 기록한 페이지",
};

export default function LogPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-foreground/60">Log</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">실험 기록</h1>
      <p className="mt-4 max-w-2xl text-foreground/70">
        만든 도구마다 무엇을 배웠는지 남겨 둔 기록입니다.
      </p>

      <ol className="mt-10 divide-y divide-foreground/10 border-y border-foreground/10">
        {EXPERIMENTS.map((e, i) => (
          <li key={e.slug}>
            <TransitionLink
              href={`/log/${e.slug}`}
              className="flex gap-6 py-6 transition-colors hover:bg-foreground/5"
            >
              <span className="font-mono text-sm text-foreground/60">0{i + 1}</span>
              <span>
                <span className="block font-semibold">{e.title}</span>
                <span className="mt-1 block text-sm text-foreground/70">{e.summary}</span>
              </span>
            </TransitionLink>
          </li>
        ))}
      </ol>
    </div>
  );
}

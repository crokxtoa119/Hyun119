import type { Metadata } from "next";
import { TransitionLink } from "@/components/PageTransition";
import { groupExperiments } from "@/lib/experiments";

export const metadata: Metadata = {
  title: "Experiments · SketchCraft",
  description: "색, 모양·레이아웃, 글자, 모션, 조합으로 나눈 실험 도구 목록",
};

export default function ExperimentsPage() {
  const groups = groupExperiments();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-foreground/60">
        Experiments
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">실험 도구</h1>
      <p className="mt-4 max-w-2xl text-foreground/70">
        주제별로 묶은 도구 목록입니다. 도구마다 값을 바꿔 보고 CSS나 코드를 복사할 수 있습니다.
      </p>

      <div className="mt-12 space-y-12">
        {groups.map((g) => (
          <section key={g.id} aria-labelledby={`cat-${g.id}`}>
            <h2 id={`cat-${g.id}`} className="font-mono text-sm font-semibold">
              {g.label}
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {g.items.map((e) => (
                <li key={e.slug}>
                  <TransitionLink
                    href={e.href}
                    className="block h-full rounded-xl border border-foreground/10 p-5 transition-colors hover:border-foreground/40"
                  >
                    <span className="block font-semibold">{e.title}</span>
                    <span className="mt-2 block text-sm text-foreground/70">{e.summary}</span>
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

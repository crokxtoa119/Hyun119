import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TransitionLink } from "@/components/PageTransition";
import { EXPERIMENTS, getExperiment, getNeighbors } from "@/lib/experiments";

// Cache Components에서는 dynamicParams를 쓸 수 없다. 목록에 없는 slug는 페이지에서 notFound()로 404 처리한다
export function generateStaticParams() {
  return EXPERIMENTS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata(props: PageProps<"/log/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const experiment = getExperiment(slug);
  if (!experiment) return {};
  return { title: `${experiment.title} 기록 · SketchCraft`, description: experiment.summary };
}

// params는 Suspense 안에서 읽어야 페이지 이동이 즉시 일어난다
export default function LogDetailPage(props: PageProps<"/log/[slug]">) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-6 py-16 text-sm text-foreground/60">
          불러오는 중…
        </div>
      }
    >
      <LogDetail params={props.params} />
    </Suspense>
  );
}

async function LogDetail({ params }: { params: PageProps<"/log/[slug]">["params"] }) {
  const { slug } = await params;
  const experiment = getExperiment(slug);
  if (!experiment) notFound();

  const { prev, next } = getNeighbors(slug);

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <TransitionLink href="/log" className="font-mono text-xs text-foreground/60 hover:underline">
        ← 전체 기록
      </TransitionLink>
      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{experiment.title}</h1>
      <p className="mt-4 text-foreground/70">{experiment.summary}</p>

      <h2 className="mt-10 font-mono text-xs uppercase tracking-widest text-foreground/60">
        배운 점
      </h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
        {experiment.learned.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>

      <h2 className="mt-10 font-mono text-xs uppercase tracking-widest text-foreground/60">
        사용한 것
      </h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {experiment.tech.map((t) => (
          <li
            key={t}
            className="rounded-full border border-foreground/10 px-3 py-1 font-mono text-xs"
          >
            {t}
          </li>
        ))}
      </ul>

      <TransitionLink
        href={experiment.href}
        className="mt-10 inline-block rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-80"
      >
        실험 열기
      </TransitionLink>

      <nav
        aria-label="이전 다음 기록"
        className="mt-14 flex justify-between gap-4 border-t border-foreground/10 pt-6 text-sm"
      >
        {prev ? (
          <TransitionLink href={`/log/${prev.slug}`} className="hover:underline">
            ← {prev.title}
          </TransitionLink>
        ) : (
          <span />
        )}
        {next ? (
          <TransitionLink href={`/log/${next.slug}`} className="text-right hover:underline">
            {next.title} →
          </TransitionLink>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}

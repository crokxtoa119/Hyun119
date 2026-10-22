"use client";

import { clearActivity, useActivity, useToday } from "@/lib/activity";
import { summarize } from "@/lib/activityLog";
import { groupExperiments } from "@/lib/experiments";
import { PRESET_TOOLS } from "@/lib/presetRegistry";
import { usePresetCount } from "@/lib/usePresets";
import { TransitionLink } from "@/components/PageTransition";

const PRESET_KEY = Object.fromEntries(PRESET_TOOLS.map((t) => [t.slug, t.key]));

function Stat({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="rounded-2xl border border-foreground/10 p-4">
      <dt className="text-xs text-foreground/60">{label}</dt>
      <dd className="mt-1 font-mono text-2xl font-bold">
        {value}
        <span className="ml-1 text-sm font-normal text-foreground/60">{unit}</span>
      </dd>
    </div>
  );
}

function ToolRow({
  slug,
  title,
  href,
  visit,
}: {
  slug: string;
  title: string;
  href: string;
  visit: { count: number; last: string } | undefined;
}) {
  const presets = usePresetCount(PRESET_KEY[slug] ?? "");
  return (
    <tr className="border-b border-foreground/10">
      <th scope="row" className="py-0.5 pr-3 text-left font-normal">
        {/* 링크 높이를 24px 이상으로 맞추려고 링크에 여백을 주고, 줄 간격은 그만큼 줄였다 */}
        <TransitionLink href={href} className="inline-block py-1.5 underline-offset-4 hover:underline">
          {title}
        </TransitionLink>
      </th>
      <td className="py-2 pr-3 font-mono">{visit ? `${visit.count}번` : "—"}</td>
      <td className="py-2 pr-3 font-mono">{visit ? visit.last : "아직 안 열어 봄"}</td>
      <td className="py-2 font-mono">{presets > 0 ? `${presets}개` : "—"}</td>
    </tr>
  );
}

export default function RecordBoard() {
  const activity = useActivity();
  const today = useToday();
  const groups = groupExperiments();
  const slugs = groups.flatMap((g) => g.items.map((e) => e.slug));
  const s = summarize(activity, slugs, today);
  const empty = s.visits === 0;

  const reset = () => {
    if (window.confirm("방문 기록을 모두 지울까요? 되돌릴 수 없습니다. 저장한 프리셋은 그대로입니다.")) {
      clearActivity();
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-foreground/60">Record</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">내 기록판</h1>
      <p className="mt-4 max-w-2xl text-foreground/70">
        어떤 도구를 얼마나 써 봤는지 보여 줍니다. 기록은 이 브라우저에만 저장되고 어디로도 전송되지
        않습니다.
      </p>

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="써 본 도구" value={s.tried} unit={`/ ${s.total}`} />
        <Stat label="도구를 연 횟수" value={s.visits} unit="번" />
        <Stat label="방문한 날" value={s.days} unit="일" />
        <Stat label="연속 방문" value={s.current} unit={`일 (최장 ${s.longest})`} />
      </dl>

      <div
        role="progressbar"
        aria-label="써 본 도구"
        aria-valuemin={0}
        aria-valuemax={s.total}
        aria-valuenow={s.tried}
        className="mt-4 h-2 overflow-hidden rounded-full bg-foreground/10"
      >
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${s.total ? (s.tried / s.total) * 100 : 0}%` }}
        />
      </div>

      {empty && (
        <p className="mt-6 text-sm text-foreground/70" role="status">
          아직 기록이 없습니다. 도구를 하나 열어 보면 여기에 쌓이기 시작합니다.
        </p>
      )}

      {groups.map((g) => (
        <section key={g.id} className="mt-10" aria-labelledby={`rec-${g.id}`}>
          <h2 id={`rec-${g.id}`} className="text-sm font-medium text-foreground/70">
            {g.label}{" "}
            <span className="font-mono text-xs">
              {g.items.filter((e) => activity.visits[e.slug]).length}/{g.items.length}
            </span>
          </h2>
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="border-b border-foreground/15 text-left text-xs text-foreground/60">
                <th scope="col" className="py-1.5 font-normal">
                  도구
                </th>
                <th scope="col" className="py-1.5 font-normal">
                  연 횟수
                </th>
                <th scope="col" className="py-1.5 font-normal">
                  마지막으로 연 날
                </th>
                <th scope="col" className="py-1.5 font-normal">
                  저장한 프리셋
                </th>
              </tr>
            </thead>
            <tbody>
              {g.items.map((e) => (
                <ToolRow
                  key={e.slug}
                  slug={e.slug}
                  title={e.title}
                  href={e.href}
                  visit={activity.visits[e.slug]}
                />
              ))}
            </tbody>
          </table>
        </section>
      ))}

      <div className="mt-10">
        <button
          type="button"
          onClick={reset}
          disabled={activity.days.length === 0}
          className="min-h-6 rounded-lg border border-foreground/20 px-3 py-1.5 text-sm transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          방문 기록 지우기
        </button>
        <p className="mt-2 text-xs text-foreground/60">
          날짜는 이 기기의 시간대 기준입니다. 브라우저 데이터를 지우거나 다른 기기에서 열면 기록이
          이어지지 않습니다.
        </p>
      </div>
    </div>
  );
}

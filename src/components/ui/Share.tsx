"use client";

import { buildShareUrl, useSharedData } from "@/lib/shareLink";
import { useCopy } from "@/lib/useCopy";

/** 현재 설정을 담은 공유 링크를 복사하는 버튼. */
export function ShareButton<T>({ current }: { current: T }) {
  const { copied, copy } = useCopy(1800);

  return (
    <button
      type="button"
      // 주소는 클릭할 때만 만든다(렌더 중에는 window를 읽지 않는다)
      onClick={() => copy(buildShareUrl(current))}
      className="rounded-lg border border-foreground/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/5"
      aria-label="현재 설정 공유 링크 복사"
    >
      {copied ? "링크 복사됨!" : "공유 링크 복사"}
    </button>
  );
}

type SharedNoticeProps<T> = {
  validate: (d: unknown) => d is T;
  onApply: (data: T) => void;
};

/** 공유 링크로 들어왔을 때 설정을 적용할지 묻는 안내. 직접 누를 때만 적용한다. */
export function SharedNotice<T>({ validate, onApply }: SharedNoticeProps<T>) {
  const { shared, dismiss } = useSharedData(validate);
  if (!shared) return null;

  return (
    <div
      role="status"
      className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-foreground/20 bg-foreground/5 px-4 py-3 text-sm"
    >
      <span>공유된 설정이 있습니다. 적용하면 지금 설정이 바뀝니다.</span>
      <span className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            onApply(shared);
            dismiss();
          }}
          className="rounded-lg bg-foreground px-3 py-1 font-medium text-background transition-opacity hover:opacity-80"
        >
          적용
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg border border-foreground/20 px-3 py-1 transition-colors hover:bg-foreground/5"
        >
          닫기
        </button>
      </span>
    </div>
  );
}

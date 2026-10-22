"use client";

import type { ComponentProps, ReactNode, Ref } from "react";
import CodeBlock from "@/components/ui/CodeBlock";
import PresetBar from "@/components/ui/PresetBar";
import { ShareButton } from "@/components/ui/Share";
import type { Preset } from "@/lib/usePresets";

type ToolPageProps = {
  title: ReactNode;
  description: ReactNode;
  /** GSAP useGSAP의 scope처럼 도구 전체를 가리켜야 할 때 넘긴다. */
  rootRef?: Ref<HTMLDivElement>;
  children: ReactNode;
};

/** 도구 페이지의 바깥 틀: 너비, 안쪽 여백, 제목과 설명. 모든 도구가 같은 모양으로 시작한다. */
export function ToolPage({ title, description, rootRef, children }: ToolPageProps) {
  return (
    <div ref={rootRef} className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-foreground/70">{description}</p>
      {children}
    </div>
  );
}

/**
 * 조절판 영역. 좁은 화면에서는 한 열, md(768px) 이상에서는 두 열로 놓는다.
 * 간격도 여기서 한 번만 정한다. 다른 열 구성이 필요하면 className으로 덮어쓴다.
 */
export function ToolControls({
  children,
  className = "md:grid-cols-2",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mt-8 grid gap-x-8 gap-y-6 ${className}`}>{children}</div>;
}

type ToolFooterProps<T> = {
  presets: Preset<T>[];
  isFull: boolean;
  /** 프리셋 저장과 공유 링크에 함께 쓰는 현재 설정. */
  state: T;
  onSave: (name: string, state: T) => void;
  onLoad: (data: T) => void;
  onRemove: (id: string) => void;
  code: ComponentProps<typeof CodeBlock>;
  /** 코드 바로 아래에 붙는 짧은 설명. */
  note?: ReactNode;
};

/** 도구 페이지의 아래쪽: 프리셋, 공유 링크, 코드 출력. 순서와 간격이 모든 도구에서 같다. */
export function ToolFooter<T>({
  presets,
  isFull,
  state,
  onSave,
  onLoad,
  onRemove,
  code,
  note,
}: ToolFooterProps<T>) {
  return (
    <>
      <div className="mt-8">
        <PresetBar
          presets={presets}
          isFull={isFull}
          onSave={(name) => onSave(name, state)}
          onLoad={onLoad}
          onRemove={onRemove}
        />
        <div className="mt-4">
          <ShareButton current={state} />
        </div>
      </div>

      <div className="mt-8">
        <CodeBlock {...code} />
        {note && <p className="mt-2 text-xs text-foreground/60">{note}</p>}
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import {
  DEFAULT_CONV,
  convToCss,
  convertColor,
  isConvState,
  type ConvState,
} from "@/lib/colorConvert";
import { usePresets } from "@/lib/usePresets";
import Chip from "@/components/ui/Chip";
import { SharedNotice } from "@/components/ui/Share";
import { ToolControls, ToolFooter, ToolPage } from "@/components/ui/ToolLayout";

const EXAMPLES = ["#4F46E5", "rgb(15 118 110)", "hsl(24, 90%, 45%)", "oklch(65% 0.2 330)"];

const ROWS = [
  { key: "hex", label: "HEX" },
  { key: "rgb", label: "RGB" },
  { key: "hsl", label: "HSL" },
  { key: "oklch", label: "OKLCH" },
] as const;

export default function ColorConverter() {
  const [state, setState] = useState<ConvState>(DEFAULT_CONV);
  // 입력 중에는 아직 완성되지 않은 글자도 보여 주고, 읽을 수 있을 때만 확정한다
  const [draft, setDraft] = useState<string | null>(null);

  const text = draft ?? state.input;
  const invalid = draft !== null && convertColor(draft) === null;
  const result = convertColor(state.input)!;

  const { presets, save, remove, isFull } = usePresets("sc-color-converter-presets", isConvState);
  const load = (s: ConvState) => {
    setDraft(null);
    setState({ input: s.input });
  };

  return (
    <ToolPage
      title="Color Converter"
      description="HEX, RGB, HSL, OKLCH 중 어느 표기로든 입력하면 나머지 표기로 바꿔 줍니다."
    >
      <SharedNotice validate={isConvState} onApply={load} />

      <ToolControls>
        <div className="space-y-4">
          <div>
            <label htmlFor="conv-input" className="mb-1 block text-sm font-medium">
              색
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                aria-label="색 선택"
                value={result.hex.toLowerCase()}
                onChange={(e) => {
                  setDraft(null);
                  setState({ input: e.target.value.toUpperCase() });
                }}
                className="size-11 cursor-pointer rounded-lg border border-foreground/20 bg-transparent p-1"
              />
              <input
                id="conv-input"
                type="text"
                spellCheck={false}
                autoComplete="off"
                value={text}
                aria-invalid={invalid}
                aria-describedby={invalid ? "conv-err" : undefined}
                onChange={(e) => {
                  const v = e.target.value;
                  setDraft(v);
                  if (convertColor(v)) setState({ input: v });
                }}
                onBlur={() => setDraft(null)}
                className="w-full max-w-xs rounded-lg border border-foreground/20 bg-transparent px-3 py-2 font-mono text-sm"
              />
            </div>
            {invalid && (
              <p id="conv-err" className="mt-1 text-xs text-foreground/70">
                #RGB, rgb(), hsl(), oklch() 형식으로 입력하세요.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="예시 색">
            {EXAMPLES.map((ex) => (
              <Chip
                key={ex}
                active={state.input === ex}
                onClick={() => {
                  setDraft(null);
                  setState({ input: ex });
                }}
              >
                {ex}
              </Chip>
            ))}
          </div>
        </div>

        <div
          aria-hidden
          className="min-h-40 rounded-2xl border border-foreground/10"
          style={{ backgroundColor: result.hex }}
        />
      </ToolControls>

      <table className="mt-8 w-full max-w-lg text-sm">
        <caption className="mb-2 text-left text-sm font-medium">변환 결과</caption>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.key} className="border-b border-foreground/10">
              <th scope="row" className="w-24 py-2 text-left font-normal text-foreground/60">
                {row.label}
              </th>
              <td className="py-2 font-mono">{result[row.key]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-foreground/60" role="status">
        {result.inGamut
          ? "HSL은 정수로 반올림해 표시해서 되돌리면 아주 조금 어긋날 수 있습니다."
          : "이 색은 일반 모니터(sRGB)로 나타낼 수 없는 범위라서 HEX, RGB, HSL은 가장 가까운 값으로 잘라 낸 것입니다. OKLCH만 원래 색을 그대로 담고 있습니다."}
      </p>

      <ToolFooter
        presets={presets}
        isFull={isFull}
        state={state}
        onSave={save}
        onLoad={load}
        onRemove={remove}
        code={{
          title: "CSS",
          code: convToCss(result),
          file: { name: "color-converter", ext: "css" },
        }}
        note="네 줄은 모두 같은 색을 나타냅니다. 필요한 표기 한 줄만 쓰면 됩니다."
      />
    </ToolPage>
  );
}

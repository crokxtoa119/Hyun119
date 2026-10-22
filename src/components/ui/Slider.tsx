type RangeInputProps = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max: number;
  step?: number;
  disabled?: boolean;
  track?: string;
  "aria-label"?: string;
};

/** 라벨 없는 기본 슬라이더 입력. */
export function RangeInput({
  value,
  onChange,
  min = 0,
  max,
  step,
  disabled,
  track,
  "aria-label": ariaLabel,
}: RangeInputProps) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(e) => onChange(Number(e.target.value))}
      // 눈에 보이는 트랙은 8px로 두고, 위아래 여백으로 손가락이 닿는 높이를 24px로 만든다(WCAG 2.5.8).
      // background 단축 속성이 background-clip을 되돌리므로 트랙 그라디언트를 쓸 때는 clip을 다시 지정한다
      style={track ? { background: track, backgroundClip: "content-box" } : undefined}
      className="h-6 w-full cursor-pointer appearance-none rounded-full bg-foreground/15 bg-clip-content py-2 accent-accent"
    />
  );
}

type SliderProps = Omit<RangeInputProps, "aria-label"> & {
  label: string;
  /** 오른쪽에 보여줄 값 표시. 없으면 value를 그대로 보여준다. */
  display?: string;
};

/** 라벨과 현재 값이 붙은 슬라이더. */
export default function Slider({ label, display, ...input }: SliderProps) {
  return (
    <label className={`block ${input.disabled ? "opacity-40" : ""}`}>
      <span className="mb-1 flex justify-between text-sm font-medium">
        {label}
        <span className="font-mono text-foreground/60">{display ?? input.value}</span>
      </span>
      <RangeInput {...input} />
    </label>
  );
}

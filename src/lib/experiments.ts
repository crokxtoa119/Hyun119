export const CATEGORIES = [
  { id: "color", label: "색" },
  { id: "shape", label: "모양·레이아웃" },
  { id: "type", label: "글자" },
  { id: "motion", label: "모션" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export type Experiment = {
  slug: string;
  category: CategoryId;
  title: string;
  href: string;
  summary: string;
  learned: string[];
  tech: string[];
};

export const EXPERIMENTS: Experiment[] = [
  {
    slug: "palette",
    category: "color",
    title: "Color Palette",
    href: "/palette",
    summary: "HSL 기반 배색 규칙으로 5색 팔레트를 만듭니다.",
    learned: [
      "HSL에서 색상 각도만 돌려도 보색, 유사색, 삼각 배색을 만들 수 있다.",
      "hex, rgb, hsl 변환은 순수 함수로 분리하면 테스트하기 쉽다.",
    ],
    tech: ["React state", "lib/color.ts"],
  },
  {
    slug: "gradient",
    category: "color",
    title: "Gradient Editor",
    href: "/gradient",
    summary: "정지점과 각도를 조절해 CSS 코드를 얻습니다.",
    learned: [
      "linear-gradient는 각도와 정지점 목록만으로 표현된다.",
      "슬라이더 값은 범위를 벗어나지 않게 항상 clamp해서 쓴다.",
    ],
    tech: ["CSS gradients", "clipboard"],
  },
  {
    slug: "easing",
    category: "motion",
    title: "Easing Visualizer",
    href: "/easing",
    summary: "GSAP 이징 곡선과 실제 움직임을 비교합니다.",
    learned: [
      "같은 시간이라도 이징에 따라 체감 속도가 크게 달라진다.",
      "곡선 그래프와 실제 움직임을 나란히 보면 차이가 바로 보인다.",
    ],
    tech: ["GSAP", "SVG"],
  },
  {
    slug: "typography",
    category: "type",
    title: "Typography Playground",
    href: "/typography",
    summary: "폰트, 크기, 자간, 행간을 조절하고 CSS를 복사합니다.",
    learned: [
      "next/font로 폰트를 불러오면 레이아웃 이동 없이 적용된다.",
      "자간과 행간은 글자 크기에 비례해 잡는 편이 안정적이다.",
    ],
    tech: ["next/font", "CSS variables"],
  },
  {
    slug: "shadow",
    category: "shape",
    title: "Shadow & Glass",
    href: "/shadow",
    summary: "box-shadow와 글래스모피즘 값을 조절하고 CSS를 복사합니다.",
    learned: [
      "그림자는 여러 겹을 쌓아야 자연스러운 깊이가 생긴다.",
      "backdrop-filter는 배경이 단색이면 효과가 거의 보이지 않는다.",
    ],
    tech: ["box-shadow", "backdrop-filter"],
  },
  {
    slug: "timeline",
    category: "motion",
    title: "Timeline Editor",
    href: "/timeline",
    summary: "트윈 3개의 시작과 길이를 조절해 GSAP 타임라인 코드를 얻습니다.",
    learned: [
      "타임라인의 position 파라미터로 트윈 시작 시점을 절대값으로 지정할 수 있다.",
      "입력값은 검증과 범위 제한을 거친 뒤에만 타임라인에 넣는다.",
    ],
    tech: ["GSAP timeline", "lib/timeline.ts"],
  },
  {
    slug: "radius",
    category: "shape",
    title: "Border Radius",
    href: "/radius",
    summary: "모서리 여덟 값을 조절해 덩어리 모양을 만들고 CSS를 복사합니다.",
    learned: [
      "border-radius는 `가로 / 세로` 순서로 모서리마다 두 값을 줄 수 있어 타원형 모서리가 된다.",
      "마주 보는 변의 반지름 합이 100%를 넘으면 브라우저가 비율대로 줄이므로, 덩어리 모양은 합을 100%에 맞춘다.",
    ],
    tech: ["border-radius", "lib/radius.ts"],
  },
  {
    slug: "contrast",
    category: "color",
    title: "Contrast Checker",
    href: "/contrast",
    summary: "글자색과 배경색의 명암비를 계산하고 WCAG 통과 여부를 확인합니다.",
    learned: [
      "명암비는 두 색의 상대 휘도를 (밝은 쪽 + 0.05) / (어두운 쪽 + 0.05)로 계산하며, 일반 글자는 4.5:1 이상이어야 AA다.",
      "반올림하면 4.499가 4.50으로 보여 통과한 것처럼 오해하므로 소수는 내림해서 보여준다.",
    ],
    tech: ["WCAG", "lib/contrast.ts"],
  },
  {
    slug: "flexbox",
    category: "shape",
    title: "Flexbox",
    href: "/flexbox",
    summary: "방향, 줄바꿈, 정렬, 간격을 바꿔 보며 flexbox 동작을 익힙니다.",
    learned: [
      "justify-content는 주축, align-items는 교차축을 정렬하므로 flex-direction이 바뀌면 두 속성의 화면상 방향도 바뀐다.",
      "align-items: stretch는 아이템에 교차축 크기가 지정돼 있지 않을 때만 늘어난다.",
    ],
    tech: ["flexbox", "lib/flex.ts"],
  },
  {
    slug: "keyframes",
    category: "motion",
    title: "Keyframes",
    href: "/keyframes",
    summary: "세 개의 키프레임으로 CSS 애니메이션을 만들고 코드를 복사합니다.",
    learned: [
      "@keyframes는 퍼센트 지점마다 상태를 적고, 그 사이는 timing-function이 이어 준다.",
      "움직임 줄이기를 켠 사용자에게는 prefers-reduced-motion 미디어 쿼리로 자동 재생을 멈춰야 한다.",
    ],
    tech: ["@keyframes", "lib/keyframes.ts"],
  },
];

export function categoryLabel(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

/** 분류 순서대로 묶는다. 같은 분류 안에서는 EXPERIMENTS 순서를 유지하고, 비어 있는 분류는 뺀다. */
export function groupExperiments(): { id: CategoryId; label: string; items: Experiment[] }[] {
  return CATEGORIES.map((c) => ({
    id: c.id,
    label: c.label,
    items: EXPERIMENTS.filter((e) => e.category === c.id),
  })).filter((g) => g.items.length > 0);
}

export function getExperiment(slug: string): Experiment | undefined {
  return EXPERIMENTS.find((e) => e.slug === slug);
}

/** 목록 순서 기준 이전/다음 항목. 처음과 끝에서는 해당 방향이 null이다. */
export function getNeighbors(slug: string): {
  prev: Experiment | null;
  next: Experiment | null;
} {
  const i = EXPERIMENTS.findIndex((e) => e.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return { prev: EXPERIMENTS[i - 1] ?? null, next: EXPERIMENTS[i + 1] ?? null };
}

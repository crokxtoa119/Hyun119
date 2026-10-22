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
    slug: "grid",
    category: "shape",
    title: "Grid",
    href: "/grid",
    summary: "열 개수, 간격, 정렬을 바꿔 보며 CSS Grid 동작을 익힙니다.",
    learned: [
      "repeat(auto-fit, minmax(96px, 1fr))은 화면 너비에 맞춰 열 개수가 저절로 정해져 미디어 쿼리 없이 반응형 격자를 만든다.",
      "gap에 값을 두 개 쓰면 행 간격, 열 간격 순서다. justify-items는 칸 안의 가로, align-items는 세로 정렬이다.",
    ],
    tech: ["CSS Grid", "lib/grid.ts"],
  },
  {
    slug: "filter",
    category: "color",
    title: "Filter",
    href: "/filter",
    summary: "흐림, 밝기, 대비, 색조 같은 CSS filter 값을 조절합니다.",
    learned: [
      "filter 함수는 쓴 순서대로 차례로 적용되므로 순서를 바꾸면 결과도 달라질 수 있다.",
      "효과가 없는 값(brightness 100% 등)은 CSS에서 빼면 코드가 짧아지고, 모두 빼면 filter: none이다.",
    ],
    tech: ["CSS filter", "lib/filter.ts"],
  },
  {
    slug: "transform",
    category: "motion",
    title: "Transform",
    href: "/transform",
    summary: "이동, 회전, 크기, 기울임, 3D 원근을 조절하고 CSS를 복사합니다.",
    learned: [
      "transform 함수는 왼쪽에서 오른쪽으로 차례로 적용되므로 rotate와 translate의 순서를 바꾸면 도착 위치가 달라진다.",
      "rotateX·rotateY의 입체감은 perspective가 있어야 보이고, 값이 작을수록 원근감이 강하다.",
    ],
    tech: ["CSS transform", "lib/transform.ts"],
  },
  {
    slug: "text-effects",
    category: "type",
    title: "Text Effects",
    href: "/text-effects",
    summary: "글자 그림자, 그라데이션 글자, 줄 수 제한을 만들고 CSS를 복사합니다.",
    learned: [
      "그라데이션 글자는 background에 그라데이션을 깔고 background-clip: text와 color: transparent를 함께 써야 한다.",
      "여러 줄 말줄임은 -webkit-box, -webkit-box-orient: vertical, line-clamp, overflow: hidden이 한 묶음으로 필요하다.",
    ],
    tech: ["text-shadow", "background-clip", "lib/textEffect.ts"],
  },
  {
    slug: "blend",
    category: "color",
    title: "Blend Mode",
    href: "/blend",
    summary: "두 색을 겹쳐 mix-blend-mode 16가지가 어떻게 섞이는지 봅니다.",
    learned: [
      "mix-blend-mode는 요소를 자기 뒤의 것과 섞는다. 섞임을 한 영역 안으로 가두려면 부모에 isolation: isolate를 준다.",
      "multiply는 항상 어두워지고 screen은 항상 밝아지며, overlay는 아래 층의 밝기에 따라 둘을 오간다.",
    ],
    tech: ["mix-blend-mode", "lib/blend.ts"],
  },
  {
    slug: "scroll-snap",
    category: "shape",
    title: "Scroll Snap",
    href: "/scroll-snap",
    summary: "스크롤이 멈추는 지점을 정하는 scroll-snap 설정을 바꿔 봅니다.",
    learned: [
      "scroll-snap-type은 컨테이너에, scroll-snap-align은 아이템에 써야 하고, mandatory는 항상 붙고 proximity는 가까울 때만 붙는다.",
      "스크롤 컨테이너는 키보드로도 움직일 수 있게 tabindex와 이름을 주어 포커스를 받게 한다.",
    ],
    tech: ["scroll-snap", "lib/scrollSnap.ts"],
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
  {
    slug: "clip-path",
    category: "shape",
    title: "Clip Path",
    href: "/clip-path",
    summary: "꼭짓점을 끌어 옮겨 polygon 모양을 만들고 CSS를 복사합니다.",
    learned: [
      "polygon()의 좌표는 요소 상자 기준 퍼센트라서 크기가 바뀌어도 모양이 유지되고, 점은 쓴 순서대로 이어져 마지막에서 처음으로 닫힌다.",
      "clip-path는 보이는 부분만 자르고 상자 자체는 그대로 남는다. 잘려 나간 영역은 클릭도 받지 않는다.",
    ],
    tech: ["clip-path", "Pointer Events", "lib/clipPath.ts"],
  },
  {
    slug: "fluid-type",
    category: "type",
    title: "Fluid Type",
    href: "/fluid-type",
    summary: "화면 너비에 따라 부드럽게 변하는 글자 크기 clamp() 값을 계산합니다.",
    learned: [
      "clamp(최소, 선호값, 최대)에서 선호값은 `절편 + 기울기 × vw`로, 두 지점(최소 너비의 최소 크기, 최대 너비의 최대 크기)을 지나는 직선이다.",
      "vw만 쓰면 글자 크기를 키운 사용자의 설정이 무시되므로 선호값에 rem 절편을 섞어 확대가 반영되게 한다.",
    ],
    tech: ["clamp()", "rem·vw", "lib/fluidType.ts"],
  },
  {
    slug: "color-converter",
    category: "color",
    title: "Color Converter",
    href: "/color-converter",
    summary: "HEX, RGB, HSL, OKLCH 표기를 서로 바꾸고 CSS를 복사합니다.",
    learned: [
      "OKLCH는 밝기(L), 채도(C), 색상(H)을 사람이 느끼는 방식에 가깝게 나눈 표기라서, 밝기만 바꿔도 색이 탁해지거나 다른 색으로 보이지 않는다.",
      "OKLCH에는 일반 모니터(sRGB)가 표현하지 못하는 색도 있다. 이때 HEX 같은 표기는 가까운 값으로 잘라 내므로 되돌려도 원래 색이 아니다.",
    ],
    tech: ["OKLab", "color-space", "lib/colorConvert.ts"],
  },
  {
    slug: "scroll-trigger",
    category: "motion",
    title: "Scroll Trigger",
    href: "/scroll-trigger",
    summary: "스크롤 위치에 맞춰 요소가 움직이는 GSAP ScrollTrigger 설정을 만듭니다.",
    learned: [
      "start: \"top 80%\"는 요소의 위쪽이 스크롤 영역 위에서 80% 지점에 닿을 때 시작한다는 뜻이다. 앞 단어는 요소의 기준선, 뒤 값은 화면의 기준선이다.",
      "scrub을 켜면 애니메이션이 시간이 아니라 스크롤 위치를 따라가고, 숫자를 주면 그 초만큼 뒤따라 부드럽게 움직인다. 이때 이징은 none으로 둬야 스크롤과 움직임이 어긋나 보이지 않는다.",
      "움직이는 요소 자신을 trigger로 쓰면, 이동한 만큼 요소의 위치가 바뀌어 시작 지점이 밀린다. 움직이지 않는 부모를 trigger로 쓰는 게 안전하다.",
    ],
    tech: ["GSAP ScrollTrigger", "useGSAP", "lib/scrollTrigger.ts"],
  },
  {
    slug: "svg-shape",
    category: "shape",
    title: "Wave & Blob",
    href: "/svg-shape",
    summary: "SVG 웨이브와 블롭 모양을 만들고 코드를 복사합니다.",
    learned: [
      "웨이브는 마루와 골을 3차 베지어(C)로 잇는다. 조절점을 구간 가운데에 두면 부드러운 곡선, 끝점에 붙이면 직선이 된다. 처음과 끝 높이를 같게 하면 가로로 이어 붙여도 이음새가 없다.",
      "블롭은 원 위의 점들의 반지름만 조금씩 줄여서 만들고, 그 점들을 지나는 닫힌 곡선은 Catmull-Rom을 베지어로 바꿔 그린다. 난수에 시드를 쓰면 같은 모양을 다시 만들 수 있다.",
    ],
    tech: ["SVG path", "Bézier", "lib/svgShape.ts"],
  },
  {
    slug: "linear-easing",
    category: "motion",
    title: "Linear Easing",
    href: "/linear-easing",
    summary: "바운스와 스프링 같은 움직임을 CSS linear() 이징으로 만듭니다.",
    learned: [
      "linear()는 값 목록을 같은 간격의 직선으로 이어서 곡선을 흉내 낸다. 점이 많을수록 원래 곡선에 가깝지만 코드가 길어진다.",
      "cubic-bezier는 0~1 사이의 부드러운 곡선만 쉽게 만들지만, linear()는 값이 1을 넘었다가 돌아오는 바운스와 스프링도 표현한다.",
    ],
    tech: ["CSS linear()", "SVG", "lib/linearEasing.ts"],
  },
  {
    slug: "type-scale",
    category: "type",
    title: "Type Scale",
    href: "/type-scale",
    summary: "기준 크기와 비율로 글자 크기 단계를 만들고 CSS 변수로 복사합니다.",
    learned: [
      "글자 크기를 하나씩 정하지 않고 기준 크기에 같은 비율을 거듭 곱하면(base × ratio^step) 단계 사이의 간격이 일정해서 위계가 자연스럽다.",
      "비율이 작으면 단계가 촘촘해 본문 위주의 화면에, 크면 제목이 확 커져서 강한 대비가 필요한 화면에 어울린다. 단계가 늘수록 맨 끝은 금방 너무 커지거나 작아진다.",
    ],
    tech: ["CSS variables", "rem", "lib/typeScale.ts"],
  },
  {
    slug: "grain",
    category: "color",
    title: "Grain",
    href: "/grain",
    summary: "SVG 노이즈로 종이나 필름 같은 질감을 만들고 CSS로 복사합니다.",
    learned: [
      "feTurbulence는 이미지 없이 노이즈를 만든다. baseFrequency가 클수록 알갱이가 곱고, numOctaves를 늘리면 크고 작은 알갱이가 겹쳐 더 복잡해진다.",
      "SVG를 데이터 주소로 CSS에 넣을 때는 <, >, #, %를 인코딩해야 한다. 특히 %를 먼저 %25로 바꾸지 않으면 뒤따르는 글자와 합쳐져 다르게 해석될 수 있다.",
    ],
    tech: ["SVG filter", "mix-blend-mode", "lib/grain.ts"],
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

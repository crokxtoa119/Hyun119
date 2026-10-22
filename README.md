# SketchCraft

디자인과 인터랙션을 직접 만들어 보며 익히는 **학습용 실험 사이트**입니다.
색, 모양과 레이아웃, 글자, 모션처럼 웹 디자인에서 자주 만지는 값을 슬라이더로 조절하고, 결과를 바로 보고, CSS를 복사할 수 있습니다.

**라이브 사이트:** https://hyun119.vercel.app

## 실험 도구 22개

도구 목록은 `/experiments`에서 분류별로 볼 수 있고, 목록의 원본은 [`src/lib/experiments.ts`](src/lib/experiments.ts)입니다. 홈 카드, 실험 목록, 기록 페이지, 사이트맵이 모두 이 한 곳을 읽습니다.

### 색

| 도구 | 경로 | 할 수 있는 것 |
|---|---|---|
| Color Palette | `/palette` | 기준 색(HSL)과 배색 규칙(유사색, 보색, 삼각 배색, 분할 보색, 단색 명도)으로 5색 팔레트 생성, HEX 복사, CSS 변수 출력 |
| Gradient Editor | `/gradient` | 선형/원형/원뿔 그라디언트, 색 정지점 2~5개 편집, CSS 복사 |
| Contrast Checker | `/contrast` | 글자색과 배경색의 명암비 계산, WCAG AA·AAA 통과 여부, AA를 넘는 글자색 자동 보정 |
| Filter | `/filter` | `blur`, `brightness`, `contrast` 등 8가지 `filter` 함수 조합, 원본과 나란히 비교, 효과 없는 함수는 CSS에서 생략 |
| Blend Mode | `/blend` | 두 색을 겹쳐 `mix-blend-mode` 16가지가 섞이는 모습 확인, 모드별 설명 |
| Color Converter | `/color-converter` | HEX, RGB, HSL, OKLCH 중 아무 표기로 입력해 나머지로 변환, sRGB 밖의 색 안내 |

### 모양·레이아웃

| 도구 | 경로 | 할 수 있는 것 |
|---|---|---|
| Shadow & Glass | `/shadow` | `box-shadow`와 글래스모피즘(`backdrop-filter`) 값 조절, CSS 복사 |
| Border Radius | `/radius` | 모서리 여덟 값(가로/세로)으로 덩어리 모양 만들기, 가로·세로 같게 연동, 랜덤 덩어리 |
| Flexbox | `/flexbox` | 방향, 줄바꿈, `justify-content`, `align-items`, 간격, 아이템 수를 바꾸며 동작 확인 |
| Grid | `/grid` | 고정 열 또는 `auto-fit` 열, 행 높이, 열·행 간격, 정렬, 첫 아이템 2칸 차지 |
| Scroll Snap | `/scroll-snap` | 축, `mandatory`/`proximity`, 정렬, 아이템 크기, `scroll-padding`을 바꿔 보며 스크롤 멈춤 확인 |
| Clip Path | `/clip-path` | 꼭짓점(3~12개)을 끌거나 방향키로 옮겨 `polygon()` 만들기, 점 추가·삭제, 기본 모양 9가지 |
| Wave & Blob | `/svg-shape` | 이어 붙여도 끊기지 않는 SVG 웨이브와 시드로 고정되는 블롭 생성, SVG 코드 복사·저장 |

### 글자

| 도구 | 경로 | 할 수 있는 것 |
|---|---|---|
| Typography Playground | `/typography` | 폰트 7종(한글 폰트 2종 포함)의 크기, 굵기, 자간, 행간, 정렬 조절, CSS 복사 |
| Text Effects | `/text-effects` | 글자 그림자, 그라데이션 글자, 여러 줄 말줄임 |
| Fluid Type | `/fluid-type` | 최소·최대 글자 크기와 화면 너비로 `clamp()` 계산, 너비별 크기 그래프와 표, 미리보기 너비 조절 |

### 모션

| 도구 | 경로 | 할 수 있는 것 |
|---|---|---|
| Easing Visualizer | `/easing` | GSAP 이징 10종 × 방향 3종의 곡선 그래프와 실제 움직임 비교, GSAP 코드 복사 |
| Timeline Editor | `/timeline` | 트윈 최대 3개로 GSAP 타임라인을 만들고, 막대 그래프와 재생 위치 슬라이더로 확인, 코드 복사 |
| Keyframes | `/keyframes` | 세 개의 키프레임(이동, 회전, 크기, 투명도)과 시간, 이징, 반복, 방향으로 CSS 애니메이션 생성, 재생·일시정지 |
| Transform | `/transform` | 이동, 회전, 크기, 기울임, 3D 회전과 원근, 원래 자리를 점선 틀로 비교 |
| Scroll Trigger | `/scroll-trigger` | GSAP ScrollTrigger의 효과 4종, 한 번 재생/scrub, `start`·`end` 기준선과 부드러움을 스크롤 영역에서 확인, 코드 복사 |
| Linear Easing | `/linear-easing` | 바운스·스프링을 수식으로 만들어 CSS `linear()` 값으로 변환, 곡선 그래프와 실제 전환 비교, 점 개수 조절 |

### 모든 실험 페이지 공통 기능

- **프리셋**: 현재 설정에 이름을 붙여 이 브라우저에 저장하고(최대 12개), 눌러서 불러옵니다. 저장 위치는 `localStorage`입니다.
- **공유 링크**: 현재 설정을 주소(`#share=...`)에 담아 복사합니다. 링크로 들어오면 안내가 뜨고, "적용"을 눌렀을 때만 반영됩니다.
- **CSS 복사·저장**: 미리보기와 복사되는 코드는 같은 값에서 만들어집니다. 코드 블록의 "저장"은 보이는 코드를 `도구이름-날짜.css`(GSAP 코드는 `.js`) 파일로 내려받으며, 파일은 브라우저 안에서만 만듭니다. 새 도구의 `CodeBlock`에는 `file` 속성을 넣어야 하고, 빠뜨리면 테스트가 실패합니다.

## 그 밖의 페이지와 기능

- **홈 `/`**: GSAP 인트로, 스크롤하면 히어로가 위로 밀리며 흐려지는 효과, 화면 중앙에 온 실험 항목 강조, 마우스에서만 쓰이는 자석 버튼. "움직임 줄이기" 설정이면 모두 꺼집니다.
- **실험 목록 `/experiments`**: 색, 모양·레이아웃, 글자, 모션으로 묶은 도구 목록.
- **실험 기록 `/log`, `/log/[slug]`**: 도구마다 무엇을 배웠는지 적은 기록과 이전/다음 이동.
- **내 기록판 `/record`**: 도구별로 연 횟수, 마지막으로 연 날, 저장한 프리셋 수와 써 본 도구 수, 방문한 날, 연속 방문일을 보여 줍니다. 도구 페이지를 열 때마다 이 브라우저의 localStorage(`sc-activity`)에만 기록하고 서버로 보내지 않으며, 검색 결과에는 올리지 않습니다(`noindex`, 사이트맵 제외). 페이지 안의 버튼으로 기록을 지울 수 있고, 프리셋 백업에는 포함되지 않습니다.
- **설정 모달**: 헤더의 "설정"에서 테마(Auto, Light, Dark), 강조 컬러, 페이지 전환 효과 켜기/끄기, 저장된 프리셋 삭제, 프리셋 백업. 테마는 저장되고 첫 화면이 깜빡이지 않도록 렌더링 전에 적용되며, 바꿀 때 누른 버튼에서 원이 퍼집니다.
- **강조 컬러**: 기본(흑백)과 인디고·청록·초록·주황·분홍·빨강 중에서 고릅니다. 선택한 칩, 슬라이더, 레이아웃·모션 도구의 미리보기 도형, 홈의 진행 바와 버튼, 현재 메뉴 밑줄, 키보드 포커스 링에 쓰이고, 라이트와 다크에서 각각 글자 4.5:1, 배경 3:1 이상이 되도록 정해 둔 색만 있습니다(테스트가 검사). 자유 색상 선택은 대비가 깨질 수 있어 두지 않았습니다. 값은 `accentPalette.ts`와 `globals.css`에 있고, 두 곳이 어긋나면 `accent.test.ts`가 실패합니다.
- **프리셋 백업**: 설정 모달에서 모든 도구의 프리셋을 JSON 파일 하나로 내려받고(`sketchcraft-presets-날짜.json`), 그 파일로 복원합니다. 가져올 때 "합치기"(기존 유지, 같은 이름과 내용은 건너뜀) 또는 "덮어쓰기"(파일에 들어 있는 도구만 파일 내용으로 교체, 확인 창을 거침)를 고릅니다. 파일은 브라우저 안에서만 처리하고 서버로 보내지 않습니다.
- **도구 모달과 단축키**: 헤더의 "도구"(또는 `Ctrl+K`, Mac은 `⌘K`)로 검색과 분류 탭이 있는 도구 선택 모달을 엽니다. 한 글자 단축키는 `[` `]`(이전·다음 도구), `,`(설정), `?`(도움말)이고, 목록의 원본은 `src/lib/shortcuts.ts`입니다. 입력 중이거나 모달이 열려 있거나 Ctrl·⌘·Alt를 함께 누르면 동작하지 않고, 설정에서 끌 수 있습니다(`Ctrl+K`는 계속 동작).
- **햅틱 피드백**: 복사, 저장, 프리셋 저장, 도구 이동, 테마·강조 컬러 변경에서 짧게 진동합니다. Vibration API를 지원하는 기기(주로 Android의 Chrome)에서만 동작하고, 설정에서 끌 수 있으며 "움직임 줄이기"에서는 진동하지 않습니다.
- **페이지 전환**: 링크를 누르면 GSAP 커튼이 화면을 덮고 새 페이지에서 걷힙니다. 시스템의 "움직임 줄이기" 설정이면 전환 없이 이동합니다.
- **검색 노출(SEO)**: 페이지별 제목과 설명, `sitemap.xml`, `robots.txt`, 공유 미리보기 이미지(Open Graph). 사이트 주소는 환경 변수 `NEXT_PUBLIC_SITE_URL`(기본 `https://hyun119.vercel.app`)로 바꿉니다.
- **접근성**: 본문으로 건너뛰기 링크, 모든 입력의 라벨, 키보드 포커스 표시, 4.5:1 이상의 글자 대비, 24px 이상의 조작 영역을 지향합니다. Lighthouse 접근성 100점으로 측정했습니다(홈, Contrast, Radius, 새 도구 7개와 `/experiments`).

## 기술 스택

- [Next.js](https://nextjs.org) 16.4 (App Router, Cache Components) · React 19 · TypeScript
- [Tailwind CSS](https://tailwindcss.com) 4
- [GSAP](https://gsap.com) 3 + `@gsap/react` (`useGSAP`), ScrollTrigger
- 테스트: [Vitest](https://vitest.dev) 5 + jsdom + Testing Library
- 배포: [Vercel](https://vercel.com) (`main` 브랜치에 푸시하면 자동 배포)

## 시작하기

Node.js 20.9 이상이 필요합니다(Next.js 요구 사항).

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 빌드 결과 실행 |
| `npm run lint` | ESLint |
| `npm test` | 단위 테스트 1회 실행 (Vitest) |
| `npm run test:watch` | 파일을 저장할 때마다 테스트를 다시 실행 |

## 테스트

도구마다 값을 만들고 검증하는 로직은 `src/lib`의 순수 함수로 분리해서 테스트합니다. 테스트 파일은 대상 파일 옆에 `*.test.ts(x)`로 둡니다.

| 파일 | 확인하는 것 |
|---|---|
| `color.test.ts` | HSL→HEX 변환, 글자색 대비 선택, `rgba` 변환, 배색 5종의 규칙과 값 범위 |
| `contrast.test.ts` | hex 정규화, 상대 휘도와 명암비(알려진 값), 등급 경계, 내림 표시, 자동 보정 |
| `radius.test.ts` · `flex.test.ts` · `grid.test.ts` · `scrollSnap.test.ts` · `clipPath.test.ts` · `fluidType.test.ts` · `colorConvert.test.ts` | 값 보정(범위, 정수), CSS 생성(기본값 생략 규칙), 불러온 데이터 검증 |
| `filter.test.ts` · `transform.test.ts` · `textEffect.test.ts` · `blend.test.ts` · `keyframes.test.ts` | 같은 항목, 그리고 함수 순서, 3D일 때만 `perspective`, 색 형식, 모드별 설명 누락 방지 |
| `timeline.test.ts` | 타임라인 트윈 검증, 범위 보정, 총 길이, GSAP 코드 생성 |
| `experiments.test.ts` | 실험 목록의 슬러그·경로 규칙, 분류와 묶기, 이전/다음 이동 |
| `shareLink.test.tsx` | 공유 링크 인코딩 왕복(한글, 이모지), 깨진·변조·과대 입력 거부 |
| `usePresets.test.tsx` | 저장·삭제·최대 12개, 손상된 저장 데이터와 `localStorage` 차단 처리 |
| `presetBackup.test.ts` | 백업 파일 만들기와 읽기 왕복, 큰 파일·깨진 JSON·다른 앱 파일·다른 버전 거부, 알 수 없는 도구와 형식이 틀린 항목 건너뛰기, 이름 20자 제한, 도구당 12개 한도, 합치기·덮어쓰기 규칙, 저장소 연동과 차단 처리 |
| `presetRegistry.test.ts` | 프리셋 도구 목록이 실험 목록과 일치하는지, 저장 키 규칙, 컴포넌트가 실제로 쓰는 `usePresets` 키와 일치하는지(소스를 읽어 비교) |
| `motion.test.tsx` · `settings.test.tsx` | "움직임 줄이기" 설정, 테마와 전환 효과 설정, 프리셋 전체 삭제 |
| `download.test.ts` · `CodeBlock.test.tsx` | 코드 파일 이름과 내려받기, 모든 도구의 코드 블록에 저장 연결 |
| `ClipPathMaker.test.tsx` | 방향키 이동(1칸·Shift 10칸), 범위 제한, 점 추가·삭제와 개수 한도, 모양 칩 |
| `ColorConverter.test.tsx` | 표기 변환 결과, 잘못된 입력 처리, 예시 칩, sRGB 밖의 색 안내 |
| `FluidTypePlayground.test.tsx` | 기본 `clamp()` 출력, 최소가 최대를 넘을 때와 너비가 뒤집힐 때의 보정, 표 행 수 |
| `accent.test.ts` | 강조 컬러별 명암비(라이트·다크), CSS와 목록 일치, 저장과 복원 |
| `activityLog.test.ts` · `RecordBoard.test.tsx` | 방문 기록 쌓기, 연속 방문 계산(어제까지 이어짐, 쉬면 0, 월·연 경계), 손상된 저장값 복구, 기록판 표시와 지우기 |
| `app/seo.test.ts` | 사이트맵 주소(모두 절대 주소, 중복 없음), `robots` |
| `app/log/log.test.tsx` · `app/experiments/experiments.test.tsx` · `components/home.test.tsx` | 기록·목록·홈이 공용 데이터를 순서대로 보여주는지, 링크와 접근성 속성 |

초기에 만든 단위 테스트(`color`, `shareLink`, `usePresets`, `motion`)는 소스에 버그를 일부러 11가지 넣었을 때(반올림 방식 변경, 검증 생략, 길이 제한 변경 등) 매번 정확히 1개 테스트가 실패하는 것을 확인했습니다. 이후 추가한 테스트에는 이 확인을 하지 않았습니다.

화면 컴포넌트의 상호작용은 대부분(슬라이더, GSAP 연출, 페이지 전환, Clip Path의 마우스 드래그) 단위 테스트가 없고 브라우저에서 직접 확인했습니다.

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml)이 `main`에 푸시하거나 PR을 열 때마다 GitHub Actions에서 아래 순서로 실행합니다.

1. `npm ci` (`package-lock.json` 기준 설치)
2. `npm run lint`
3. `npm test`
4. `npm run build` (타입 검사 포함)

- 같은 브랜치에 새 푸시가 오면 이전 실행은 취소합니다.
- Vercel 배포와는 **별개**입니다. CI가 실패해도 Vercel은 그대로 배포하니, 푸시한 뒤 저장소의 **Actions** 탭에서 결과를 확인하세요. 실패 시 배포를 막으려면 GitHub 브랜치 보호 규칙과 Vercel 설정이 따로 필요합니다.
- 로컬에서 같은 결과를 보려면 `npm ci && npm run lint && npm test && npm run build`를 실행하세요.

## 폴더 구조

```
src/
├─ app/                      라우트 (페이지마다 얇은 page.tsx + 메타데이터)
│  ├─ layout.tsx             공통 레이아웃: 헤더, 테마 초기화 스크립트, 페이지 전환, 공통 메타데이터
│  ├─ globals.css            테마 변수(라이트/다크)와 전역 스타일
│  ├─ sitemap.ts · robots.ts · opengraph-image.tsx   검색 노출용 파일 라우트
│  ├─ experiments/ · log/ (+ log/[slug]) · record/   목록, 기록, 내 기록판 페이지
│  └─ palette · gradient · contrast · color-converter · filter · blend · shadow · radius · flexbox · grid ·
│     scroll-snap · clip-path · typography · text-effects · fluid-type · easing · timeline ·
│     keyframes · transform · scroll-trigger · svg-shape · linear-easing/
├─ components/
│  ├─ *Generator/Editor/Visualizer/Playground/Checker.tsx   실험 페이지 본체 (클라이언트 컴포넌트)
│  ├─ HeroIntro.tsx · HomeSections.tsx              홈 화면 (GSAP 인트로, ScrollTrigger)
│  ├─ PageTransition.tsx     커튼 전환 Provider와 TransitionLink
│  ├─ SettingsDialog.tsx     설정 모달 (테마, 강조 컬러, 전환 효과, 프리셋 삭제, 백업)
│  ├─ PresetBackup.tsx       프리셋 내보내기·가져오기 영역
│  └─ ui/                    공통 부품: Chip, Slider, CodeBlock, PresetBar, Share
└─ lib/
   ├─ experiments.ts         실험 목록과 분류 (홈, 목록, 기록, 사이트맵의 원본)
   ├─ site.ts                사이트 이름, 설명, 주소
   ├─ color.ts · contrast.ts · radius.ts · flex.ts · grid.ts · scrollSnap.ts ·
   │  filter.ts · transform.ts · textEffect.ts · blend.ts · keyframes.ts · timeline.ts ·
   │  clipPath.ts · fluidType.ts · colorConvert.ts
   │                         도구별 값 보정, 검증, CSS/코드 생성 (순수 함수)
   ├─ fonts.ts               next/font 설정 (한글 폰트는 preload 끔)
   ├─ useCopy.ts             클립보드 복사 훅
   ├─ download.ts            코드 파일 이름 만들기와 내려받기
   ├─ usePresets.ts          localStorage 프리셋 훅 (형식 검증 포함), 훅 밖 읽기·쓰기 함수
   ├─ presetValidators.ts    도구별 프리셋 타입 가드 (화면 코드와 분리한 순수 모듈)
   ├─ presetRegistry.ts      프리셋을 저장하는 도구 목록 (설정 모달과 백업이 공유)
   ├─ presetBackup.ts        프리셋 백업 파일 만들기, 검증, 합치기·덮어쓰기
   ├─ shareLink.ts           공유 링크 인코딩/디코딩 훅
   ├─ theme.ts · settings.ts 테마와 전환 효과 설정 저장
   ├─ accentPalette.ts · accent.ts 강조 컬러 목록(서버·클라이언트 공용)과 저장
   ├─ activityLog.ts · activity.ts 방문 기록 계산(순수 함수)과 localStorage 저장·훅
   ├─ motion.ts              "움직임 줄이기" 설정 확인
   └─ *.test.ts(x)           단위 테스트 (Vitest 설정: vitest.config.mts)
```

## 새 도구를 추가하려면

1. `src/lib/<이름>.ts`에 상태 타입, 기본값, 범위 보정(`clamp`), CSS 생성, 타입 가드(`is...State`)를 만들고 옆에 테스트를 둡니다.
2. `src/components/<이름>.tsx`(클라이언트 컴포넌트)와 `src/app/<경로>/page.tsx`(메타데이터)를 만듭니다. `usePresets`, `SharedNotice`를 쓰고, 배치는 `components/ui/ToolLayout.tsx`의 `ToolPage`(제목과 설명, 바깥 틀), `ToolControls`(조절판 격자), `ToolFooter`(프리셋, 공유 링크, 코드)로 맞춥니다. 너비, 간격, 두 열이 되는 화면 크기(md)가 모든 도구에서 같도록 직접 `div`로 틀을 만들지 않습니다. 코드 블록의 `file`은 `ToolFooter`의 `code` 속성에 넣습니다.
3. `src/lib/experiments.ts`의 `EXPERIMENTS`에 항목(슬러그, 분류, 제목, 요약, 배운 점, 기술)을 추가합니다. 홈, 목록, 기록, 사이트맵에 자동으로 나타납니다. 슬러그는 `/경로`와 같아야 합니다.
4. `src/lib/presetRegistry.ts`의 `PRESET_TOOLS`에 슬러그, 표시 이름, 타입 가드를 추가합니다. 저장 키는 `sc-<슬러그>-presets`로 정해지고, 설정 모달의 개수 표시와 삭제, 프리셋 백업이 모두 이 목록을 씁니다. 빠뜨리거나 컴포넌트의 키와 다르면 `presetRegistry.test.ts`가 실패합니다.

## 구현 메모

- **저장된 값과 공유 링크는 믿지 않습니다.** 프리셋과 공유 데이터는 도구마다 가진 타입 가드로 검증하고, 불러올 때 슬라이더 범위로 값을 보정합니다. 깨졌거나 다른 페이지의 데이터, 지나치게 긴 링크는 무시됩니다.
- **서버 렌더링과 `localStorage`**: `useSyncExternalStore`로 읽어서, 서버 HTML과 클라이언트 첫 렌더가 달라 생기는 hydration 경고를 피합니다.
- **Cache Components**: `/log/[slug]`는 `generateStaticParams`로 미리 만들고, 주소의 값(`params`)은 `<Suspense>` 안에서 읽어 페이지 이동이 즉시 일어나게 합니다. Cache Components에서는 `dynamicParams`를 쓸 수 없어 없는 슬러그는 `notFound()`로 처리합니다.
- **글자 대비**: 글자를 흐리게 하려고 불투명도를 낮추면 4.5:1 대비를 지키기 어려워서, 강조는 막대와 이동으로 표현합니다.
- **페이지 전환**: `next/link`의 `onNavigate`에서 이동을 막고 커튼 애니메이션이 끝난 뒤 `router.push`합니다. Ctrl+클릭 같은 일반 링크 동작과 같은 페이지의 `#앵커` 이동은 그대로 둡니다.
- **한글 폰트**: Noto Sans/Serif KR은 글자 조각이 많아 `preload: false`로 두어, 화면에 쓰인 글자만 필요할 때 받습니다. 나머지 폰트에는 한글이 없어 시스템 폰트로 대체됩니다.

## 알려진 사항

- 프리셋은 브라우저별로 저장되며 기기 간에 자동으로 동기화되지 않습니다. 옮길 때는 설정 모달의 프리셋 백업을, 하나만 나눌 때는 공유 링크를 쓰세요.
- 클립보드 복사는 HTTPS(또는 `localhost`)에서만 동작합니다.
- Text Effects의 그라데이션 글자와 줄 수 제한은 `-webkit-` 접두사가 붙은 속성을 함께 씁니다. 복사한 CSS에도 그대로 들어 있습니다.
- 개발 서버를 켜 둔 채 `npm run build`를 돌리면 개발 서버가 오래된 CSS를 내보내는 일이 있었습니다. 이상하면 개발 서버를 멈추고 `.next` 폴더를 지운 뒤 다시 시작하세요.
- `npm audit`이 개발 의존성에서 고위험 5건을 알려 줍니다. 모두 `eslint-config-next` → `braces` 체인(린트 도구)에서 오며 운영 의존성은 0건입니다. `npm audit fix --force`는 Next 14용 설정으로 내리는 파괴적 변경이라 적용하지 않았습니다.
- 이 저장소의 `AGENTS.md`는 `next dev`가 자동으로 만드는 파일로, 이 Next.js 버전이 기존 지식과 다를 수 있다는 안내가 들어 있습니다.

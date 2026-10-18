# SketchCraft

디자인과 인터랙션을 직접 만들어 보며 익히는 **학습용 실험 사이트**입니다.
색, 그라디언트, 이징, 타이포그래피, 그림자처럼 웹 디자인에서 자주 만지는 값을 슬라이더로 조절하고, 결과를 바로 보고, CSS를 복사할 수 있습니다.

**라이브 사이트:** https://hyun119.vercel.app

## 실험 페이지

| 페이지 | 경로 | 할 수 있는 것 |
|---|---|---|
| Color Palette | `/palette` | 기준 색(HSL)과 배색 규칙(유사색, 보색, 삼각 배색, 분할 보색, 단색 명도)으로 5색 팔레트 생성, HEX 복사, CSS 변수 출력 |
| Gradient Editor | `/gradient` | 선형/원형/원뿔 그라디언트, 색 정지점 2~5개 편집, CSS 복사 |
| Easing Visualizer | `/easing` | GSAP 이징 10종 × 방향 3종의 곡선 그래프와 실제 움직임 비교, GSAP 코드 복사 |
| Typography Playground | `/typography` | 폰트 7종(한글 폰트 2종 포함)의 크기, 굵기, 자간, 행간, 정렬 조절, CSS 복사 |
| Shadow & Glass | `/shadow` | `box-shadow`와 글래스모피즘(`backdrop-filter`) 값 조절, CSS 복사 |

### 모든 실험 페이지 공통 기능

- **프리셋**: 현재 설정에 이름을 붙여 이 브라우저에 저장하고(최대 12개), 눌러서 불러옵니다. 저장 위치는 `localStorage`입니다.
- **공유 링크**: 현재 설정을 주소(`#share=...`)에 담아 복사합니다. 링크로 들어오면 안내가 뜨고, "적용"을 눌렀을 때만 반영됩니다.
- **라이트/다크 테마**: 헤더의 버튼으로 Auto(시스템) → Light → Dark를 순환합니다. 선택은 저장되고, 첫 화면이 깜빡이지 않도록 렌더링 전에 적용됩니다.
- **페이지 전환**: 링크를 누르면 GSAP 커튼이 화면을 덮고 새 페이지에서 걷힙니다. 시스템의 "움직임 줄이기" 설정이면 전환 없이 이동합니다.

## 기술 스택

- [Next.js](https://nextjs.org) 16.4 (App Router) · React 19 · TypeScript
- [Tailwind CSS](https://tailwindcss.com) 4
- [GSAP](https://gsap.com) 3 + `@gsap/react` (`useGSAP`), ScrollTrigger
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

## 폴더 구조

```
src/
├─ app/                      라우트 (페이지마다 얇은 page.tsx + 메타데이터)
│  ├─ layout.tsx             공통 레이아웃: 헤더, 테마 초기화 스크립트, 페이지 전환
│  ├─ globals.css            테마 변수(라이트/다크)와 전역 스타일
│  └─ palette · gradient · easing · typography · shadow/
├─ components/
│  ├─ *Generator/Editor/Visualizer/Playground.tsx   실험 페이지 본체 (클라이언트 컴포넌트)
│  ├─ HeroIntro.tsx · HomeSections.tsx              홈 화면 (GSAP 인트로, ScrollTrigger)
│  ├─ PageTransition.tsx     커튼 전환 Provider와 TransitionLink
│  ├─ ThemeToggle.tsx        테마 토글
│  └─ ui/                    공통 부품: Chip, Slider, CodeBlock, PresetBar, Share
└─ lib/
   ├─ color.ts               HSL/HEX 변환, 배색 규칙, 대비 색 계산
   ├─ fonts.ts               next/font 설정 (한글 폰트는 preload 끔)
   ├─ useCopy.ts             클립보드 복사 훅
   ├─ usePresets.ts          localStorage 프리셋 훅 (형식 검증 포함)
   └─ shareLink.ts           공유 링크 인코딩/디코딩 훅
```

## 구현 메모

- **저장된 값과 공유 링크는 믿지 않습니다.** 프리셋과 공유 데이터는 페이지마다 가진 타입 가드로 검증하고, 불러올 때 슬라이더 범위로 값을 보정합니다. 깨졌거나 다른 페이지의 데이터, 지나치게 긴 링크는 무시됩니다.
- **서버 렌더링과 `localStorage`**: `useSyncExternalStore`로 읽어서, 서버 HTML과 클라이언트 첫 렌더가 달라 생기는 hydration 경고를 피합니다.
- **페이지 전환**: `next/link`의 `onNavigate`에서 이동을 막고 커튼 애니메이션이 끝난 뒤 `router.push`합니다. Ctrl+클릭 같은 일반 링크 동작과 같은 페이지의 `#앵커` 이동은 그대로 둡니다.
- **한글 폰트**: Noto Sans/Serif KR은 글자 조각이 많아 `preload: false`로 두어, 화면에 쓰인 글자만 필요할 때 받습니다. 나머지 폰트에는 한글이 없어 시스템 폰트로 대체됩니다.

## 알려진 사항

- 프리셋은 브라우저별로 저장되며 기기 간에 동기화되지 않습니다. 다른 기기와 나눌 때는 공유 링크를 쓰세요.
- 클립보드 복사는 HTTPS(또는 `localhost`)에서만 동작합니다.
- 개발 서버를 켜 둔 채 `npm run build`를 돌리면 개발 서버가 오래된 CSS를 내보내는 일이 있었습니다. 이상하면 개발 서버를 멈추고 `.next` 폴더를 지운 뒤 다시 시작하세요.
- 이 저장소의 `AGENTS.md`는 `next dev`가 자동으로 만드는 파일로, 이 Next.js 버전이 기존 지식과 다를 수 있다는 안내가 들어 있습니다.

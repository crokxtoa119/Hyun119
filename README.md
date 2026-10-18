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

`src/lib`의 순수 로직과 훅을 테스트합니다. 테스트 파일은 대상 파일 옆에 `*.test.ts(x)`로 둡니다.

| 파일 | 확인하는 것 |
|---|---|
| `color.test.ts` | HSL→HEX 변환(원색, 반올림, 경계), 글자색 대비 선택, `rgba` 변환, 배색 5종의 색상 규칙과 값 범위 |
| `shareLink.test.tsx` | 공유 링크 인코딩 왕복(한글, 이모지, HTML 문자), 깨진·변조·과대 입력 거부, 해시 변화에 반응하는 훅 |
| `usePresets.test.tsx` | 저장·삭제·최대 12개·id 규칙, 손상된 저장 데이터와 `localStorage` 차단 상황 처리 |
| `motion.test.tsx` | "움직임 줄이기" 설정 읽기와 변경 반영, 리스너 정리 |

테스트가 실제로 버그를 잡는지도 확인했습니다. 소스에 버그를 일부러 11가지 넣었을 때(반올림 방식 변경, 검증 생략, 길이 제한 변경 등) 매번 정확히 1개 테스트가 실패했고, 원복하면 모두 통과합니다.

화면 컴포넌트(React 컴포넌트, GSAP 연출, 페이지 전환)는 단위 테스트가 없고 브라우저에서 직접 확인했습니다.

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
│  ├─ layout.tsx             공통 레이아웃: 헤더, 테마 초기화 스크립트, 페이지 전환
│  ├─ globals.css            테마 변수(라이트/다크)와 전역 스타일
│  └─ palette · gradient · easing · typography · shadow/
├─ components/
│  ├─ *Generator/Editor/Visualizer/Playground.tsx   실험 페이지 본체 (클라이언트 컴포넌트)
│  ├─ HeroIntro.tsx · HomeSections.tsx              홈 화면 (GSAP 인트로, ScrollTrigger)
│  ├─ PageTransition.tsx     커튼 전환 Provider와 TransitionLink
│  ├─ SettingsDialog.tsx     설정 모달 (테마, 전환 효과, 프리셋 삭제)
│  └─ ui/                    공통 부품: Chip, Slider, CodeBlock, PresetBar, Share
└─ lib/
   ├─ color.ts               HSL/HEX 변환, 배색 규칙, 대비 색 계산
   ├─ fonts.ts               next/font 설정 (한글 폰트는 preload 끔)
   ├─ useCopy.ts             클립보드 복사 훅
   ├─ usePresets.ts          localStorage 프리셋 훅 (형식 검증 포함)
   ├─ shareLink.ts           공유 링크 인코딩/디코딩 훅
   ├─ motion.ts              "움직임 줄이기" 설정 확인
   └─ *.test.ts(x)           단위 테스트 (Vitest 설정: vitest.config.mts)
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
- `npm audit`이 개발 의존성에서 고위험 5건을 알려 줍니다. 모두 `eslint-config-next` → `braces` 체인(린트 도구)에서 오며 운영 의존성은 0건입니다. `npm audit fix --force`는 Next 14용 설정으로 내리는 파괴적 변경이라 적용하지 않았습니다.
- 이 저장소의 `AGENTS.md`는 `next dev`가 자동으로 만드는 파일로, 이 Next.js 버전이 기존 지식과 다를 수 있다는 안내가 들어 있습니다.

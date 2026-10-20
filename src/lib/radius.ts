/** 각 모서리의 가로/세로 반지름(%). tl=왼쪽 위, tr=오른쪽 위, br=오른쪽 아래, bl=왼쪽 아래 순서로 CSS에 쓴다. */
export type Radius = {
  tlH: number;
  trH: number;
  brH: number;
  blH: number;
  tlV: number;
  trV: number;
  brV: number;
  blV: number;
};

export const RADIUS_KEYS = ["tlH", "trH", "brH", "blH", "tlV", "trV", "brV", "blV"] as const;

export const RADIUS_MIN = 0;
export const RADIUS_MAX = 100;

export const DEFAULT_RADIUS: Radius = {
  tlH: 30,
  trH: 70,
  brH: 70,
  blH: 30,
  tlV: 30,
  trV: 30,
  brV: 70,
  blV: 70,
};

const clamp = (n: number) => Math.min(RADIUS_MAX, Math.max(RADIUS_MIN, n));

/** 모든 값을 슬라이더 범위로 보정하고 정수로 맞춘다. 불러온 값이 범위를 벗어나도 안전하다. */
export function clampRadius(r: Radius): Radius {
  const out = { ...r };
  for (const k of RADIUS_KEYS) out[k] = Math.round(clamp(r[k]));
  return out;
}

/** 값 네 개가 모두 같으면 하나로 줄이고, 아니면 네 개를 그대로 쓴다. */
function fourValues(a: number, b: number, c: number, d: number): string {
  const px = (n: number) => `${n}%`;
  return a === b && b === c && c === d ? px(a) : [a, b, c, d].map(px).join(" ");
}

/** border-radius 선언을 만든다. 가로와 세로가 같으면 `/` 없이 짧게 쓴다. */
export function radiusToCss(r: Radius): string {
  const h = fourValues(r.tlH, r.trH, r.brH, r.blH);
  const v = fourValues(r.tlV, r.trV, r.brV, r.blV);
  return `border-radius: ${h === v ? h : `${h} / ${v}`};`;
}

/** 세로 값을 가로 값과 같게 만든다(원형에 가까운 대칭 모서리). */
export function linkVertical(r: Radius): Radius {
  return { ...r, tlV: r.tlH, trV: r.trH, brV: r.brH, blV: r.blH };
}

/** 부드러운 덩어리 모양. 모서리마다 30~70% 안에서 정하고 마주 보는 변의 합을 100%에 가깝게 둔다. */
export function randomBlob(rand: () => number = Math.random): Radius {
  const pick = () => Math.round(30 + rand() * 40);
  const pair = () => {
    const a = pick();
    return [a, 100 - a] as const;
  };
  const [tlH, trH] = pair();
  const [blH, brH] = pair();
  const [tlV, blV] = pair();
  const [trV, brV] = pair();
  return { tlH, trH, brH, blH, tlV, trV, brV, blV };
}

import { afterEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { buildShareUrl, decodeShare, encodeShare, useSharedData } from "@/lib/shareLink";
import { isFiniteNumber, isRecord } from "@/lib/usePresets";

afterEach(() => {
  window.history.replaceState(null, "", "/");
});

describe("encodeShare / decodeShare", () => {
  it("객체를 인코딩했다가 그대로 복원한다", () => {
    const data = { h: 300, s: 80, l: 40, harmony: "triadic" };
    expect(decodeShare(encodeShare(data))).toEqual(data);
  });

  it("한글, 이모지, HTML 문자, 따옴표를 깨뜨리지 않는다 (UTF-8)", () => {
    const data = { text: '안녕하세요 😀 <b>bold</b> & "quotes" \n 줄바꿈' };
    expect(decodeShare(encodeShare(data))).toEqual(data);
  });

  it("주소에 그대로 쓸 수 있는 문자(base64url)만 만든다", () => {
    // +, /, = 가 섞이기 쉬운 값을 여러 개 시도
    for (const n of [1, 62, 63, 255, 1024, 99999]) {
      const encoded = encodeShare({ n, pad: "?>?>?>".repeat(n % 7) });
      expect(encoded).toMatch(/^[A-Za-z0-9_-]*$/);
    }
  });

  it("빈 문자열과 깨진 입력은 null이다", () => {
    expect(decodeShare("")).toBeNull();
    expect(decodeShare("!!!not-base64!!!")).toBeNull();
  });

  it("base64는 맞지만 JSON이 아니면 null이다", () => {
    expect(decodeShare(btoa("hello world").replace(/=+$/, ""))).toBeNull();
  });

  it("너무 긴 입력은 해석하지 않고 null이다", () => {
    const tooLong = encodeShare({ text: "x".repeat(4000) });
    expect(tooLong.length).toBeGreaterThan(4000);
    expect(decodeShare(tooLong)).toBeNull();
    // 같은 형식의 짧은 값은 정상 해석된다
    expect(decodeShare(encodeShare({ text: "x" }))).toEqual({ text: "x" });
  });
});

describe("buildShareUrl", () => {
  it("현재 경로에 #share= 해시를 붙이고 쿼리와 기존 해시는 버린다", () => {
    window.history.pushState(null, "", "/palette?x=1#old");
    const url = buildShareUrl({ a: 1 });
    expect(url.startsWith("http://localhost:3000/palette#share=")).toBe(true);
    expect(url).not.toContain("x=1");
    expect(url).not.toContain("#old");
    expect(decodeShare(url.slice(url.indexOf("#share=") + "#share=".length))).toEqual({ a: 1 });
  });
});

type Sample = { n: number };
const isSample = (d: unknown): d is Sample => isRecord(d) && isFiniteNumber(d.n);

describe("useSharedData", () => {
  it("해시가 없으면 null이다", () => {
    const { result } = renderHook(() => useSharedData(isSample));
    expect(result.current.shared).toBeNull();
  });

  it("유효한 공유 해시를 읽는다", () => {
    window.location.hash = `#share=${encodeShare({ n: 5 })}`;
    const { result } = renderHook(() => useSharedData(isSample));
    expect(result.current.shared).toEqual({ n: 5 });
  });

  it("검증을 통과하지 못한 데이터는 null이다 (다른 페이지 데이터, 잘못된 타입)", () => {
    window.location.hash = `#share=${encodeShare({ n: "5" })}`;
    expect(renderHook(() => useSharedData(isSample)).result.current.shared).toBeNull();

    window.location.hash = `#share=${encodeShare({ other: true })}`;
    expect(renderHook(() => useSharedData(isSample)).result.current.shared).toBeNull();

    window.location.hash = "#share=!!!";
    expect(renderHook(() => useSharedData(isSample)).result.current.shared).toBeNull();
  });

  it("share가 아닌 해시는 무시한다", () => {
    window.location.hash = "#about";
    const { result } = renderHook(() => useSharedData(isSample));
    expect(result.current.shared).toBeNull();
  });

  it("마운트된 뒤 해시가 바뀌어도 반응한다", async () => {
    const { result } = renderHook(() => useSharedData(isSample));
    expect(result.current.shared).toBeNull();

    await act(async () => {
      window.location.hash = `#share=${encodeShare({ n: 9 })}`;
      await new Promise((r) => setTimeout(r, 30)); // jsdom은 hashchange를 비동기로 보낸다
    });
    expect(result.current.shared).toEqual({ n: 9 });
  });

  it("dismiss는 해시를 지우고 값을 null로 돌린다", () => {
    window.location.hash = `#share=${encodeShare({ n: 1 })}`;
    const { result } = renderHook(() => useSharedData(isSample));
    expect(result.current.shared).toEqual({ n: 1 });

    act(() => result.current.dismiss());
    expect(result.current.shared).toBeNull();
    expect(window.location.hash).toBe("");
  });
});

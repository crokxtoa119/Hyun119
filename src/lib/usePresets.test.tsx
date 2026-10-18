import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { MAX_PRESETS, isFiniteNumber, isRecord, usePresets } from "@/lib/usePresets";

type Sample = { n: number };
const isSample = (d: unknown): d is Sample => isRecord(d) && isFiniteNumber(d.n);

// 훅 내부 캐시가 키 단위라서, 테스트마다 다른 키를 써서 서로 영향을 주지 않게 한다
let seq = 0;
let key = "";
beforeEach(() => {
  localStorage.clear();
  key = `test-presets-${++seq}`;
});

const setup = () => renderHook(() => usePresets(key, isSample));
const stored = () => JSON.parse(localStorage.getItem(key) ?? "null");

describe("타입 확인 도우미", () => {
  it("isRecord는 일반 객체만 true", () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord({ a: 1 })).toBe(true);
    expect(isRecord(null)).toBe(false);
    expect(isRecord([])).toBe(false);
    expect(isRecord("x")).toBe(false);
    expect(isRecord(1)).toBe(false);
    expect(isRecord(undefined)).toBe(false);
  });

  it("isFiniteNumber는 유한한 숫자만 true", () => {
    expect(isFiniteNumber(0)).toBe(true);
    expect(isFiniteNumber(-1.5)).toBe(true);
    expect(isFiniteNumber(NaN)).toBe(false);
    expect(isFiniteNumber(Infinity)).toBe(false);
    expect(isFiniteNumber("1")).toBe(false);
    expect(isFiniteNumber(null)).toBe(false);
  });
});

describe("usePresets", () => {
  it("처음에는 비어 있다", () => {
    const { result } = setup();
    expect(result.current.presets).toEqual([]);
    expect(result.current.isFull).toBe(false);
  });

  it("저장하면 목록과 localStorage에 반영된다", () => {
    const { result } = setup();
    act(() => {
      result.current.save("내 설정", { n: 1 });
    });
    expect(result.current.presets).toEqual([{ id: "1", name: "내 설정", data: { n: 1 } }]);
    expect(stored()).toEqual([{ id: "1", name: "내 설정", data: { n: 1 } }]);
  });

  it("이름이 비면 '프리셋 N'으로 자동 지정하고, 앞뒤 공백은 지운다", () => {
    const { result } = setup();
    act(() => void result.current.save("", { n: 1 }));
    act(() => void result.current.save("   ", { n: 2 }));
    act(() => void result.current.save("  공백  ", { n: 3 }));
    expect(result.current.presets.map((p) => p.name)).toEqual(["프리셋 1", "프리셋 2", "공백"]);
  });

  it("id는 현재 최대 id + 1이라서 삭제 후에도 겹치지 않는다", () => {
    const { result } = setup();
    act(() => void result.current.save("a", { n: 1 }));
    act(() => void result.current.save("b", { n: 2 }));
    act(() => void result.current.save("c", { n: 3 }));
    expect(result.current.presets.map((p) => p.id)).toEqual(["1", "2", "3"]);

    act(() => result.current.remove("2"));
    act(() => void result.current.save("d", { n: 4 }));
    expect(result.current.presets.map((p) => p.id)).toEqual(["1", "3", "4"]);
  });

  it("삭제하면 목록과 localStorage에서 사라진다", () => {
    const { result } = setup();
    act(() => void result.current.save("a", { n: 1 }));
    act(() => void result.current.save("b", { n: 2 }));
    act(() => result.current.remove("1"));
    expect(result.current.presets.map((p) => p.name)).toEqual(["b"]);
    expect(stored()).toHaveLength(1);
  });

  it(`최대 ${MAX_PRESETS}개까지만 저장되고 가득 차면 false를 돌려준다`, () => {
    const { result } = setup();
    for (let i = 0; i < MAX_PRESETS; i++) {
      act(() => void result.current.save(`p${i}`, { n: i }));
    }
    expect(result.current.presets).toHaveLength(MAX_PRESETS);
    expect(result.current.isFull).toBe(true);

    let saved = true;
    act(() => {
      saved = result.current.save("넘침", { n: 99 });
    });
    expect(saved).toBe(false);
    expect(result.current.presets).toHaveLength(MAX_PRESETS);
    expect(result.current.presets.some((p) => p.name === "넘침")).toBe(false);

    act(() => result.current.remove("1"));
    expect(result.current.isFull).toBe(false);
  });

  it("같은 키를 쓰는 다른 훅 인스턴스에도 바로 반영된다", () => {
    const a = setup();
    const b = setup();
    act(() => void a.result.current.save("공유", { n: 7 }));
    expect(b.result.current.presets.map((p) => p.name)).toEqual(["공유"]);
  });

  it("다시 마운트해도 저장된 값을 읽는다 (새로고침 시나리오)", () => {
    const first = setup();
    act(() => void first.result.current.save("유지", { n: 5 }));
    first.unmount();

    const second = setup();
    expect(second.result.current.presets).toEqual([{ id: "1", name: "유지", data: { n: 5 } }]);
  });
});

describe("손상된 저장 데이터", () => {
  it("JSON이 깨졌으면 빈 목록이고, 이후 저장은 정상 동작한다", () => {
    localStorage.setItem(key, "{not json");
    const { result } = setup();
    expect(result.current.presets).toEqual([]);

    act(() => void result.current.save("복구", { n: 1 }));
    expect(result.current.presets.map((p) => p.name)).toEqual(["복구"]);
    expect(stored()).toHaveLength(1);
  });

  it("배열이 아니면 빈 목록이다", () => {
    localStorage.setItem(key, JSON.stringify({ not: "an array" }));
    expect(setup().result.current.presets).toEqual([]);
  });

  it("검증을 통과하지 못하는 항목만 걸러내고 나머지는 남긴다", () => {
    localStorage.setItem(
      key,
      JSON.stringify([
        { id: "1", name: "정상", data: { n: 1 } },
        { id: "2", name: "숫자 아님", data: { n: "x" } },
        { id: "3", name: "데이터 없음" },
        { id: 4, name: "id가 숫자", data: { n: 4 } },
        { id: "5", data: { n: 5 } },
        "garbage",
        null,
        42,
      ]),
    );
    const { result } = setup();
    expect(result.current.presets.map((p) => p.name)).toEqual(["정상"]);
  });

  it(`저장된 항목이 ${MAX_PRESETS}개를 넘어도 ${MAX_PRESETS}개까지만 읽는다`, () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ id: String(i + 1), name: `p${i}`, data: { n: i } }));
    localStorage.setItem(key, JSON.stringify(many));
    expect(setup().result.current.presets).toHaveLength(MAX_PRESETS);
  });
});

describe("localStorage를 쓸 수 없는 환경", () => {
  it("읽기가 막혀도 빈 목록으로 동작하고 예외를 던지지 않는다", () => {
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => setup()).not.toThrow();
    expect(setup().result.current.presets).toEqual([]);
    spy.mockRestore();
  });

  it("쓰기가 실패하면(용량 초과 등) 목록은 바뀌지 않고 예외도 없다", () => {
    const { result } = setup();
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(() => act(() => void result.current.save("실패", { n: 1 }))).not.toThrow();
    expect(result.current.presets).toEqual([]);
    spy.mockRestore();
  });
});

import { describe, expect, it } from "vitest";
import { FONTS, fontByKey } from "./fontOptions";
import { TYPOGRAPHY_FONT_KEYS } from "./presetValidators";

describe("FONTS", () => {
  it("프리셋 검증기가 허용하는 폰트 키와 같은 목록이다", () => {
    expect(FONTS.map((f) => f.key)).toEqual([...TYPOGRAPHY_FONT_KEYS]);
  });

  it("굵기 범위가 올바르고 미리보기용·복사용 이름이 모두 있다", () => {
    for (const f of FONTS) {
      expect(f.wMin).toBeGreaterThanOrEqual(100);
      expect(f.wMax).toBeLessThanOrEqual(900);
      expect(f.wMin).toBeLessThan(f.wMax);
      expect(f.stack).toMatch(/^var\(--font-[a-z-]+\), (sans-serif|serif|monospace)$/);
      expect(f.cssName).toMatch(/^"[^"]+", (sans-serif|serif|monospace)$/);
    }
  });
});

describe("fontByKey", () => {
  it("키에 맞는 폰트를 돌려주고 모르는 키는 첫 폰트로 돌린다", () => {
    expect(fontByKey("playfair").label).toBe("Playfair Display");
    expect(fontByKey("없는키")).toBe(FONTS[0]);
  });
});

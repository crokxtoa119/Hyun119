import { afterEach, describe, expect, it, vi } from "vitest";
import { codeFilename, downloadText, localDateStamp } from "./download";

describe("localDateStamp / codeFilename", () => {
  it("사용자 시간대의 날짜를 0으로 채워 쓴다", () => {
    expect(localDateStamp(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
    expect(localDateStamp(new Date(2026, 9, 20, 0, 0))).toBe("2026-10-20");
  });

  it("도구 이름, 날짜, 확장자로 파일 이름을 만든다", () => {
    expect(codeFilename("gradient", "css", new Date(2026, 9, 20))).toBe("gradient-2026-10-20.css");
    expect(codeFilename("easing", "js", new Date(2026, 9, 20))).toBe("easing-2026-10-20.js");
  });
});

describe("downloadText", () => {
  afterEach(() => vi.restoreAllMocks());

  it("파일 이름으로 링크를 눌러 내려받고 임시 주소를 정리한다", () => {
    const create = vi.fn(() => "blob:x");
    const revoke = vi.fn();
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe("a-2026-10-20.css");
      expect(this.href).toBe("blob:x");
    });

    downloadText("a-2026-10-20.css", ".a { color: red; }", "css");

    expect(click).toHaveBeenCalledTimes(1);
    expect(revoke).toHaveBeenCalledWith("blob:x");
    const blob = (create.mock.calls[0] as unknown as [Blob])[0];
    expect(blob.type).toBe("text/css;charset=utf-8");
    expect(document.querySelector("a[download]")).toBeNull();
  });
});

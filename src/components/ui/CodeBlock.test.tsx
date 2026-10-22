import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EXPERIMENTS } from "@/lib/experiments";
import CodeBlock from "./CodeBlock";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("CodeBlock 접근성", () => {
  it("긴 줄이 가로로 스크롤되므로 키보드로 포커스할 수 있는 이름 붙은 영역이다", () => {
    render(<CodeBlock title="CSS" code="a{}" />);
    const region = screen.getByRole("region", { name: "CSS 코드" });
    expect(region.tagName).toBe("PRE");
    expect(region.getAttribute("tabindex")).toBe("0");
  });

  it("제목이 이미 코드로 끝나면 이름에 코드를 한 번 더 붙이지 않는다", () => {
    render(<CodeBlock title="GSAP 코드" code="gsap.to()" />);
    expect(screen.getByRole("region", { name: "GSAP 코드" })).toBeTruthy();
  });
});

describe("CodeBlock 저장", () => {
  it("file이 없으면 저장 버튼이 없다", () => {
    render(<CodeBlock title="CSS" code="a{}" />);
    expect(screen.queryByRole("button", { name: "저장" })).toBeNull();
  });

  it("저장을 누르면 이름-날짜.확장자 파일로 보이는 코드를 내려받는다", () => {
    const create = vi.fn(() => "blob:x");
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: vi.fn() });
    let name = "";
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      name = this.download;
    });
    render(<CodeBlock title="CSS" code=".box { color: red; }" file={{ name: "grid", ext: "css" }} />);

    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(name).toMatch(/^grid-\d{4}-\d{2}-\d{2}\.css$/);
    expect((create.mock.calls[0] as unknown as [Blob])[0].size).toBe(".box { color: red; }".length);
    expect(screen.getByRole("status").textContent).toContain(name);
  });
});

describe("모든 도구가 코드 저장을 지원한다", () => {
  it("각 도구 컴포넌트의 CodeBlock이 도구 슬러그를 파일 이름으로 쓴다", () => {
    const dir = join(process.cwd(), "src", "components");
    const names = new Set<string>();
    for (const f of readdirSync(dir).filter((n) => n.endsWith(".tsx") && !n.endsWith(".test.tsx"))) {
      const src = readFileSync(join(dir, f), "utf8");
      // 도구는 ToolFooter의 code 속성으로 CodeBlock을 쓰고, 직접 쓰는 곳도 같은 규칙을 지켜야 한다
      const direct = (src.match(/<CodeBlock[\s\S]*?\/>/g) ?? []).map((b) => ({
        b,
        re: /file=\{\{ name: "([a-z-]+)", ext: "(css|js|svg)" \}\}/,
      }));
      const viaFooter = (src.match(/<ToolFooter[\s\S]*?\/>/g) ?? []).map((b) => ({
        b,
        re: /file: \{ name: "([a-z-]+)", ext: "(css|js|svg)" \}/,
      }));
      for (const { b, re } of [...direct, ...viaFooter]) {
        const m = re.exec(b);
        expect(m, `${f}의 CodeBlock에 file이 없습니다`).not.toBeNull();
        names.add(m![1]);
      }
    }
    expect([...names].sort()).toEqual(EXPERIMENTS.map((e) => e.slug).sort());
  });
});

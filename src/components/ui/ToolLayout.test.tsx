import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ToolControls, ToolFooter, ToolPage } from "./ToolLayout";

afterEach(cleanup);

describe("ToolPage", () => {
  it("제목은 h1, 설명은 그 아래 문단이고 내용은 그 뒤에 온다", () => {
    render(
      <ToolPage title="Gradient Editor" description="설명입니다">
        <p>본문</p>
      </ToolPage>,
    );
    const h1 = screen.getByRole("heading", { level: 1, name: "Gradient Editor" });
    expect(h1.nextElementSibling?.textContent).toBe("설명입니다");
    expect(h1.parentElement?.className).toContain("max-w-5xl");
    expect(screen.getByText("본문").previousElementSibling?.textContent).toBe("설명입니다");
  });

  it("rootRef가 바깥 틀 요소를 가리킨다", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <ToolPage title="t" description="d" rootRef={ref}>
        x
      </ToolPage>,
    );
    expect(ref.current).toBe(screen.getByRole("heading", { level: 1 }).parentElement);
  });
});

describe("ToolControls", () => {
  it("기본은 md부터 두 열이고, className으로 열 구성을 바꿀 수 있다", () => {
    const { container, rerender } = render(<ToolControls>a</ToolControls>);
    expect(container.firstElementChild?.className).toContain("md:grid-cols-2");
    rerender(<ToolControls className="md:grid-cols-3">a</ToolControls>);
    expect(container.firstElementChild?.className).toContain("md:grid-cols-3");
    expect(container.firstElementChild?.className).not.toContain("md:grid-cols-2");
  });
});

describe("ToolFooter", () => {
  const base = {
    presets: [{ id: "1", name: "내 설정", data: { n: 1 } }],
    isFull: false,
    state: { n: 2 },
    onSave: vi.fn(),
    onLoad: vi.fn(),
    onRemove: vi.fn(),
    code: { title: "CSS", code: "a { color: red; }", file: { name: "x", ext: "css" as const } },
  };

  it("프리셋, 공유 링크, 코드를 이 순서로 보여준다", () => {
    render(<ToolFooter {...base} />);
    const preset = screen.getByLabelText("프리셋 이름");
    const share = screen.getByRole("button", { name: "현재 설정 공유 링크 복사" });
    const code = screen.getByText("a { color: red; }");
    expect(preset.compareDocumentPosition(share) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(share.compareDocumentPosition(code) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("저장하면 입력한 이름과 현재 설정을 함께 넘긴다", () => {
    const onSave = vi.fn();
    render(<ToolFooter {...base} onSave={onSave} />);
    fireEvent.change(screen.getByLabelText("프리셋 이름"), { target: { value: "새 이름" } });
    fireEvent.submit(screen.getByLabelText("프리셋 이름").closest("form")!);
    expect(onSave).toHaveBeenCalledWith("새 이름", { n: 2 });
  });

  it("저장한 프리셋을 누르면 그 데이터로 불러온다", () => {
    const onLoad = vi.fn();
    render(<ToolFooter {...base} onLoad={onLoad} />);
    fireEvent.click(screen.getByRole("button", { name: "내 설정" }));
    expect(onLoad).toHaveBeenCalledWith({ n: 1 });
  });

  it("note가 있을 때만 코드 아래에 설명을 보여준다", () => {
    const { rerender } = render(<ToolFooter {...base} />);
    expect(screen.queryByText("참고 설명")).toBeNull();
    rerender(<ToolFooter {...base} note="참고 설명" />);
    expect(screen.getByText("참고 설명")).toBeTruthy();
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Slider, { RangeInput } from "./Slider";

afterEach(cleanup);

describe("Slider", () => {
  it("라벨과 값을 보여주고 값이 바뀌면 숫자로 알린다", () => {
    const onChange = vi.fn();
    render(<Slider label="각도" value={30} max={360} display="30°" onChange={onChange} />);
    expect(screen.getByText("30°")).toBeTruthy();
    fireEvent.change(screen.getByRole("slider", { name: /각도/ }), { target: { value: "90" } });
    expect(onChange).toHaveBeenCalledWith(90);
  });

  it("손가락이 닿는 높이가 24px이고 눈에 보이는 트랙은 위아래 여백을 뺀 가운데만 칠한다", () => {
    render(<RangeInput value={1} max={5} onChange={() => {}} aria-label="값" />);
    const cls = screen.getByRole("slider").className.split(/\s+/);
    // h-6(24px) - py-2(위아래 8px씩) = 8px 트랙. 여백까지 칠하면 트랙이 두꺼워진다
    expect(cls).toEqual(expect.arrayContaining(["h-6", "py-2", "bg-clip-content"]));
    expect(cls).not.toContain("h-2");
  });

  it("트랙 그라디언트를 줘도 여백은 칠하지 않는다(background 단축 속성이 clip을 되돌리므로 다시 지정)", () => {
    render(<RangeInput value={1} max={5} onChange={() => {}} aria-label="색상" track="linear-gradient(red, blue)" />);
    const el = screen.getByRole("slider") as HTMLInputElement;
    expect(el.style.backgroundClip).toBe("content-box");
    expect(el.style.backgroundImage).toContain("linear-gradient");
  });
});

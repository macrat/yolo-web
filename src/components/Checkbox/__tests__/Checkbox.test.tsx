import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Checkbox from "../index";

describe("Checkbox", () => {
  it("ラベルを名前に持つチェックボックスを描く", () => {
    render(<Checkbox label="記号を含める" />);
    expect(
      screen.getByRole("checkbox", { name: "記号を含める" }),
    ).toBeInTheDocument();
  });

  it("ラベルを含む行全体が1つの label で、行のどこを押しても切り替わる", () => {
    const handleChange = vi.fn();
    render(<Checkbox label="記号を含める" onChange={handleChange} />);
    const row = screen.getByText("記号を含める").closest("label")!;
    expect(row).toHaveAttribute("data-text-box", "inline");
    fireEvent.click(row);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("defaultChecked・checked・disabled・id をそのまま渡す", () => {
    const { rerender } = render(
      <Checkbox label="通知" defaultChecked id="notify" />,
    );
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
    expect(checkbox.id).toBe("notify");
    rerender(<Checkbox label="通知" checked={false} disabled readOnly />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });
});

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ToggleSwitch from "../index";

// キーボード操作（Space）は <input type="checkbox"> のブラウザ標準挙動に
// 委ねており、ToggleSwitch コンポーネント自身では独自処理していない。
// jsdom はキーボードイベントを checkbox の checked 変更に変換しないため
// 単体テストでは扱わず、動作確認は実ブラウザで行う。
describe("ToggleSwitch", () => {
  it("label テキストが表示される", () => {
    render(<ToggleSwitch label="通知を受け取る" />);
    expect(screen.getByText("通知を受け取る")).toBeInTheDocument();
  });

  it('<input type="checkbox" role="switch"> がレンダリングされる', () => {
    render(<ToggleSwitch label="通知" />);
    const input = screen.getByRole("switch");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "checkbox");
  });

  it("defaultChecked={true} で初期状態が ON になる（uncontrolled）", () => {
    render(<ToggleSwitch label="通知" defaultChecked />);
    const input = screen.getByRole("switch") as HTMLInputElement;
    expect(input.checked).toBe(true);
  });

  it("defaultChecked={false}（省略時）で初期状態が OFF になる（uncontrolled）", () => {
    render(<ToggleSwitch label="通知" />);
    const input = screen.getByRole("switch") as HTMLInputElement;
    expect(input.checked).toBe(false);
  });

  it("checked prop でcontrolled 動作し、クリック時に onChange が呼ばれる", () => {
    const handleChange = vi.fn();
    render(
      <ToggleSwitch label="通知" checked={false} onChange={handleChange} />,
    );
    const input = screen.getByRole("switch");
    fireEvent.click(input);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("disabled 時に input が disabled になる", () => {
    render(<ToggleSwitch label="通知" disabled />);
    const input = screen.getByRole("switch");
    expect(input).toBeDisabled();
  });
});

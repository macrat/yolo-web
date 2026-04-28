import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ToggleSwitch from "../index";

// キーボード操作（Enter/Space）は <button> 要素のブラウザ標準挙動に
// 委ねており、ToggleSwitch コンポーネント自身では独自処理していない。
// jsdom は keyDown を click に変換しないため単体テストでは扱わず、
// 動作確認は実ブラウザ（/storybook 等）で行う。
describe("ToggleSwitch", () => {
  it("checked=false のとき aria-checked が false になる", () => {
    render(<ToggleSwitch checked={false} onChange={vi.fn()} label="通知" />);
    const button = screen.getByRole("switch");
    expect(button).toHaveAttribute("aria-checked", "false");
  });

  it("checked=true のとき aria-checked が true になる", () => {
    render(<ToggleSwitch checked={true} onChange={vi.fn()} label="通知" />);
    const button = screen.getByRole("switch");
    expect(button).toHaveAttribute("aria-checked", "true");
  });

  it("label が aria-label として設定される", () => {
    render(<ToggleSwitch checked={false} onChange={vi.fn()} label="通知" />);
    const button = screen.getByRole("switch", { name: "通知" });
    expect(button).toBeInTheDocument();
  });

  it("クリックで onChange が !checked の値で呼ばれる（OFF→ON）", () => {
    const handleChange = vi.fn();
    render(
      <ToggleSwitch checked={false} onChange={handleChange} label="通知" />,
    );
    const button = screen.getByRole("switch");
    fireEvent.click(button);
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("クリックで onChange が !checked の値で呼ばれる（ON→OFF）", () => {
    const handleChange = vi.fn();
    render(
      <ToggleSwitch checked={true} onChange={handleChange} label="通知" />,
    );
    const button = screen.getByRole("switch");
    fireEvent.click(button);
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it("disabled のとき button が disabled になる", () => {
    render(
      <ToggleSwitch checked={false} onChange={vi.fn()} label="通知" disabled />,
    );
    const button = screen.getByRole("switch");
    expect(button).toBeDisabled();
  });

  it("disabled 時にクリックしても onChange が呼ばれない", () => {
    const handleChange = vi.fn();
    render(
      <ToggleSwitch
        checked={false}
        onChange={handleChange}
        label="通知"
        disabled
      />,
    );
    const button = screen.getByRole("switch");
    fireEvent.click(button);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("id prop が button に渡される", () => {
    render(
      <ToggleSwitch
        checked={false}
        onChange={vi.fn()}
        label="通知"
        id="notifications-toggle"
      />,
    );
    const button = screen.getByRole("switch");
    expect(button).toHaveAttribute("id", "notifications-toggle");
  });
});

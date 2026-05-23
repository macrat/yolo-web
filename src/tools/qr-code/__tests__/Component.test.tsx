import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import QrCodeTool from "../Component";

// logic.ts の generateQrCode をモック（テスト観点はコンポーネントの debounce 挙動）
vi.mock("../logic", () => ({
  generateQrCode: vi.fn().mockReturnValue({
    success: true,
    svgTag: '<svg xmlns="http://www.w3.org/2000/svg"><rect /></svg>',
    dataUrl: "data:image/png;base64,abc123",
  }),
}));

import { generateQrCode } from "../logic";

describe("QrCodeTool Component - debounce + cleanup", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // (i) 連続入力で再描画が抑制される（debounce 300ms 以内の呼出は合算される）
  it("連続入力: 300ms 以内の複数入力では generateQrCode は最後の 1 回のみ呼ばれる", () => {
    render(<QrCodeTool />);
    const textarea = screen.getByRole("textbox");

    // 連続で 3 回入力 (各 100ms 間隔)
    fireEvent.change(textarea, { target: { value: "a" } });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    fireEvent.change(textarea, { target: { value: "ab" } });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    fireEvent.change(textarea, { target: { value: "abc" } });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // 300ms 経過前なので generateQrCode はまだ呼ばれていない
    expect(generateQrCode).not.toHaveBeenCalled();

    // 300ms 後に発火
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(generateQrCode).toHaveBeenCalledTimes(1);
    expect(generateQrCode).toHaveBeenCalledWith("abc", "M");
  });

  // (ii) cleanup: コンポーネントアンマウント時に前回の setTimeout が clearTimeout される
  it("cleanup: アンマウント時に未発火の setTimeout がキャンセルされ generateQrCode は呼ばれない", () => {
    const { unmount } = render(<QrCodeTool />);
    const textarea = screen.getByRole("textbox");

    // 入力してから 300ms 未満でアンマウント
    fireEvent.change(textarea, { target: { value: "test" } });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // アンマウント (cleanup が走る)
    unmount();

    // 残り 200ms 経過させても呼ばれないことを確認
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(generateQrCode).not.toHaveBeenCalled();
  });
});

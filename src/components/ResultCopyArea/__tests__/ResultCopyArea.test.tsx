import { expect, test, describe, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import ResultCopyArea from "@/components/ResultCopyArea";

describe("ResultCopyArea", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  test("value の文字列が表示される", () => {
    render(<ResultCopyArea value="テスト結果" />);
    expect(screen.getByText("テスト結果")).toBeInTheDocument();
  });

  test("デフォルトのコピーボタンが表示される", () => {
    render(<ResultCopyArea value="テスト結果" />);
    expect(screen.getByRole("button", { name: "コピー" })).toBeInTheDocument();
  });

  test("label prop でボタンのラベルを変更できる", () => {
    render(
      <ResultCopyArea value="テスト結果" label="クリップボードにコピー" />,
    );
    expect(
      screen.getByRole("button", { name: "クリップボードにコピー" }),
    ).toBeInTheDocument();
  });

  test("コピー成功時に成功通知が表示される", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });

    render(<ResultCopyArea value="コピー対象テキスト" />);
    const button = screen.getByRole("button", { name: "コピー" });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByRole("status").textContent).toContain("コピーしました");
  });

  test("コピー失敗時（writeText 拒否）に失敗通知が表示される", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error("Permission denied")),
      },
      writable: true,
      configurable: true,
    });

    render(<ResultCopyArea value="コピー対象テキスト" />);
    const button = screen.getByRole("button", { name: "コピー" });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByRole("status").textContent).toContain(
      "コピーできませんでした",
    );
  });

  test("clipboard API が存在しない場合に失敗通知が表示される", async () => {
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    render(<ResultCopyArea value="コピー対象テキスト" />);
    const button = screen.getByRole("button", { name: "コピー" });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByRole("status").textContent).toContain(
      "コピーできませんでした",
    );

    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
  });

  test("成功通知は一定時間後に自動消去される", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });

    render(<ResultCopyArea value="コピー対象テキスト" />);
    const button = screen.getByRole("button", { name: "コピー" });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByRole("status")).toBeInTheDocument();

    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  test("失敗通知も一定時間後に自動消去される", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error("Permission denied")),
      },
      writable: true,
      configurable: true,
    });

    render(<ResultCopyArea value="コピー対象テキスト" />);
    const button = screen.getByRole("button", { name: "コピー" });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByRole("status")).toBeInTheDocument();

    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  test("navigator.clipboard.writeText が実際の value で呼ばれる", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    render(<ResultCopyArea value="正確なコピー内容" />);
    const button = screen.getByRole("button", { name: "コピー" });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(writeText).toHaveBeenCalledWith("正確なコピー内容");
  });
});

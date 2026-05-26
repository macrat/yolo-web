import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TextReplaceTile from "../TextReplaceTile";

// navigator.clipboard のモック
const mockWriteText = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(navigator, "clipboard", {
  value: { writeText: mockWriteText },
  writable: true,
});

describe("TextReplaceTile", () => {
  beforeEach(() => {
    mockWriteText.mockClear();
  });

  // 観点 (i) レンダリング: タイル初期描画で全 DOM 要素が存在する
  it("(i) レンダリング: 本文 textarea + 検索 input + 置換 input + 結果欄 + 詳細リンクが DOM に存在する", () => {
    render(<TextReplaceTile />);

    // 本文 textarea が存在する
    expect(screen.getByLabelText("本文")).toBeInTheDocument();

    // 検索 input が存在する
    expect(screen.getByLabelText("検索")).toBeInTheDocument();

    // 置換 input が存在する
    expect(screen.getByLabelText("置換")).toBeInTheDocument();

    // 結果欄（role="status"）が存在する
    expect(screen.getByRole("status")).toBeInTheDocument();

    // 詳細ページへのリンクが存在する
    expect(
      screen.getByRole("link", { name: "詳細ページで開く" }),
    ).toBeInTheDocument();
  });

  // 観点 (ii) 検索文字列入力で結果更新: リアルタイム反映
  it("(ii) 検索文字列入力で結果更新: 本文・検索・置換を入力すると結果欄が即時反映される", () => {
    render(<TextReplaceTile />);

    const bodyInput = screen.getByLabelText("本文");
    const searchInput = screen.getByLabelText("検索");
    const replaceInput = screen.getByLabelText("置換");

    fireEvent.change(bodyInput, { target: { value: "Hello World Hello" } });
    fireEvent.change(searchInput, { target: { value: "Hello" } });
    fireEvent.change(replaceInput, { target: { value: "Hi" } });

    // 全件置換（globalReplace: true 固定）で結果が即時反映される
    expect(screen.getByRole("status")).toHaveTextContent("Hi World Hi");
  });

  // 観点 (iii) 検索文字列空時の挙動: 本文と結果が同一になる
  it("(iii) 検索文字列空時: 結果が本文と同一になる（logic.ts L29-31 早期 return 仕様確認）", () => {
    render(<TextReplaceTile />);

    const bodyInput = screen.getByLabelText("本文");
    fireEvent.change(bodyInput, { target: { value: "テスト文字列" } });

    // 検索が空のとき、結果は本文と同一
    expect(screen.getByRole("status")).toHaveTextContent("テスト文字列");
  });

  // 観点 (iv) 置換文字列空時の削除挙動
  it("(iv) 置換文字列空時: 検索文字列が削除される動作になる", () => {
    render(<TextReplaceTile />);

    const bodyInput = screen.getByLabelText("本文");
    const searchInput = screen.getByLabelText("検索");

    fireEvent.change(bodyInput, { target: { value: "foobarfoo" } });
    fireEvent.change(searchInput, { target: { value: "foo" } });
    // 置換は空のまま

    // 置換空時: "foo" が削除されて "bar" になる
    expect(screen.getByRole("status")).toHaveTextContent("bar");
  });

  // 観点 (v) コピーボタン押下挙動
  it("(v) コピーボタン: 押下で clipboard.writeText が呼ばれ、コピー済み UI が表示される", async () => {
    render(<TextReplaceTile />);

    const bodyInput = screen.getByLabelText("本文");
    const searchInput = screen.getByLabelText("検索");
    const replaceInput = screen.getByLabelText("置換");

    fireEvent.change(bodyInput, { target: { value: "abc" } });
    fireEvent.change(searchInput, { target: { value: "a" } });
    fireEvent.change(replaceInput, { target: { value: "A" } });

    const copyBtn = screen.getByRole("button", { name: "コピー" });
    expect(copyBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(copyBtn);
    });

    // clipboard.writeText が呼ばれていること
    expect(mockWriteText).toHaveBeenCalledWith("Abc");

    // コピー済み UI が表示される
    expect(
      screen.getByRole("button", { name: "コピー済み" }),
    ).toBeInTheDocument();
  });

  // 観点 (vi) ARIA / role="status" + aria-live="polite"
  it("(vi) ARIA: 結果欄が role=status + aria-live=polite を持つ", () => {
    render(<TextReplaceTile />);

    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveAttribute("role", "status");
    expect(statusEl).toHaveAttribute("aria-live", "polite");
  });

  // 観点 (vii) 100,000 字超過時のエラー表示
  it("(vii) 100,000 字超過時: エラー文言が DOM に表示される", () => {
    render(<TextReplaceTile />);

    const bodyInput = screen.getByLabelText("本文");
    const searchInput = screen.getByLabelText("検索");

    // 100,001 文字の入力（1 文字超過）
    fireEvent.change(bodyInput, { target: { value: "a".repeat(100_001) } });
    fireEvent.change(searchInput, { target: { value: "a" } });

    // エラー文言が表示される（logic.ts の文言と一致）
    expect(
      screen.getByText("入力テキストが長すぎます（最大100,000文字）"),
    ).toBeInTheDocument();
  });

  // 観点 (viii) 詳細ページリンク
  it("(viii) 詳細ページリンク: /tools/text-replace を指す", () => {
    render(<TextReplaceTile />);

    const link = screen.getByRole("link", { name: "詳細ページで開く" });
    expect(link).toHaveAttribute("href", "/tools/text-replace");
  });

  // 観点 (ix) 空入力時のコピーボタン非表示
  it("(ix) 空入力時: コピーボタンが非表示になる", () => {
    render(<TextReplaceTile />);

    // 初期状態（空入力）ではコピーボタンが存在しない
    expect(
      screen.queryByRole("button", { name: "コピー" }),
    ).not.toBeInTheDocument();
  });

  // 観点 (x) navigator.clipboard 不在時のフォールバック（silent fail）
  it("(x) clipboard 不在時: エラーが throw されずタイルがクラッシュしない", async () => {
    // clipboard API を reject に差し替え
    const rejectClipboard = vi
      .fn()
      .mockRejectedValue(new Error("Clipboard unavailable"));
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: rejectClipboard },
      writable: true,
    });

    render(<TextReplaceTile />);

    const bodyInput = screen.getByLabelText("本文");
    const searchInput = screen.getByLabelText("検索");

    fireEvent.change(bodyInput, { target: { value: "abc" } });
    fireEvent.change(searchInput, { target: { value: "a" } });

    const copyBtn = screen.getByRole("button", { name: "コピー" });

    // クリップボード失敗でもクラッシュしない（silent fail）
    await expect(
      act(async () => {
        fireEvent.click(copyBtn);
      }),
    ).resolves.not.toThrow();

    // クリップボードが restore されていること（後続テストのため）
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: mockWriteText },
      writable: true,
    });
  });

  // 観点 (xi) 置換件数表示
  it("(xi) 置換件数表示: 置換が発生した状態で件数相当の情報が DOM に表示される", () => {
    render(<TextReplaceTile />);

    const bodyInput = screen.getByLabelText("本文");
    const searchInput = screen.getByLabelText("検索");
    const replaceInput = screen.getByLabelText("置換");

    fireEvent.change(bodyInput, { target: { value: "foo bar foo baz foo" } });
    fireEvent.change(searchInput, { target: { value: "foo" } });
    fireEvent.change(replaceInput, { target: { value: "qux" } });

    // 「foo」が 3 件置換されるため、件数 "3 件" を示す表示が DOM にある
    expect(screen.getByText(/3\s*件/)).toBeInTheDocument();
  });
});

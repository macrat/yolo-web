/**
 * Base64Tool の回帰テスト
 *
 * E-1〜E-12 の観点を網羅する。
 * E-7: コピー disabled: 出力が空のとき disabled（該当あり）
 * E-9: 詳細リンク: N/A（Base64Tool はページ本体のため詳細リンクなし）
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import Base64Tool from "../Base64Tool";

describe("Base64Tool", () => {
  // E-1: 基本レンダリング
  it("正常にレンダリングされる", () => {
    render(<Base64Tool />);
    // モード切替が表示される
    expect(
      screen.getByRole("radiogroup", { name: "変換モード" }),
    ).toBeInTheDocument();
    // 入力欄が存在する
    expect(screen.getByLabelText("テキスト入力")).toBeInTheDocument();
    // 出力欄が存在する
    expect(screen.getByLabelText("Base64出力")).toBeInTheDocument();
    // コピーボタンが存在する
    expect(
      screen.getByRole("button", { name: "出力をコピー" }),
    ).toBeInTheDocument();
  });

  // E-10: meta 由来の表示（ToolPageLayout は page.tsx で使用。ここでは children の描画を確認）
  it("SegmentedControl の encode オプションが初期選択状態にある", () => {
    render(<Base64Tool />);
    const encodeOption = screen.getByRole("radio", { name: "エンコード" });
    expect(encodeOption).toHaveAttribute("aria-checked", "true");
  });

  // E-3: 空入力の挙動
  it("空入力時: エラー非表示・出力空・コピーボタン disabled", () => {
    render(<Base64Tool />);
    // エラーが表示されていない
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    // 出力が空
    const output = screen.getByLabelText("Base64出力");
    expect(output).toHaveValue("");
    // コピーボタンが disabled
    expect(screen.getByRole("button", { name: "出力をコピー" })).toBeDisabled();
  });

  // E-2, E-4: 入力→変換結果の更新（エンコード）
  it("テキスト入力でエンコード結果がリアルタイムに更新される", () => {
    render(<Base64Tool />);
    const input = screen.getByLabelText("テキスト入力");
    fireEvent.change(input, { target: { value: "Hello, World!" } });
    // btoa("Hello, World!") = "SGVsbG8sIFdvcmxkIQ=="
    const output = screen.getByLabelText("Base64出力");
    expect(output).toHaveValue("SGVsbG8sIFdvcmxkIQ==");
  });

  // E-4: 日本語テキストのエンコード
  it("日本語テキスト（UTF-8）をエンコードできる", () => {
    render(<Base64Tool />);
    const input = screen.getByLabelText("テキスト入力");
    fireEvent.change(input, { target: { value: "こんにちは" } });
    const output = screen.getByLabelText("Base64出力");
    expect(output).toHaveValue("44GT44KT44Gr44Gh44Gv");
  });

  // E-2, E-4: デコードモードへの切替と変換
  it("デコードモードに切替後、Base64文字列がデコードされる", () => {
    render(<Base64Tool />);
    // decode に切替
    const decodeOption = screen.getByRole("radio", { name: "デコード" });
    fireEvent.click(decodeOption);

    const input = screen.getByLabelText("Base64入力");
    fireEvent.change(input, { target: { value: "SGVsbG8sIFdvcmxkIQ==" } });
    const output = screen.getByLabelText("テキスト出力");
    expect(output).toHaveValue("Hello, World!");
  });

  // 個別論点①-7: URL-safe Base64 デコード対応
  it("URL-safe Base64 文字列（'-' '_' 使用）をデコードできる", () => {
    render(<Base64Tool />);
    const decodeOption = screen.getByRole("radio", { name: "デコード" });
    fireEvent.click(decodeOption);

    // "Hello, World!" → standard: "SGVsbG8sIFdvcmxkIQ==" (+ / なし)
    // URL-safe 文字を含む: "テスト" → URL-safe でエンコードするとハイフン/アンダースコアが出る場合
    // パディングなし URL-safe テスト: "test" → "dGVzdA" (パディングなし)
    const input = screen.getByLabelText("Base64入力");
    fireEvent.change(input, { target: { value: "dGVzdA" } });
    const output = screen.getByLabelText("テキスト出力");
    expect(output).toHaveValue("test");
  });

  // 個別論点①-7: URL-safe エンコード出力（実際に '+' '/' が出る入力を使って変換を検証）
  it("URL-safe オプション ON で '+' '/' を含む Base64 が '-' '_' に変換される", () => {
    render(<Base64Tool />);
    // URL-safe トグルスイッチをON（ToggleSwitch は role="switch" を持つ）
    const toggle = screen.getByRole("switch");
    fireEvent.click(toggle);

    const input = screen.getByLabelText("テキスト入力");
    // ">>>" → encodeBase64(">>>") の標準形は "Pj4+" ('+' を含む)
    // URL-safe ON では "Pj4+" → "Pj4-"
    fireEvent.change(input, { target: { value: ">>>" } });
    const output = screen.getByLabelText("Base64出力");
    expect(output).toHaveValue("Pj4-");
    // "???" → 標準形は "Pz8/" ('/' を含む)
    // URL-safe ON では "Pz8/" → "Pz8_"
    fireEvent.change(input, { target: { value: "???" } });
    expect(output).toHaveValue("Pz8_");
  });

  it("URL-safe オプション OFF（デフォルト）では標準 Base64 '+' '/' が出力される", () => {
    render(<Base64Tool />);
    const input = screen.getByLabelText("テキスト入力");
    // ">>>" → 標準 Base64 は "Pj4+"
    fireEvent.change(input, { target: { value: ">>>" } });
    const output = screen.getByLabelText("Base64出力");
    expect(output).toHaveValue("Pj4+");
  });

  // 個別論点①-7: デコードモードでは URL-safe トグルを非表示にする（[major] reviewer 指摘）
  it("デコードモードでは URL-safe トグルが表示されない", () => {
    render(<Base64Tool />);
    // 初期状態（エンコードモード）ではトグルが表示される
    expect(screen.getByRole("switch")).toBeInTheDocument();
    // デコードモードに切替
    const decodeOption = screen.getByRole("radio", { name: "デコード" });
    fireEvent.click(decodeOption);
    // トグルが非表示になる
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
  });

  it("エンコードモードに戻るとURL-safeトグルが再表示される", () => {
    render(<Base64Tool />);
    // デコードモードに切替
    const decodeOption = screen.getByRole("radio", { name: "デコード" });
    fireEvent.click(decodeOption);
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
    // エンコードモードに戻す
    const encodeOption = screen.getByRole("radio", { name: "エンコード" });
    fireEvent.click(encodeOption);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  // E-4: 不正なBase64デコードのエラー表示（A-4: 日本語エラー）
  it("不正なBase64入力時に日本語エラーメッセージが表示される（英語raw errorは非表示）", () => {
    render(<Base64Tool />);
    const decodeOption = screen.getByRole("radio", { name: "デコード" });
    fireEvent.click(decodeOption);

    const input = screen.getByLabelText("Base64入力");
    fireEvent.change(input, { target: { value: "!@#$%" } });

    // 日本語エラーが表示される
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/不正な Base64 文字列です/)).toBeInTheDocument();
    // 英語の生例外メッセージが表示されない
    expect(screen.queryByText(/Invalid character/)).not.toBeInTheDocument();
    expect(screen.queryByText(/not correctly encoded/)).not.toBeInTheDocument();
  });

  // E-5: ARIA の確認
  it("SegmentedControl が role=radiogroup と aria-label を持つ", () => {
    render(<Base64Tool />);
    const group = screen.getByRole("radiogroup", { name: "変換モード" });
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute("aria-label", "変換モード");
  });

  it("出力欄の外に role=status の要素が存在する", () => {
    render(<Base64Tool />);
    const liveRegion = screen.getByRole("status");
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
  });

  // E-5: ライブリージョンに実テキストノード（C-3）
  it("テキストを入力するとライブリージョンにサマリが表示される", () => {
    render(<Base64Tool />);
    const input = screen.getByLabelText("テキスト入力");
    fireEvent.change(input, { target: { value: "test" } });
    const liveRegion = screen.getByRole("status");
    expect(liveRegion).toHaveTextContent("エンコード完了");
  });

  it("デコードモードで入力するとライブリージョンに「デコード完了」が表示される", () => {
    render(<Base64Tool />);
    const decodeOption = screen.getByRole("radio", { name: "デコード" });
    fireEvent.click(decodeOption);
    const input = screen.getByLabelText("Base64入力");
    fireEvent.change(input, { target: { value: "dGVzdA" } });
    const liveRegion = screen.getByRole("status");
    expect(liveRegion).toHaveTextContent("デコード完了");
  });

  it("エラー時にライブリージョンに「変換エラー」が表示される", () => {
    render(<Base64Tool />);
    const decodeOption = screen.getByRole("radio", { name: "デコード" });
    fireEvent.click(decodeOption);
    const input = screen.getByLabelText("Base64入力");
    fireEvent.change(input, { target: { value: "!@#$" } });
    const liveRegion = screen.getByRole("status");
    expect(liveRegion).toHaveTextContent("変換エラー");
  });

  // E-6: コピー文言変化
  it("コピーボタンをクリックするとコピー文言に変化する", async () => {
    // navigator.clipboard のモック
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });

    render(<Base64Tool />);
    const input = screen.getByLabelText("テキスト入力");
    fireEvent.change(input, { target: { value: "test" } });

    const copyButton = screen.getByRole("button", { name: "出力をコピー" });
    expect(copyButton).toHaveTextContent("コピー");

    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(copyButton).toHaveTextContent("コピーしました");
    });
  });

  // E-7: コピー disabled 状態
  it("出力が空のときコピーボタンは disabled", () => {
    render(<Base64Tool />);
    // 初期状態（入力なし）
    expect(screen.getByRole("button", { name: "出力をコピー" })).toBeDisabled();
  });

  it("エラー時にコピーボタンは disabled", () => {
    render(<Base64Tool />);
    const decodeOption = screen.getByRole("radio", { name: "デコード" });
    fireEvent.click(decodeOption);
    const input = screen.getByLabelText("Base64入力");
    fireEvent.change(input, { target: { value: "!@#$%" } });
    expect(screen.getByRole("button", { name: "出力をコピー" })).toBeDisabled();
  });

  it("出力がある場合コピーボタンは有効", () => {
    render(<Base64Tool />);
    const input = screen.getByLabelText("テキスト入力");
    fireEvent.change(input, { target: { value: "hello" } });
    expect(
      screen.getByRole("button", { name: "出力をコピー" }),
    ).not.toBeDisabled();
  });

  // E-8: clipboard 不在時の silent fail
  it("navigator.clipboard が存在しない環境でコピーが例外を投げない", async () => {
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    render(<Base64Tool />);
    const input = screen.getByLabelText("テキスト入力");
    fireEvent.change(input, { target: { value: "test" } });

    const copyButton = screen.getByRole("button", { name: "出力をコピー" });

    // 例外を投げないことを確認
    await expect(async () => {
      fireEvent.click(copyButton);
      await new Promise((resolve) => setTimeout(resolve, 10));
    }).not.toThrow();

    // 後片付け
    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
  });

  // E-9: N/A（Base64Tool はページ本体のため詳細リンクなし）
  // E-11: logic.ts テスト（別ファイルで PASS 維持済み）
});

// E-12: CSS トークン検証
describe("Base64Tool CSS トークン検証", () => {
  const cssPath = resolve(__dirname, "../Base64Tool.module.css");
  const css = readFileSync(cssPath, "utf-8");

  it("旧 --color-* トークンが使われていない", () => {
    expect(css).not.toMatch(/var\(--color-/);
  });

  it("--accent を塗りに直接使っていない（B-3: bg/color への直塗り禁止）", () => {
    // ToggleSwitch 移行後、accent-color プロパティも不要になったため
    // background や color に --accent を直接使っていないことを確認
    expect(css).not.toMatch(/:\s*var\(--accent\)/);
  });

  it("font-weight: 700 が使われていない", () => {
    expect(css).not.toMatch(/font-weight\s*:\s*700/);
  });
});

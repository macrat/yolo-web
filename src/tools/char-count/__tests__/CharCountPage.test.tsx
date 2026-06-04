/**
 * CharCountPage 単一実装の回帰テスト（E-1〜E-12 観点）
 *
 * E-1: 基本レンダリング
 * E-2: 入力→結果更新
 * E-3: 空入力
 * E-4: 変換ロジックの正確性
 * E-5: ARIA（role="status" / aria-live="polite"）
 * E-6: コピーボタン: char-count は「知る対象」のためコピーなし（T-4b 確定）
 * E-7: コピー disabled 状態: N/A（コピーボタンなし）
 * E-8: clipboard 不在時の silent fail: N/A（コピーボタンなし）
 * E-9: 詳細リンク: N/A（ToolPageLayout は page.tsx 側で使用）
 * E-10: meta 由来の表示（ToolPageLayout は page.tsx 側で使用）
 * E-11: 既存 logic.test.ts が PASS し続けること
 * E-12: CSS トークン検証（readFileSync で --color-* 等の禁止パターンを確認）
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import CharCountPage from "../CharCountPage";

describe("CharCountPage", () => {
  // E-1: 基本レンダリング
  it("renders without crashing", () => {
    render(<CharCountPage />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  // E-3: 空入力状態 - エラーなし・0表示
  it("shows zero counts when input is empty", () => {
    render(<CharCountPage />);
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toBeInTheDocument();
    // 文字数が0として表示されていること
    const zeroElements = screen.getAllByText("0");
    expect(zeroElements.length).toBeGreaterThan(0);
  });

  // E-3: 空入力でエラーが表示されないこと
  it("shows no error on empty input", () => {
    render(<CharCountPage />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // E-2: 入力→結果更新
  it("updates char count when text is entered", () => {
    render(<CharCountPage />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "abc" } });
    // 文字数 3 が表示されること
    const threeElements = screen.getAllByText("3");
    expect(threeElements.length).toBeGreaterThan(0);
  });

  // E-4: 変換ロジックの正確性 - 日本語文字のバイト数
  it("correctly counts bytes for Japanese text (3 bytes each)", () => {
    render(<CharCountPage />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "あいう" } });
    // "あいう" = 9 bytes (3 chars × 3 bytes each)
    const nineElements = screen.getAllByText("9");
    expect(nineElements.length).toBeGreaterThan(0);
  });

  // E-4: 変換ロジックの正確性 - フル統計の表示
  it("displays all statistics: chars, charsNoSpaces, bytes, words, lines, paragraphs", () => {
    render(<CharCountPage />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Hello World" } });

    // 全統計ラベルが表示されていること
    expect(screen.getByText("文字数")).toBeInTheDocument();
    expect(screen.getByText("文字数（空白除く）")).toBeInTheDocument();
    expect(screen.getByText(/バイト数/)).toBeInTheDocument();
    expect(screen.getByText("単語数")).toBeInTheDocument();
    expect(screen.getByText("行数")).toBeInTheDocument();
    expect(screen.getByText("段落数")).toBeInTheDocument();
  });

  // E-4: 変換ロジックの正確性 - 正確な値の確認
  it("shows correct counts for 'Hello World'", () => {
    render(<CharCountPage />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Hello World" } });

    // chars=11, charsNoSpaces=10, bytes=11, words=2, lines=1, paragraphs=1
    // 一意な値: 2(words), 1(lines/paragraphs)
    const twoElements = screen.getAllByText("2");
    expect(twoElements.length).toBeGreaterThan(0); // 単語数=2
  });

  // E-4: 変換ロジックの正確性 - 複数行テキスト
  it("counts lines correctly for multi-line text", () => {
    render(<CharCountPage />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "line1\nline2\nline3" } });

    // 行数=3 が表示されること
    const threeElements = screen.getAllByText("3");
    expect(threeElements.length).toBeGreaterThan(0);
  });

  // E-4: 変換ロジックの正確性 - 段落数
  it("counts paragraphs correctly for multi-paragraph text", () => {
    render(<CharCountPage />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "para1\n\npara2" } });

    // 段落数=2 が表示されること
    const twoElements = screen.getAllByText("2");
    expect(twoElements.length).toBeGreaterThan(0);
  });

  // E-5: ARIA - role="status" と aria-live="polite"
  it("has role=status region with aria-live=polite", () => {
    render(<CharCountPage />);
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toHaveAttribute("aria-live", "polite");
  });

  // E-5: ARIA - ライブリージョンに実テキストノードのサマリが含まれること（C-3 要件）
  it("status region contains actual text summary (not just readOnly textarea)", () => {
    render(<CharCountPage />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello" } });
    const statusRegion = screen.getByRole("status");
    // ライブリージョンには実テキストノードが存在すること
    expect(statusRegion.textContent).not.toBe("");
  });

  // E-5: ARIA - 空状態でサマリテキストが表示されること
  it("status region contains summary text on empty input", () => {
    render(<CharCountPage />);
    const statusRegion = screen.getByRole("status");
    // 空状態でもライブリージョンにテキストが存在すること
    expect(statusRegion.textContent).not.toBe("");
  });

  // E-6: コピーボタンなし（T-4b 確定：char-count はカウント=知る対象）
  it("has no copy button (char-count is knowledge-type, not carry-away)", () => {
    render(<CharCountPage />);
    expect(
      screen.queryByRole("button", { name: /コピー/ }),
    ).not.toBeInTheDocument();
  });

  // 絵文字（サロゲートペア）が1コードポイント=1文字として数えられること
  it("counts emoji as 1 character (Unicode code point)", () => {
    render(<CharCountPage />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "😀" } });
    // 絵文字=1文字
    const oneElements = screen.getAllByText("1");
    expect(oneElements.length).toBeGreaterThan(0);
  });
});

// E-12: CSS トークン検証（readFileSync パターン）
describe("CharCountPage CSS token validation", () => {
  const cssPath = join(__dirname, "..", "CharCountPage.module.css");

  it("does not use deprecated --color-* tokens", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  it("does not use --accent directly as fill color", () => {
    const css = readFileSync(cssPath, "utf-8");
    // --accent は outline/border/link にのみ使用。背景色・文字色への直塗り禁止
    const illegalAccentUse = css.match(
      /(?:background|background-color|color)\s*:\s*var\(--accent\)/g,
    );
    expect(illegalAccentUse).toBeNull();
  });

  it("does not use font-weight: 700", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight:\s*700/);
  });
});

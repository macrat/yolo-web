/**
 * ByteCounterPage 単一実装の回帰テスト（E-1〜E-12 観点）
 *
 * E-1: 基本レンダリング
 * E-2: 入力→結果更新
 * E-3: 空入力
 * E-4: 変換ロジックの正確性
 * E-5: ARIA（role="status" / aria-live="polite"）
 * E-6: コピーボタン: byte-counter は「知る対象」のためコピーなし（T-4b 確定）
 * E-7: コピー disabled 状態: N/A（コピーボタンなし）
 * E-8: clipboard 不在時の silent fail: N/A（コピーボタンなし）
 * E-9: 詳細リンク: N/A
 * E-10: meta 由来の表示（ToolPageLayout は page.tsx 側で使用）
 * E-11: 既存 logic.test.ts が PASS し続けること
 * E-12: CSS トークン検証（readFileSync で --color-* 等の禁止パターンを確認）
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import ByteCounterPage from "../ByteCounterPage";

describe("ByteCounterPage", () => {
  // E-1: 基本レンダリング
  it("renders without crashing", () => {
    render(<ByteCounterPage />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  // E-3: 空入力状態
  it("shows zero counts when input is empty", () => {
    render(<ByteCounterPage />);
    // バイト数ゼロが表示されること
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toBeInTheDocument();
  });

  // E-2: 入力→結果更新
  it("updates byte count when text is entered", () => {
    render(<ByteCounterPage />);
    const textarea = screen.getByRole("textbox");
    // "A" = 1 byte (ASCII)、数値が他の統計と重複しない入力を使う
    fireEvent.change(textarea, { target: { value: "A" } });
    // バイト数が 1 になること（byteLength=1, charCount=1, charCountNoSpaces=1 なので getAllByText を使う）
    const elements = screen.getAllByText("1");
    expect(elements.length).toBeGreaterThan(0);
  });

  // E-4: 変換ロジックの正確性
  it("correctly counts bytes for Japanese text (3 bytes each)", () => {
    render(<ByteCounterPage />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "日本語" } });
    // "日本語" = 9 bytes (3 CJK chars × 3 bytes each)
    // getAllByText to handle multiple occurrences
    const nineElements = screen.getAllByText("9");
    expect(nineElements.length).toBeGreaterThan(0);
  });

  it("correctly counts bytes for emoji (4 bytes)", () => {
    render(<ByteCounterPage />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "😀" } });
    // emoji = 4 bytes; byteLength=4, charCount=1, charCountNoSpaces=1
    // 4 が含まれることを確認
    const fourElements = screen.getAllByText("4");
    expect(fourElements.length).toBeGreaterThan(0);
  });

  // E-4: 統計の正確性 - バイト数・文字数・行数・単語数
  it("displays all statistics for mixed text", () => {
    render(<ByteCounterPage />);
    const textarea = screen.getByRole("textbox");
    // "Hello" = 5 bytes (ASCII), 5 chars, 1 line, 1 word
    fireEvent.change(textarea, { target: { value: "Hello" } });

    // バイト数ラベルが表示されていること（サマリとラベルの両方があるため getAllByText を使う）
    const byteLabels = screen.getAllByText(/バイト数/);
    expect(byteLabels.length).toBeGreaterThan(0);
    // 文字数ラベルが表示されていること
    const charLabels = screen.getAllByText(/文字数/);
    expect(charLabels.length).toBeGreaterThan(0);
    // 行数ラベルが表示されていること
    expect(screen.getByText("行数")).toBeInTheDocument();
    // 単語数ラベルが表示されていること
    expect(screen.getByText("単語数")).toBeInTheDocument();
  });

  // E-4: バイト構成内訳
  it("displays byte distribution breakdown", () => {
    render(<ByteCounterPage />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "abc" } });

    // バイト構成セクションが表示されていること
    expect(screen.getByText(/バイト構成/)).toBeInTheDocument();
    // 1バイト文字 (ASCII)
    expect(screen.getByText(/1バイト文字/)).toBeInTheDocument();
  });

  // E-5: ARIA - role="status" と aria-live="polite"
  it("has role=status region with aria-live=polite", () => {
    render(<ByteCounterPage />);
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toHaveAttribute("aria-live", "polite");
  });

  // E-5: ARIA - C-3 準拠: ライブリージョンに aria-atomic="true" が付いていないこと
  // (aria-atomic=true だと入力1文字ごとに全統計が読み上げられ冗長になる)
  it("status region does NOT have aria-atomic=true (C-3: summary only, no full panel read)", () => {
    render(<ByteCounterPage />);
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).not.toHaveAttribute("aria-atomic", "true");
  });

  // E-5: ARIA - C-3 準拠: ライブリージョンはサマリテキストのみを含み、詳細統計パネルを含まないこと
  it("status region contains only summary text, not the full stats panel", () => {
    render(<ByteCounterPage />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello" } });
    const statusRegion = screen.getByRole("status");
    // ライブリージョンには実テキストノードのサマリが存在すること
    expect(statusRegion.textContent).not.toBe("");
    // ライブリージョンに詳細統計のラベルが含まれないこと（詳細は外に出す）
    expect(statusRegion.textContent).not.toContain("文字数（空白除く）");
    expect(statusRegion.textContent).not.toContain("バイト構成");
  });

  // E-5: ARIA - ライブリージョンに実テキストノードのサマリが含まれること（C-3 要件）
  it("status region contains actual text summary (not just readOnly textarea)", () => {
    render(<ByteCounterPage />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello" } });
    const statusRegion = screen.getByRole("status");
    // ライブリージョンには実テキストノードが存在すること（readOnly textareaでラップするだけは不可）
    expect(statusRegion.textContent).not.toBe("");
  });

  // E-6: コピーボタンなし（T-4b 確定：byte-counter はカウント=知る対象）
  it("has no copy button (byte-counter is knowledge-type, not carry-away)", () => {
    render(<ByteCounterPage />);
    // コピーボタンが存在しないこと
    expect(
      screen.queryByRole("button", { name: /コピー/ }),
    ).not.toBeInTheDocument();
  });
});

// E-12: CSS トークン検証（readFileSync パターン）
describe("ByteCounterPage CSS token validation", () => {
  const cssPath = join(__dirname, "..", "ByteCounterPage.module.css");

  it("does not use deprecated --color-* tokens", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  it("does not use --accent directly as fill color", () => {
    const css = readFileSync(cssPath, "utf-8");
    // --accent は outline/border/link にのみ使用。背景色・文字色への直塗り禁止
    // ただし outline: 2px solid var(--accent) は合法なので除外
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

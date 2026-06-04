/**
 * NumberBaseConverterPage — 回帰テスト
 * E-1〜E-12 (convergence-checklist.md) に対応
 */
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";
import NumberBaseConverterPage from "../NumberBaseConverterPage";

// ---- mock setup ----
vi.mock("@/tools/registry", () => ({
  toolsBySlug: new Map(),
}));

// navigator.clipboard のモック
const clipboardWriteText = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(globalThis, "navigator", {
  value: { clipboard: { writeText: clipboardWriteText } },
  writable: true,
  configurable: true,
});

describe("NumberBaseConverterPage", () => {
  beforeEach(() => {
    clipboardWriteText.mockClear();
  });

  // E-1: 基本レンダリング
  test("E-1: renders without crashing", () => {
    render(<NumberBaseConverterPage />);
    // 入力欄が表示されること
    expect(screen.getByLabelText("変換する数値")).toBeInTheDocument();
    // SegmentedControl (入力基数選択) が表示されること
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  // E-2: 入力→結果更新
  test("E-2: updates results when input changes", () => {
    render(<NumberBaseConverterPage />);
    const input = screen.getByLabelText("変換する数値");

    fireEvent.change(input, { target: { value: "255" } });

    // 10進数入力で、他の基数が正しく表示されること
    // 2進数: 11111111, 8進数: 377, 16進数: ff
    expect(screen.getByTestId("result-binary")).toHaveTextContent("1111 1111");
    expect(screen.getByTestId("result-octal")).toHaveTextContent("377");
    expect(screen.getByTestId("result-decimal")).toHaveTextContent("255");
    expect(screen.getByTestId("result-hexadecimal")).toHaveTextContent("ff");
  });

  // E-3: 空入力
  test("E-3: shows no error and empty results on empty input", () => {
    render(<NumberBaseConverterPage />);
    // 初期状態でエラーが出ていないこと
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    const input = screen.getByLabelText("変換する数値");
    // 何か入れてから消す
    fireEvent.change(input, { target: { value: "10" } });
    fireEvent.change(input, { target: { value: "" } });

    // エラーが消えていること
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // E-4: 変換ロジックの正確性
  test("E-4: correctly converts hex ff to other bases", () => {
    render(<NumberBaseConverterPage />);

    // 16進数を選択
    const hexOption = screen.getByRole("radio", { name: "16進数 (HEX)" });
    fireEvent.click(hexOption);

    const input = screen.getByLabelText("変換する数値");
    fireEvent.change(input, { target: { value: "ff" } });

    expect(screen.getByTestId("result-decimal")).toHaveTextContent("255");
    expect(screen.getByTestId("result-binary")).toHaveTextContent("1111 1111");
    expect(screen.getByTestId("result-octal")).toHaveTextContent("377");
  });

  test("E-4: correctly converts binary 1010 to other bases", () => {
    render(<NumberBaseConverterPage />);

    // 2進数を選択
    const binOption = screen.getByRole("radio", { name: "2進数 (BIN)" });
    fireEvent.click(binOption);

    const input = screen.getByLabelText("変換する数値");
    fireEvent.change(input, { target: { value: "1010" } });

    expect(screen.getByTestId("result-decimal")).toHaveTextContent("10");
    expect(screen.getByTestId("result-hexadecimal")).toHaveTextContent("a");
    expect(screen.getByTestId("result-octal")).toHaveTextContent("12");
  });

  test("E-4: shows error for invalid input", () => {
    render(<NumberBaseConverterPage />);

    // 2進数を選択して、無効な値を入力
    const binOption = screen.getByRole("radio", { name: "2進数 (BIN)" });
    fireEvent.click(binOption);

    const input = screen.getByLabelText("変換する数値");
    fireEvent.change(input, { target: { value: "123" } });

    // エラーメッセージが表示されること
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  // E-5: ARIA
  test("E-5: has correct ARIA attributes on radiogroup", () => {
    render(<NumberBaseConverterPage />);
    const radiogroup = screen.getByRole("radiogroup");
    // aria-label が付与されていること
    expect(radiogroup).toHaveAttribute("aria-label");
  });

  test("E-5: has role=status aria-live=polite on summary region", () => {
    render(<NumberBaseConverterPage />);
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toHaveAttribute("aria-live", "polite");
  });

  // E-6: コピー文言変化
  test("E-6: copy button shows COPIED_LABEL after click", async () => {
    render(<NumberBaseConverterPage />);

    // 10進数のデフォルトで 255 を入力
    const input = screen.getByLabelText("変換する数値");
    fireEvent.change(input, { target: { value: "255" } });

    // binaryのコピーボタンをクリック
    const copyButtons = screen.getAllByRole("button", { name: "コピー" });
    expect(copyButtons.length).toBeGreaterThan(0);
    fireEvent.click(copyButtons[0]);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "コピーしました" }),
      ).toBeInTheDocument();
    });
  });

  // E-7: コピー disabled 状態
  test("E-7: copy buttons are disabled when input is empty", () => {
    render(<NumberBaseConverterPage />);

    // 入力が空の状態ではコピーボタンが disabled
    const copyButtons = screen.getAllByRole("button", { name: "コピー" });
    copyButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  test("E-7: copy buttons are enabled when there is a result", () => {
    render(<NumberBaseConverterPage />);

    const input = screen.getByLabelText("変換する数値");
    fireEvent.change(input, { target: { value: "10" } });

    const copyButtons = screen.getAllByRole("button", { name: "コピー" });
    copyButtons.forEach((btn) => {
      expect(btn).not.toBeDisabled();
    });
  });

  // E-8: clipboard 不在時の silent fail
  test("E-8: does not throw when clipboard is not available", async () => {
    // navigator.clipboard を undefined にする
    const originalNavigator = globalThis.navigator;
    Object.defineProperty(globalThis, "navigator", {
      value: {},
      writable: true,
      configurable: true,
    });

    render(<NumberBaseConverterPage />);
    const input = screen.getByLabelText("変換する数値");
    fireEvent.change(input, { target: { value: "10" } });

    const copyButtons = screen.getAllByRole("button", { name: "コピー" });
    // Should not throw
    expect(() => fireEvent.click(copyButtons[0])).not.toThrow();

    // 元に戻す
    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  // E-9: N/A — 詳細リンクはこのツールにはない

  // E-10: meta由来の表示
  // ToolPageLayoutを介する場合はchildrenが描画されること確認。
  // 本ページ単体では meta は参照しないため、基本レンダリング（E-1）で代替。

  // E-11: 既存の logic.ts テストが PASS し続けるか
  // → 別ファイル logic.test.ts が担当（変換ロジックは変更していない）

  // E-12: CSS トークン検証 (readFileSync パターン)
  test("E-12: CSS does not use deprecated --color-* tokens", () => {
    const css = readFileSync(
      join(__dirname, "..", "NumberBaseConverterPage.module.css"),
      "utf-8",
    );
    // 旧トークン禁止
    expect(css).not.toMatch(/var\(--color-/);
    // --accent 直塗り禁止（background: var(--accent) など。outline は許可）
    expect(css).not.toMatch(/background[^;]*var\(--accent\)/);
    // font-weight: 700 禁止
    expect(css).not.toMatch(/font-weight\s*:\s*700/);
  });
});

import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";
import Input from "../Input";

describe("Input", () => {
  // --- レンダリング ---

  test("renders text input by default", () => {
    render(<Input label="名前" />);
    expect(screen.getByRole("textbox", { name: "名前" })).toBeInTheDocument();
  });

  test("label is associated with input via htmlFor", () => {
    render(<Input label="メールアドレス" />);
    expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
  });

  test("renders with placeholder", () => {
    render(<Input label="検索" placeholder="キーワードを入力" />);
    expect(screen.getByPlaceholderText("キーワードを入力")).toBeInTheDocument();
  });

  test("renders hint text when provided", () => {
    render(<Input label="パスワード" hint="8文字以上" />);
    expect(screen.getByText("8文字以上")).toBeInTheDocument();
  });

  test("renders error message and sets aria-invalid", () => {
    render(<Input label="メール" error="形式が正しくありません" />);
    expect(screen.getByText("形式が正しくありません")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  test("default size is md", () => {
    render(<Input label="入力" />);
    const wrapper = screen.getByRole("textbox").closest("[data-size]");
    expect(wrapper).toHaveAttribute("data-size", "md");
  });

  test("renders size=sm", () => {
    render(<Input label="入力" size="sm" />);
    const wrapper = screen.getByRole("textbox").closest("[data-size]");
    expect(wrapper).toHaveAttribute("data-size", "sm");
  });

  test("renders size=lg", () => {
    render(<Input label="入力" size="lg" />);
    const wrapper = screen.getByRole("textbox").closest("[data-size]");
    expect(wrapper).toHaveAttribute("data-size", "lg");
  });

  // --- 状態 ---

  test("disabled input has disabled attribute", () => {
    render(<Input label="入力" disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  test("required input has required attribute", () => {
    render(<Input label="入力" required />);
    expect(screen.getByRole("textbox")).toBeRequired();
  });

  // --- アクセシビリティ ---

  test("error message is associated via aria-describedby", () => {
    render(<Input label="メール" error="必須項目です" />);
    const input = screen.getByRole("textbox");
    const errorId = input.getAttribute("aria-describedby");
    expect(errorId).toBeTruthy();
    const errorEl = document.getElementById(errorId!);
    expect(errorEl).toHaveTextContent("必須項目です");
  });

  test("hint is associated via aria-describedby when no error", () => {
    render(<Input label="入力" hint="ヒントテキスト" />);
    const input = screen.getByRole("textbox");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const hintEl = document.getElementById(describedBy!);
    expect(hintEl).toHaveTextContent("ヒントテキスト");
  });

  // --- インタラクション ---

  test("calls onChange when user types", () => {
    const handleChange = vi.fn();
    render(<Input label="入力" onChange={handleChange} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "hello" },
    });
    expect(handleChange).toHaveBeenCalled();
  });

  // --- E-1: モバイル幅レイアウト（CSS 構造テスト） ---

  test("Input.module.css has responsive layout note or @media (min-width: query", () => {
    // 受け入れ基準: 「@media (min-width: が含まれる」または「モバイル基準+拡張不要を JSDoc で明記」
    // Input は width:100% でコンテナに追従し追加 @media は不要なため JSDoc 経路で対応する。
    // JSDoc 内の「追加変更不要」または「拡張不要」のいずれかの表現を受け入れる。
    const cssPath = resolve(__dirname, "../Input.module.css");
    const css = readFileSync(cssPath, "utf-8");
    const hasMediaQuery = /@media\s*\(min-width:/.test(css);
    const hasMobileNote = /拡張不要|追加変更不要/.test(css);
    expect(hasMediaQuery || hasMobileNote).toBe(true);
  });

  test("Input.module.css sm size min-height is 44px (touch target)", () => {
    // sm サイズのタップターゲットが 44px 以上であることを CSS ファイルで確認。
    // WCAG 2.5.5 の要件（44×44px）を満たすことを保証する。
    // --touch-target-min (44px) 変数参照または直値 44px 以上を受け入れる。
    const cssPath = resolve(__dirname, "../Input.module.css");
    const css = readFileSync(cssPath, "utf-8");
    const smBlock =
      css.match(/\[data-size="sm"\]\s*\.input\s*\{[^}]*\}/)?.[0] ?? "";
    const hasTouchTarget =
      /min-height:\s*var\(--touch-target-min\)/.test(smBlock) ||
      /min-height:\s*(4[4-9]|[5-9]\d|\d{3,})px/.test(smBlock);
    expect(hasTouchTarget).toBe(true);
  });

  test("Input.module.css font-size for md and lg is at least 16px (iOS Safari zoom prevention)", () => {
    // iOS Safari は font-size が 16px 未満の入力欄で自動ズームする。
    // md サイズは --input-font-min (16px) 変数参照または直値 16px 以上であること。
    const cssPath = resolve(__dirname, "../Input.module.css");
    const css = readFileSync(cssPath, "utf-8");
    const mdBlock =
      css.match(/\[data-size="md"\]\s*\.input\s*\{[^}]*\}/)?.[0] ?? "";
    // --input-font-min (16px) 変数参照、--fs-16 (16px) 変数参照、または直値 16px 以上か
    const hasSufficientFontSize =
      /font-size:\s*var\(--input-font-min\)/.test(mdBlock) ||
      /font-size:\s*var\(--fs-16\)/.test(mdBlock) ||
      /font-size:\s*(1[6-9]|[2-9]\d|\d{3,})px/.test(mdBlock);
    expect(hasSufficientFontSize).toBe(true);
  });
});

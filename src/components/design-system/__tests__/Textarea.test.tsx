import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";
import Textarea from "../Textarea";

describe("Textarea", () => {
  // --- レンダリング ---

  test("renders textarea element", () => {
    render(<Textarea label="本文" />);
    expect(screen.getByRole("textbox", { name: "本文" })).toBeInTheDocument();
  });

  test("label is associated with textarea", () => {
    render(<Textarea label="コメント" />);
    expect(screen.getByLabelText("コメント")).toBeInTheDocument();
  });

  test("renders hint text", () => {
    render(<Textarea label="本文" hint="500文字以内" />);
    expect(screen.getByText("500文字以内")).toBeInTheDocument();
  });

  test("renders error message and sets aria-invalid", () => {
    render(<Textarea label="本文" error="入力してください" />);
    expect(screen.getByText("入力してください")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  // --- 状態 ---

  test("disabled state", () => {
    render(<Textarea label="入力" disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  test("required state", () => {
    render(<Textarea label="入力" required />);
    expect(screen.getByRole("textbox")).toBeRequired();
  });

  // --- アクセシビリティ ---

  test("error is associated via aria-describedby", () => {
    render(<Textarea label="入力" error="エラー" />);
    const textarea = screen.getByRole("textbox");
    const describedBy = textarea.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const errorEl = document.getElementById(describedBy!);
    expect(errorEl).toHaveTextContent("エラー");
  });

  test("hint is associated via aria-describedby when no error", () => {
    render(<Textarea label="入力" hint="ヒント" />);
    const textarea = screen.getByRole("textbox");
    const describedBy = textarea.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const hintEl = document.getElementById(describedBy!);
    expect(hintEl).toHaveTextContent("ヒント");
  });

  // --- インタラクション ---

  test("calls onChange when user types", () => {
    const handleChange = vi.fn();
    render(<Textarea label="入力" onChange={handleChange} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "test" },
    });
    expect(handleChange).toHaveBeenCalled();
  });

  // --- E-1: モバイル幅レイアウト（CSS 構造テスト） ---

  test("Textarea.module.css contains @media (min-width: query for responsive layout", () => {
    const cssPath = resolve(__dirname, "../Textarea.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toMatch(/@media\s*\(min-width:/);
  });

  test("Textarea.module.css font-size is at least 16px (iOS Safari zoom prevention)", () => {
    // iOS Safari は font-size が 16px 未満の textarea で自動ズームする。
    // .textarea ブロックの font-size が --input-font-min (16px) 変数参照または 16px 以上であること。
    const cssPath = resolve(__dirname, "../Textarea.module.css");
    const css = readFileSync(cssPath, "utf-8");
    const textareaBlock = css.match(/\.textarea\s*\{[^}]*\}/)?.[0] ?? "";
    const hasSufficientFontSize =
      /font-size:\s*var\(--input-font-min\)/.test(textareaBlock) ||
      /font-size:\s*var\(--fs-16\)/.test(textareaBlock) ||
      /font-size:\s*(1[6-9]|[2-9]\d|\d{3,})px/.test(textareaBlock);
    expect(hasSufficientFontSize).toBe(true);
  });
});

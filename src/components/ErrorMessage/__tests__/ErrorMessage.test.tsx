import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";
import ErrorMessage from "@/components/ErrorMessage";

describe("ErrorMessage", () => {
  // --- M-4: props 未指定時に既定日本語フォールバックが表示される ---

  it("message も children も渡さない場合、既定の日本語フォールバック文言が表示される", () => {
    render(<ErrorMessage />);
    const alert = screen.getByRole("alert");
    // 日本語が含まれることを確認（空文字・英語生エラーにならない）
    expect(alert.textContent).toMatch(/[　-鿿＀-￯]/);
    expect(alert.textContent).not.toBe("");
  });

  it("message に空文字を渡した場合も既定の日本語フォールバック文言が表示される", () => {
    render(<ErrorMessage message="" />);
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toMatch(/[　-鿿＀-￯]/);
    expect(alert.textContent).not.toBe("");
  });

  it("children に空文字を渡した場合も既定の日本語フォールバック文言が表示される", () => {
    render(<ErrorMessage>{""}</ErrorMessage>);
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toMatch(/[　-鿿＀-￯]/);
    expect(alert.textContent).not.toBe("");
  });

  // --- message 指定時はその文言が表示される ---

  it("message を渡すと指定した文言が表示される", () => {
    render(<ErrorMessage message="入力内容を確認してください。" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("入力内容を確認してください。");
  });

  it("英語のエラー文字列を message で渡すと、そのまま表示される（ツール側の責務）", () => {
    render(<ErrorMessage message="Generation failed" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Generation failed");
  });

  // --- children 指定時はその内容が表示される ---

  it("children を渡すと children の内容が表示される", () => {
    render(<ErrorMessage>ファイル形式が正しくありません。</ErrorMessage>);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("ファイル形式が正しくありません。");
  });

  it("children が message より優先される", () => {
    render(
      <ErrorMessage message="message の文言">children の文言</ErrorMessage>,
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("children の文言");
    expect(alert).not.toHaveTextContent("message の文言");
  });

  // --- ARIA ---

  it("role='alert' を持つ", () => {
    render(<ErrorMessage message="エラー" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("aria-live を明示的に持たない（role=alert が暗黙的に assertive のため二重指定防止）", () => {
    render(<ErrorMessage message="エラー" />);
    const alert = screen.getByRole("alert");
    expect(alert).not.toHaveAttribute("aria-live");
  });

  // --- CSS 規約検証 (readFileSync パターン) ---

  it("CSS が --paper-2 を背景色として使用している（DESIGN.md §2: エラーは色ベタでなく墨/朱+文字で示す）", () => {
    const cssPath = resolve(__dirname, "../ErrorMessage.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toContain("--paper-2");
  });

  it("CSS が --rule を中立のボーダー色として使用している（色付き片罫にしない）", () => {
    const cssPath = resolve(__dirname, "../ErrorMessage.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toContain("--rule");
  });

  it("CSS が --accent を文字色として使用している（DESIGN.md §2: 朱+文字でエラーを示す）", () => {
    const cssPath = resolve(__dirname, "../ErrorMessage.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toContain("color: var(--accent)");
  });

  it("CSS が --radius を使用している（DESIGN.md §4: インタラクティブ要素・値札のいずれでもないため 0px 基調）", () => {
    const cssPath = resolve(__dirname, "../ErrorMessage.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toContain("var(--radius)");
  });

  it("CSS に font-weight: 700 が存在しない（DESIGN.md §3 制約）", () => {
    const cssPath = resolve(__dirname, "../ErrorMessage.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight\s*:\s*700/);
  });
});

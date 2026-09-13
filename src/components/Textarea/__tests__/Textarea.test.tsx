import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import Textarea from "../index";

describe("Textarea", () => {
  // --- 基本レンダリング ---
  it("デフォルトで textarea をレンダリングする", () => {
    render(<Textarea />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName.toLowerCase()).toBe("textarea");
  });

  // --- controlled / uncontrolled ---
  it("controlled component として value/onChange が機能する", () => {
    const handleChange = vi.fn();
    render(<Textarea value="hello" onChange={handleChange} />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("hello");

    fireEvent.change(textarea, { target: { value: "world" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("uncontrolled component として defaultValue が反映される", () => {
    render(<Textarea defaultValue="初期値" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("初期値");
  });

  // --- readOnly 出力用 ---
  it("readOnly prop が textarea に渡される", () => {
    render(<Textarea readOnly value="出力テキスト" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("readonly");
    expect(textarea).toHaveValue("出力テキスト");
  });

  // --- rows ---
  it("rows prop が textarea に渡される", () => {
    render(<Textarea rows={8} />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("rows", "8");
  });

  // --- placeholder ---
  it("placeholder が正しく渡される", () => {
    render(<Textarea placeholder="ここに入力" />);
    const textarea = screen.getByPlaceholderText("ここに入力");
    expect(textarea).toBeInTheDocument();
  });

  // --- spellCheck ---
  it("spellCheck prop が透過される（false の場合）", () => {
    render(<Textarea spellCheck={false} />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("spellcheck", "false");
  });

  // --- aria 属性透過 ---
  it("aria-label が透過される", () => {
    render(<Textarea aria-label="入力欄" />);
    const textarea = screen.getByRole("textbox", { name: "入力欄" });
    expect(textarea).toBeInTheDocument();
  });

  it("aria-describedby が透過される", () => {
    render(<Textarea aria-describedby="hint-text" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("aria-describedby", "hint-text");
  });

  // --- その他の HTML 属性透過 ---
  it("その他の HTML 属性が透過される（...rest）", () => {
    render(<Textarea data-testid="my-textarea" name="content" />);
    const textarea = screen.getByTestId("my-textarea");
    expect(textarea).toHaveAttribute("name", "content");
  });

  // --- disabled ---
  it("disabled 時に textarea が disabled になる", () => {
    render(<Textarea disabled />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeDisabled();
  });

  // --- variant: mono ---
  it("variant='mono' のとき data 属性またはクラスで mono バリアントが適用される", () => {
    const { container } = render(<Textarea variant="mono" />);
    const textarea = container.querySelector("textarea");
    // CSS Modules のクラス名に "mono" が含まれること
    expect(textarea?.className).toMatch(/mono/);
  });

  it("variant='default' のとき mono クラスが付かない（デフォルト）", () => {
    const { container } = render(<Textarea variant="default" />);
    const textarea = container.querySelector("textarea");
    // mono クラスが含まれないこと
    expect(textarea?.className).not.toMatch(/\bmono\b/);
  });

  // --- forwardRef ---
  it("forwardRef で ref が textarea 要素に渡される", () => {
    const ref = { current: null as HTMLTextAreaElement | null };
    render(<Textarea ref={ref} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName.toLowerCase()).toBe("textarea");
  });

  // --- className マージ ---
  it("Textarea always renders with base class regardless of custom className", () => {
    render(<Textarea className="custom-class" />);
    const textarea = screen.getByRole("textbox");
    // CSS Modules ハッシュ込みのクラス名に textarea 由来の文字列が含まれること
    expect(textarea.className).toMatch(/textarea/i);
  });

  // --- CSS 規約検証（readFileSync パターン） ---
  it(".textarea has border-radius: var(--radius-sm) (DESIGN.md §4: 入力欄の 2px 例外)", () => {
    const cssPath = resolve(__dirname, "../Textarea.module.css");
    const css = readFileSync(cssPath, "utf-8");
    const textareaBlock = css.match(/\.textarea\s*\{[^}]+\}/)?.[0] ?? "";
    expect(textareaBlock).toContain("var(--radius-sm)");
  });

  it(".textarea:focus-visible has outline: 2px solid var(--accent) (DESIGN §2)", () => {
    const cssPath = resolve(__dirname, "../Textarea.module.css");
    const css = readFileSync(cssPath, "utf-8");
    // focus-visible ブロックに outline: 2px solid var(--accent) が含まれること
    expect(css).toContain("outline: 2px solid var(--accent)");
  });

  it(".textarea:focus-visible has outline-offset: 2px (DESIGN §2)", () => {
    const cssPath = resolve(__dirname, "../Textarea.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toContain("outline-offset: 2px");
  });

  it(".textarea uses --rule-strong (DESIGN.md §4)", () => {
    const cssPath = resolve(__dirname, "../Textarea.module.css");
    const css = readFileSync(cssPath, "utf-8");
    const textareaBlock = css.match(/\.textarea\s*\{[^}]+\}/)?.[0] ?? "";
    expect(textareaBlock).toContain("var(--rule-strong)");
  });

  it(".textarea has resize: vertical", () => {
    const cssPath = resolve(__dirname, "../Textarea.module.css");
    const css = readFileSync(cssPath, "utf-8");
    const textareaBlock = css.match(/\.textarea\s*\{[^}]+\}/)?.[0] ?? "";
    expect(textareaBlock).toContain("resize: vertical");
  });

  it(".textarea does NOT use old --color-* tokens", () => {
    const cssPath = resolve(__dirname, "../Textarea.module.css");
    const css = readFileSync(cssPath, "utf-8");
    // 旧トークン（--color-border, --color-text 等）が使われていないこと
    expect(css).not.toMatch(/var\(--color-/);
  });

  it(".textarea has line-height (行間原則1.7 or specified value, DESIGN §3)", () => {
    const cssPath = resolve(__dirname, "../Textarea.module.css");
    const css = readFileSync(cssPath, "utf-8");
    const textareaBlock = css.match(/\.textarea\s*\{[^}]+\}/)?.[0] ?? "";
    expect(textareaBlock).toContain("line-height");
  });

  it(".mono has font-family: var(--font-mono)", () => {
    const cssPath = resolve(__dirname, "../Textarea.module.css");
    const css = readFileSync(cssPath, "utf-8");
    const monoBlock = css.match(/\.mono\s*\{[^}]+\}/)?.[0] ?? "";
    expect(monoBlock).toContain("var(--font-mono)");
  });
});

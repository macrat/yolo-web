import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
});

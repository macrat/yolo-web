import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
});

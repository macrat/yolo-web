import { expect, test, describe, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import GuessInput from "@/components/games/kanji-kanaru/GuessInput";

describe("GuessInput", () => {
  test("renders input field and submit button", () => {
    render(<GuessInput onSubmit={() => null} disabled={false} />);
    expect(screen.getByLabelText("漢字を入力")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "送信" })).toBeInTheDocument();
  });

  test("calls onSubmit with input value when submit button is clicked", () => {
    const onSubmit = vi.fn().mockReturnValue(null);
    render(<GuessInput onSubmit={onSubmit} disabled={false} />);

    const input = screen.getByLabelText("漢字を入力");
    fireEvent.change(input, { target: { value: "山" } });
    fireEvent.click(screen.getByRole("button", { name: "送信" }));

    expect(onSubmit).toHaveBeenCalledWith("山");
  });

  test("shows error when onSubmit returns an error message", () => {
    const onSubmit = vi.fn().mockReturnValue("常用漢字ではありません");
    render(<GuessInput onSubmit={onSubmit} disabled={false} />);

    const input = screen.getByLabelText("漢字を入力");
    fireEvent.change(input, { target: { value: "x" } });
    fireEvent.click(screen.getByRole("button", { name: "送信" }));

    expect(screen.getByText("常用漢字ではありません")).toBeInTheDocument();
  });

  test("shows error for empty input", () => {
    const onSubmit = vi.fn();
    render(<GuessInput onSubmit={onSubmit} disabled={false} />);

    fireEvent.click(screen.getByRole("button", { name: "送信" }));

    expect(screen.getByText("漢字を1文字入力してください")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("input and button are disabled when disabled prop is true", () => {
    render(<GuessInput onSubmit={() => null} disabled={true} />);

    const input = screen.getByLabelText("漢字を入力");
    const button = screen.getByRole("button", { name: "送信" });

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  test("clears input after successful submission", () => {
    const onSubmit = vi.fn().mockReturnValue(null);
    render(<GuessInput onSubmit={onSubmit} disabled={false} />);

    const input = screen.getByLabelText("漢字を入力") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "山" } });
    fireEvent.click(screen.getByRole("button", { name: "送信" }));

    expect(input.value).toBe("");
  });

  test("does not clear input after failed submission", () => {
    const onSubmit = vi.fn().mockReturnValue("エラー");
    render(<GuessInput onSubmit={onSubmit} disabled={false} />);

    const input = screen.getByLabelText("漢字を入力") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "x" } });
    fireEvent.click(screen.getByRole("button", { name: "送信" }));

    expect(input.value).toBe("x");
  });
});

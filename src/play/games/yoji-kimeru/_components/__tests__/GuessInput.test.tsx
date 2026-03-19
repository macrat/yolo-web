import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GuessInput from "@/play/games/yoji-kimeru/_components/GuessInput";

describe("GuessInput", () => {
  test("renders input field and submit button", () => {
    const onSubmit = vi.fn().mockResolvedValue(null);
    render(<GuessInput onSubmit={onSubmit} disabled={false} />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "送信" })).toBeInTheDocument();
  });

  test("shows error when submitting empty input", async () => {
    const onSubmit = vi.fn().mockResolvedValue(null);
    render(<GuessInput onSubmit={onSubmit} disabled={false} />);

    fireEvent.click(screen.getByRole("button", { name: "送信" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "四字熟語を入力してください",
      );
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("calls async onSubmit with input value", async () => {
    const onSubmit = vi.fn().mockResolvedValue(null);
    render(<GuessInput onSubmit={onSubmit} disabled={false} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "一期一会" } });
    fireEvent.click(screen.getByRole("button", { name: "送信" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith("一期一会");
    });
  });

  test("clears input on successful submission", async () => {
    const onSubmit = vi.fn().mockResolvedValue(null);
    render(<GuessInput onSubmit={onSubmit} disabled={false} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "一期一会" } });
    fireEvent.click(screen.getByRole("button", { name: "送信" }));

    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });

  test("shows error message from async onSubmit", async () => {
    const errorMsg = "この組み合わせはすでに入力しました";
    const onSubmit = vi.fn().mockResolvedValue(errorMsg);
    render(<GuessInput onSubmit={onSubmit} disabled={false} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "花鳥風月" } });
    fireEvent.click(screen.getByRole("button", { name: "送信" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(errorMsg);
    });
    // Input should not be cleared on error
    expect(input).toHaveValue("花鳥風月");
  });

  test("disables input and button when disabled prop is true", () => {
    const onSubmit = vi.fn().mockResolvedValue(null);
    render(<GuessInput onSubmit={onSubmit} disabled={true} />);

    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  test("disables input and button when submitting prop is true", () => {
    const onSubmit = vi.fn().mockResolvedValue(null);
    render(
      <GuessInput onSubmit={onSubmit} disabled={false} submitting={true} />,
    );

    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  test("shows submitting placeholder when submitting is true", () => {
    const onSubmit = vi.fn().mockResolvedValue(null);
    render(
      <GuessInput onSubmit={onSubmit} disabled={false} submitting={true} />,
    );

    expect(screen.getByRole("textbox")).toHaveAttribute(
      "placeholder",
      "送信中...",
    );
  });

  test("does not call onSubmit when submitting is true", async () => {
    const onSubmit = vi.fn().mockResolvedValue(null);
    render(
      <GuessInput onSubmit={onSubmit} disabled={false} submitting={true} />,
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "一期一会" } });
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});

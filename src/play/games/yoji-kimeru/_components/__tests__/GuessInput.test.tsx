import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GuessInput from "@/play/games/yoji-kimeru/_components/GuessInput";

const LABEL = "中級の四字熟語を入力（あと6回）";

describe("GuessInput", () => {
  test("renders input field and submit button", () => {
    const onSubmit = vi.fn().mockResolvedValue({ kind: "accepted" });
    render(<GuessInput label={LABEL} onSubmit={onSubmit} submitting={false} />);

    expect(screen.getByRole("textbox", { name: LABEL })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "送信" })).toBeInTheDocument();
    // 見えるラベルを持ち、プレースホルダに頼らない（DESIGN.md §8）。
    expect(screen.getByText(LABEL).tagName).toBe("LABEL");
  });

  test("ties an input error to the field", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ kind: "accepted" });
    render(<GuessInput label={LABEL} onSubmit={onSubmit} submitting={false} />);

    fireEvent.click(screen.getByRole("button", { name: "送信" }));

    const input = screen.getByRole("textbox");
    await waitFor(() => {
      expect(input).toHaveAttribute("aria-invalid", "true");
    });
    expect(input).toHaveAccessibleDescription("四字熟語を入力してください");
  });

  test("shows error when submitting empty input", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ kind: "accepted" });
    render(<GuessInput label={LABEL} onSubmit={onSubmit} submitting={false} />);

    fireEvent.click(screen.getByRole("button", { name: "送信" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "四字熟語を入力してください",
      );
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("calls async onSubmit with input value", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ kind: "accepted" });
    render(<GuessInput label={LABEL} onSubmit={onSubmit} submitting={false} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "一期一会" } });
    fireEvent.click(screen.getByRole("button", { name: "送信" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith("一期一会");
    });
  });

  test("clears input on successful submission", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ kind: "accepted" });
    render(<GuessInput label={LABEL} onSubmit={onSubmit} submitting={false} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "一期一会" } });
    fireEvent.click(screen.getByRole("button", { name: "送信" }));

    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });

  test("shows error message from async onSubmit", async () => {
    const errorMsg = "この組み合わせはすでに入力しました";
    const onSubmit = vi
      .fn()
      .mockResolvedValue({ kind: "invalid", message: errorMsg });
    render(<GuessInput label={LABEL} onSubmit={onSubmit} submitting={false} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "花鳥風月" } });
    fireEvent.click(screen.getByRole("button", { name: "送信" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(errorMsg);
    });
    // Input should not be cleared on error
    expect(input).toHaveValue("花鳥風月");
  });

  test("shows a failed evaluation outside the field without marking the input invalid", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ kind: "unavailable" });
    render(<GuessInput label={LABEL} onSubmit={onSubmit} submitting={false} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "花鳥風月" } });
    fireEvent.click(screen.getByRole("button", { name: "送信" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "答え合わせができませんでした。時間をおいて、もう一度送ってください",
      );
    });
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-describedby");
    // The input is kept so that the same answer can be sent again.
    expect(input).toHaveValue("花鳥風月");
  });

  test("keeps the field focusable but unchangeable while a guess is being sent", () => {
    const onSubmit = vi.fn().mockResolvedValue({ kind: "accepted" });
    render(<GuessInput label={LABEL} onSubmit={onSubmit} submitting={true} />);

    expect(screen.getByRole("textbox")).not.toBeDisabled();
    expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
    expect(screen.getByRole("button")).toBeDisabled();
  });

  test("says on the button that the guess is being sent", () => {
    const onSubmit = vi.fn().mockResolvedValue({ kind: "accepted" });
    render(<GuessInput label={LABEL} onSubmit={onSubmit} submitting={true} />);

    expect(screen.getByRole("button")).toHaveTextContent("送信中...");
  });

  test("does not call onSubmit when submitting is true", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ kind: "accepted" });
    render(<GuessInput label={LABEL} onSubmit={onSubmit} submitting={true} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "一期一会" } });
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  test("submits on Enter key press", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ kind: "accepted" });
    render(<GuessInput label={LABEL} onSubmit={onSubmit} submitting={false} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "一期一会" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith("一期一会");
    });
  });

  test("does not submit during IME composition", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ kind: "accepted" });
    render(<GuessInput label={LABEL} onSubmit={onSubmit} submitting={false} />);

    const input = screen.getByRole("textbox");
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: "一期一会" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.compositionEnd(input);
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith("一期一会");
    });
  });

  test("clears error message when typing new input", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ kind: "accepted" });
    render(<GuessInput label={LABEL} onSubmit={onSubmit} submitting={false} />);

    fireEvent.click(screen.getByRole("button", { name: "送信" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "四字熟語を入力してください",
      );
    });

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "あ" } });

    expect(screen.queryByRole("alert")).toBeNull();
  });
});

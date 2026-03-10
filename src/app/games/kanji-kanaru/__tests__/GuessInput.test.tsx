import { expect, test, describe, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GuessInput from "@/games/kanji-kanaru/_components/GuessInput";

describe("GuessInput", () => {
  test("renders input field and submit button", () => {
    render(
      <GuessInput onSubmit={() => Promise.resolve(null)} disabled={false} />,
    );
    expect(screen.getByPlaceholderText("漢字を入力")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "\u9001\u4FE1" }),
    ).toBeInTheDocument();
  });

  test("calls onSubmit with input value when submit button is clicked", async () => {
    const onSubmit = vi.fn().mockResolvedValue(null);
    render(<GuessInput onSubmit={onSubmit} disabled={false} />);

    const input = screen.getByPlaceholderText("漢字を入力");
    fireEvent.change(input, { target: { value: "\u5C71" } });
    fireEvent.click(screen.getByRole("button", { name: "\u9001\u4FE1" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith("\u5C71");
    });
  });

  test("shows error when onSubmit returns an error message", async () => {
    const onSubmit = vi
      .fn()
      .mockResolvedValue(
        "\u5E38\u7528\u6F22\u5B57\u3067\u306F\u3042\u308A\u307E\u305B\u3093",
      );
    render(<GuessInput onSubmit={onSubmit} disabled={false} />);

    const input = screen.getByPlaceholderText("漢字を入力");
    fireEvent.change(input, { target: { value: "x" } });
    fireEvent.click(screen.getByRole("button", { name: "\u9001\u4FE1" }));

    await waitFor(() => {
      expect(
        screen.getByText(
          "\u5E38\u7528\u6F22\u5B57\u3067\u306F\u3042\u308A\u307E\u305B\u3093",
        ),
      ).toBeInTheDocument();
    });
  });

  test("shows error for empty input", () => {
    const onSubmit = vi.fn();
    render(<GuessInput onSubmit={onSubmit} disabled={false} />);

    fireEvent.click(screen.getByRole("button", { name: "\u9001\u4FE1" }));

    expect(
      screen.getByText(
        "\u6F22\u5B57\u30921\u6587\u5B57\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044",
      ),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("input and button are disabled when disabled prop is true", () => {
    render(
      <GuessInput onSubmit={() => Promise.resolve(null)} disabled={true} />,
    );

    const input = screen.getByPlaceholderText("漢字を入力");
    const button = screen.getByRole("button", { name: "\u9001\u4FE1" });

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  test("clears input after successful submission", async () => {
    const onSubmit = vi.fn().mockResolvedValue(null);
    render(<GuessInput onSubmit={onSubmit} disabled={false} />);

    const input = screen.getByPlaceholderText("漢字を入力") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "\u5C71" } });
    fireEvent.click(screen.getByRole("button", { name: "\u9001\u4FE1" }));

    await waitFor(() => {
      expect(input.value).toBe("");
    });
  });

  test("does not clear input after failed submission", async () => {
    const onSubmit = vi.fn().mockResolvedValue("\u30A8\u30E9\u30FC");
    render(<GuessInput onSubmit={onSubmit} disabled={false} />);

    const input = screen.getByPlaceholderText("漢字を入力") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "x" } });
    fireEvent.click(screen.getByRole("button", { name: "\u9001\u4FE1" }));

    await waitFor(() => {
      expect(input.value).toBe("x");
    });
  });
});

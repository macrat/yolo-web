import { expect, test, describe, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GuessInput from "@/play/games/kanji-kanaru/_components/GuessInput";
import phrasedStyles from "@/components/PhrasedText/PhrasedText.module.css";

const LABEL = "中級の漢字を1字入力（あと6回）";
const accepted = () => Promise.resolve({ kind: "accepted" as const });

describe("GuessInput", () => {
  test("the field has a visible label that names the difficulty and the remaining guesses", () => {
    render(<GuessInput label={LABEL} onSubmit={accepted} />);
    expect(screen.getByText(LABEL).closest("label")).not.toBeNull();
    expect(screen.getByRole("textbox", { name: LABEL })).toBeInTheDocument();
  });

  test("a label given as phrases breaks only between them, and the field's name is the whole label", () => {
    const phrases = ["中級の", "漢字を", "1字", "入力", "（あと6回）"];
    const { container } = render(
      <GuessInput label={phrases} onSubmit={accepted} />,
    );
    expect(screen.getByRole("textbox", { name: LABEL })).toBeInTheDocument();
    expect(container.querySelector("label")!.innerHTML).toContain(
      phrases.join("<wbr>"),
    );
  });

  test("both faces of the submit button are laid out as one phrase each by PhrasedText", () => {
    render(<GuessInput label={LABEL} onSubmit={accepted} />);
    const faces = [
      ...screen.getByRole("button", { name: "送信" }).querySelectorAll("span"),
    ].filter((span) => span.classList.contains(phrasedStyles.phrased));
    expect(faces.map((span) => span.innerHTML)).toEqual(["送信", "送信中……"]);
  });

  test("calls onSubmit with the input value", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ kind: "accepted" });
    render(<GuessInput label={LABEL} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "山" } });
    fireEvent.click(screen.getByRole("button", { name: "送信" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith("山"));
  });

  test("ties an invalid input message to the field", async () => {
    const onSubmit = vi.fn().mockResolvedValue({
      kind: "invalid",
      message: "常用漢字ではありません",
    });
    render(<GuessInput label={LABEL} onSubmit={onSubmit} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "x" } });
    fireEvent.click(screen.getByRole("button", { name: "送信" }));
    await waitFor(() =>
      expect(screen.getByText("常用漢字ではありません")).toBeInTheDocument(),
    );
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveValue("x");
  });

  test("shows an error for an empty input without submitting", () => {
    const onSubmit = vi.fn();
    render(<GuessInput label={LABEL} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: "送信" }));
    expect(screen.getByText("漢字を1文字入力してください")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("keeps the field usable while sending so the on-screen keyboard stays open", () => {
    render(<GuessInput label={LABEL} onSubmit={accepted} submitting />);
    expect(screen.getByRole("textbox")).toBeEnabled();
    const button = screen.getByRole("button", { name: "送信中……" });
    expect(button).toBeDisabled();
    // 2つの面の字はいつも両方を描き、見えない面は隠す。ボタンの幅が面の字で変わらない。
    expect(button).toHaveTextContent("送信送信中……");
  });

  test("while loading, the field and the button are disabled and described by the loading text", () => {
    render(
      <>
        <p id="loading">読み込んでいます</p>
        <GuessInput
          label={LABEL}
          onSubmit={accepted}
          loading
          loadingTextId="loading"
        />
      </>,
    );
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
    expect(input).toHaveAccessibleDescription("読み込んでいます");
    expect(screen.getByRole("button", { name: "送信" })).toBeDisabled();
  });

  test("clears the input after an accepted guess", async () => {
    render(<GuessInput label={LABEL} onSubmit={accepted} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "山" } });
    fireEvent.click(screen.getByRole("button", { name: "送信" }));
    await waitFor(() => expect(input).toHaveValue(""));
  });

  test("shows a failed evaluation outside the field without marking the input invalid", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ kind: "unavailable" });
    render(<GuessInput label={LABEL} onSubmit={onSubmit} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "山" } });
    fireEvent.click(screen.getByRole("button", { name: "送信" }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "答え合わせができませんでした。時間をおいて、もう一度送ってください",
      ),
    );
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).toHaveValue("山");
  });
});

import { describe, test, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";
import HashGeneratorPage from "../HashGeneratorPage";
import { COPIED_LABEL } from "@/components/hooks/useCopyToClipboard";

// Mock the meta for ToolPageLayout - not needed since we test the page content directly
// HashGeneratorPage is the inner tool, not the full page with layout

describe("HashGeneratorPage", () => {
  beforeEach(() => {
    // Reset clipboard mock
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      configurable: true,
    });
  });

  // E-1: 基本レンダリング
  test("renders without crashing", () => {
    render(<HashGeneratorPage />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  // E-1: 入力欄と生成ボタンが表示される
  test("renders input textarea and generate button", () => {
    render(<HashGeneratorPage />);
    expect(
      screen.getByPlaceholderText("ハッシュ化するテキストを入力..."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "ハッシュ生成" }),
    ).toBeInTheDocument();
  });

  // E-1: フォーマットセレクタが表示される
  test("renders format selector with hex and base64 options", () => {
    render(<HashGeneratorPage />);
    const select = screen.getByDisplayValue("16進数 (Hex)");
    expect(select).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Base64" })).toBeInTheDocument();
  });

  // E-3: 空入力時はコピーボタン・結果が非表示
  test("shows no results on initial empty state", () => {
    render(<HashGeneratorPage />);
    // No hash results shown initially
    expect(screen.queryByText("SHA-256")).not.toBeInTheDocument();
    expect(screen.queryByText("SHA-1")).not.toBeInTheDocument();
  });

  // E-2: 入力してハッシュ生成ボタンを押すと結果が表示される
  test("generates hashes when button is clicked with input", async () => {
    render(<HashGeneratorPage />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello" } });
    const button = screen.getByRole("button", { name: "ハッシュ生成" });
    await act(async () => {
      fireEvent.click(button);
    });
    await waitFor(() => {
      expect(screen.getByText("SHA-1")).toBeInTheDocument();
      expect(screen.getByText("SHA-256")).toBeInTheDocument();
      expect(screen.getByText("SHA-384")).toBeInTheDocument();
      expect(screen.getByText("SHA-512")).toBeInTheDocument();
    });
  });

  // E-4: SHA-256 of "hello" = known value in hex
  test("generates correct SHA-256 hash for hello", async () => {
    render(<HashGeneratorPage />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "ハッシュ生成" }));
    });
    await waitFor(() => {
      expect(
        screen.getByText(
          "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
        ),
      ).toBeInTheDocument();
    });
  });

  // E-5: ARIA - live region exists for status
  test("has role=status aria-live=polite for results summary", () => {
    render(<HashGeneratorPage />);
    const statusEl = screen.getByRole("status");
    expect(statusEl).toBeInTheDocument();
    expect(statusEl).toHaveAttribute("aria-live", "polite");
  });

  // E-5: C-3 - live region contains actual text node summary after generation
  test("live region shows summary text after hash generation", async () => {
    render(<HashGeneratorPage />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "ハッシュ生成" }));
    });
    await waitFor(() => {
      const statusEl = screen.getByRole("status");
      // Summary text should be present (non-empty)
      expect(statusEl.textContent).not.toBe("");
      expect(statusEl.textContent).toMatch(/ハッシュ値|生成/);
    });
  });

  // E-6: コピー文言変化 - 各ハッシュ行にコピーボタンがあり、コピー後に文言が変わる
  // コピーボタンは aria-label="SHA-Xxxのハッシュをコピー" を持つ
  test("copy button label changes to COPIED_LABEL after copy", async () => {
    render(<HashGeneratorPage />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "ハッシュ生成" }));
    });
    // Wait for SHA-256 copy button to appear (aria-label contains "SHA-256")
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /SHA-256のハッシュ値をコピー/ }),
      ).toBeInTheDocument();
    });
    const sha256CopyButton = screen.getByRole("button", {
      name: /SHA-256のハッシュ値をコピー/,
    });
    await act(async () => {
      fireEvent.click(sha256CopyButton);
    });
    await waitFor(() => {
      // After copy, the button text content becomes COPIED_LABEL
      expect(
        screen.getByRole("button", { name: new RegExp(COPIED_LABEL) }),
      ).toBeInTheDocument();
    });
  });

  // E-7: 結果が空(未生成)のとき、コピーボタンが表示されない
  test("no copy buttons when no results generated", () => {
    render(<HashGeneratorPage />);
    // In the initial state, there should be no copy buttons for hash results
    // (only the "ハッシュ生成" button is present)
    const allButtons = screen.getAllByRole("button");
    expect(allButtons).toHaveLength(1); // only "ハッシュ生成" button
  });

  // E-7: 入力が空の状態でボタンを押してもコピーボタンが出ない
  test("no copy buttons when generate pressed with empty input", async () => {
    render(<HashGeneratorPage />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "ハッシュ生成" }));
    });
    const allButtons = screen.getAllByRole("button");
    expect(allButtons).toHaveLength(1); // only "ハッシュ生成" button
  });

  // E-8: clipboard 不在時の silent fail
  test("does not throw when clipboard is unavailable", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
    });
    render(<HashGeneratorPage />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "ハッシュ生成" }));
    });
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /SHA-256のハッシュ値をコピー/ }),
      ).toBeInTheDocument();
    });
    const sha256CopyButton = screen.getByRole("button", {
      name: /SHA-256のハッシュ値をコピー/,
    });
    // Should not throw
    expect(() => fireEvent.click(sha256CopyButton)).not.toThrow();
  });

  // E-10: The component renders correctly
  test("renders textarea with expected placeholder text", () => {
    render(<HashGeneratorPage />);
    expect(
      screen.getByPlaceholderText("ハッシュ化するテキストを入力..."),
    ).toBeInTheDocument();
  });

  // A-4 / E-2: エラー表示に ErrorMessage コンポーネント (role=alert) が使われるか
  // Web Crypto API が利用不能な環境を再現するため、crypto.subtle.digest を投げるように mock する
  test("shows ErrorMessage (role=alert) when hash generation fails", async () => {
    // crypto.subtle.digest を一時的に失敗させてエラーパスをテストする
    const original = crypto.subtle.digest.bind(crypto.subtle);
    vi.spyOn(crypto.subtle, "digest").mockRejectedValueOnce(
      new Error("not supported"),
    );

    render(<HashGeneratorPage />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "ハッシュ生成" }));
    });
    await waitFor(() => {
      // ErrorMessage renders a <p role="alert">
      const alertEl = screen.getByRole("alert");
      expect(alertEl).toBeInTheDocument();
      // ErrorMessage に渡された日本語メッセージが表示される
      expect(alertEl.textContent).toMatch(/エラー|ハッシュ/);
    });

    // restore
    vi.restoreAllMocks();
    void original;
  });

  // E-12: CSS token verification
  test("CSS does not use deprecated --color-* tokens", () => {
    const cssPath = resolve(__dirname, "../HashGeneratorPage.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  test("CSS does not use --accent as fill/background directly", () => {
    const cssPath = resolve(__dirname, "../HashGeneratorPage.module.css");
    const css = readFileSync(cssPath, "utf-8");
    // --accent should not be used as background-color
    expect(css).not.toMatch(/background(-color)?\s*:\s*var\(--accent\)/);
  });

  test("CSS does not use font-weight: 700", () => {
    const cssPath = resolve(__dirname, "../HashGeneratorPage.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight\s*:\s*700/);
  });
});

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";

// logic.ts の generateQrCode をモック（UI テスト観点）
vi.mock("../logic", () => ({
  generateQrCode: vi
    .fn()
    .mockImplementation((text: string): import("../logic").QrCodeResult => {
      if (!text)
        return { success: false, svgTag: "", dataUrl: "", error: "空入力" };
      if (text === "TOOLONG_ERROR")
        return {
          success: false,
          svgTag: "",
          dataUrl: "",
          error: "Too long",
        };
      return {
        success: true,
        svgTag: '<svg xmlns="http://www.w3.org/2000/svg"><rect /></svg>',
        dataUrl: "data:image/png;base64,abc123",
      };
    }),
}));

import QrCodePage from "../QrCodePage";

describe("QrCodePage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  // E-1: 基本レンダリング
  test("renders without crashing", () => {
    render(<QrCodePage />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  // E-1: テキスト入力欄とセレクトが表示される
  test("renders input textarea and error correction select", () => {
    render(<QrCodePage />);
    expect(
      screen.getByPlaceholderText(/URLまたはテキストを入力/),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  // E-3: 空入力初期状態ではダウンロードボタンが disabled
  test("download button is disabled on initial empty state", () => {
    render(<QrCodePage />);
    const dlButton = screen.getByRole("button", { name: /ダウンロード/ });
    expect(dlButton).toBeDisabled();
  });

  // E-3: 空入力ではエラーが表示されない
  test("no error message shown on empty input", async () => {
    render(<QrCodePage />);
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // E-2: 入力があるとQRコードが生成されダウンロードボタンが有効になる
  test("enables download button after input and QR generation", async () => {
    render(<QrCodePage />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "https://example.com" } });
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    const dlButton = screen.getByRole("button", { name: /ダウンロード/ });
    expect(dlButton).not.toBeDisabled();
  });

  // E-4: 変換ロジックの正確性 - 入力でgenerateQrCodeが呼ばれる
  test("calls generateQrCode with input text and selected error correction level", async () => {
    const { generateQrCode } = await import("../logic");
    render(<QrCodePage />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello" } });
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    expect(generateQrCode).toHaveBeenCalledWith("hello", "M");
  });

  // E-5: ARIA - ライブリージョンにrole=status aria-live=politeがある
  test("has role=status aria-live=polite for QR generation status", () => {
    render(<QrCodePage />);
    const statusEl = screen.getByRole("status");
    expect(statusEl).toBeInTheDocument();
    expect(statusEl).toHaveAttribute("aria-live", "polite");
  });

  // C-3: ライブリージョンには実テキストノードのサマリがある（QR生成後）
  test("live region shows actual text summary after QR generation", async () => {
    render(<QrCodePage />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "https://example.com" } });
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    const statusEl = screen.getByRole("status");
    expect(statusEl.textContent).not.toBe("");
    expect(statusEl.textContent).toMatch(/QR|生成/);
  });

  // E-5: ARIA - ダウンロードボタンのaria-label
  test("download button has aria-label", () => {
    render(<QrCodePage />);
    const dlButton = screen.getByRole("button", { name: /ダウンロード/ });
    expect(dlButton).toBeInTheDocument();
  });

  // エラー処理: エラー発生時にErrorMessageが表示される（A-4日本語化）
  test("shows Japanese error message via ErrorMessage when QR generation fails", async () => {
    render(<QrCodePage />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "TOOLONG_ERROR" } });
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    // ErrorMessage uses role="alert"
    const alertEl = screen.getByRole("alert");
    expect(alertEl).toBeInTheDocument();
    // 日本語メッセージであること（英語生エラーではない）
    expect(alertEl.textContent).toMatch(/[^\x00-\x7F]/); // 非ASCII文字（日本語）を含む
  });

  // E-10: QR画像がSVGとして表示される
  test("renders SVG QR code after input", async () => {
    render(<QrCodePage />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "test" } });
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    // SVGコンテナに role="img" が付与されているか
    const qrImg = screen.getByRole("img");
    expect(qrImg).toBeInTheDocument();
  });

  // debounce: 連続入力でgenerateQrCodeは最後の1回のみ呼ばれる
  test("debounces: generateQrCode called only once after rapid input", async () => {
    const { generateQrCode } = await import("../logic");
    vi.clearAllMocks();
    render(<QrCodePage />);
    const textarea = screen.getByRole("textbox");

    fireEvent.change(textarea, { target: { value: "a" } });
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    fireEvent.change(textarea, { target: { value: "ab" } });
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    fireEvent.change(textarea, { target: { value: "abc" } });
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    // まだ300ms経過していない
    expect(generateQrCode).not.toHaveBeenCalled();
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(generateQrCode).toHaveBeenCalledTimes(1);
    expect(generateQrCode).toHaveBeenCalledWith("abc", "M");
  });

  // reviewer 指摘: ダウンロードボタンが共通 Button コンポーネント (variant="primary") を使っているか確認
  // DESIGN.md L82「ボタンやフォームなどのUIコンポーネントは src/components/ にあるものを使う」
  test("download button uses Button component with variant=primary", () => {
    render(<QrCodePage />);
    const dlButton = screen.getByRole("button", { name: /ダウンロード/ });
    // 共通 Button は data-variant 属性でバリアントを公開する（Button/index.tsx 参照）
    expect(dlButton).toHaveAttribute("data-variant", "primary");
  });

  // E-12: CSS トークン検証
  test("CSS does not use deprecated --color-* tokens", () => {
    const cssPath = resolve(__dirname, "../QrCodePage.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  test("CSS does not use --accent as background directly", () => {
    const cssPath = resolve(__dirname, "../QrCodePage.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/background(-color)?\s*:\s*var\(--accent\)/);
  });

  test("CSS does not use font-weight: 700", () => {
    const cssPath = resolve(__dirname, "../QrCodePage.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight\s*:\s*700/);
  });

  // E-12 拡張: .controlLabel に white-space: nowrap があるか（ラベル折返し防止）
  // ux-gate-findings.md 低指摘: セレクトのラベル折返し（狭幅でラベルが折り返される問題）
  test("CSS .controlLabel has white-space: nowrap to prevent label wrapping", () => {
    const cssPath = resolve(__dirname, "../QrCodePage.module.css");
    const css = readFileSync(cssPath, "utf-8");
    // .controlLabel ブロックに white-space: nowrap が含まれることを確認
    const controlLabelBlock = css.match(/\.controlLabel\s*\{([\s\S]*?)\}/);
    expect(controlLabelBlock).not.toBeNull();
    expect(controlLabelBlock![1]).toMatch(/white-space\s*:\s*nowrap/);
  });

  // E-12 拡張: CSS 内の全 var(--token) が globals.css 定義トークンに解決するか検証
  // reviewer 指摘（cycle-225 T-6）: 未定義トークンのタイポ（--fg-muted 等）は
  // --color-* 旧トークン検査だけでは検出できないため、全トークン存在確認を追加する
  test("all CSS var(--token) references are defined in globals.css", () => {
    const cssPath = resolve(__dirname, "../QrCodePage.module.css");
    const globalsCssPath = resolve(__dirname, "../../../app/globals.css");
    const css = readFileSync(cssPath, "utf-8");
    const globalsCss = readFileSync(globalsCssPath, "utf-8");

    // globals.css に定義されている全トークン名を収集する
    const definedTokens = new Set<string>();
    for (const m of globalsCss.matchAll(/^\s*(--[\w-]+)\s*:/gm)) {
      definedTokens.add(m[1]);
    }

    // CSS ファイル内で参照されている var(--token) を収集する
    const usedTokens: string[] = [];
    for (const m of css.matchAll(/var\((--[\w-]+)[,)]/g)) {
      usedTokens.push(m[1]);
    }

    // 未定義トークン参照がゼロであることを確認する
    const undefinedTokens = usedTokens.filter((t) => !definedTokens.has(t));
    expect(undefinedTokens).toEqual([]);
  });
});

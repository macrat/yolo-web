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

import QrCodeTile from "../QrCodeTile";

describe("QrCodeTile", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  // A-1: ルート要素が Panel（section タグ）になっているか
  test("root element is Panel (renders as section by default)", () => {
    const { container } = render(<QrCodeTile />);
    const root = container.firstChild as HTMLElement;
    expect(root.tagName.toLowerCase()).toBe("section");
  });

  // E-1: 基本レンダリング
  test("renders without crashing", () => {
    render(<QrCodeTile />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  // E-1: テキスト入力欄とセレクトが表示される
  test("renders input textarea and error correction select", () => {
    render(<QrCodeTile />);
    expect(
      screen.getByPlaceholderText(/URLまたはテキストを入力/),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  // E-3: 空入力初期状態ではダウンロードボタンが disabled
  test("download button is disabled on initial empty state", () => {
    render(<QrCodeTile />);
    const dlButton = screen.getByRole("button", { name: /ダウンロード/ });
    expect(dlButton).toBeDisabled();
  });

  // E-3: 空入力ではエラーが表示されない
  test("no error message shown on empty input", async () => {
    render(<QrCodeTile />);
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // E-2: 入力があるとQRコードが生成されダウンロードボタンが有効になる
  test("enables download button after input and QR generation", async () => {
    render(<QrCodeTile />);
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
    render(<QrCodeTile />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello" } });
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    expect(generateQrCode).toHaveBeenCalledWith("hello", "M");
  });

  // E-5: ARIA - ライブリージョンにrole=status aria-live=politeがある
  test("has role=status aria-live=polite for QR generation status", () => {
    render(<QrCodeTile />);
    const statusEl = screen.getByRole("status");
    expect(statusEl).toBeInTheDocument();
    expect(statusEl).toHaveAttribute("aria-live", "polite");
  });

  // C-3: ライブリージョンには実テキストノードのサマリがある（QR生成後）
  test("live region shows actual text summary after QR generation", async () => {
    render(<QrCodeTile />);
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
    render(<QrCodeTile />);
    const dlButton = screen.getByRole("button", { name: /ダウンロード/ });
    expect(dlButton).toBeInTheDocument();
  });

  // エラー処理: エラー発生時にErrorMessageが表示される（A-4日本語化）
  test("shows Japanese error message via ErrorMessage when QR generation fails", async () => {
    render(<QrCodeTile />);
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
    render(<QrCodeTile />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "test" } });
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    // SVGコンテナに role="img" が付与されているか
    const qrImg = screen.getByRole("img");
    expect(qrImg).toBeInTheDocument();
  });

  // debounce: 連続入力でgenerateQrCodeは最後の1回のみ呼ばれる（D-4）
  test("debounces: generateQrCode called only once after rapid input", async () => {
    const { generateQrCode } = await import("../logic");
    vi.clearAllMocks();
    render(<QrCodeTile />);
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
  test("download button uses Button component with variant=primary", () => {
    render(<QrCodeTile />);
    const dlButton = screen.getByRole("button", { name: /ダウンロード/ });
    // 共通 Button は data-variant 属性でバリアントを公開する（Button/index.tsx 参照）
    expect(dlButton).toHaveAttribute("data-variant", "primary");
  });

  // A-6: 複数インスタンスで DOM id が重複しないこと（useId ベース）
  test("multiple instances have no duplicate DOM ids", () => {
    const { container: c1 } = render(<QrCodeTile />);
    const { container: c2 } = render(<QrCodeTile />);
    const allIds = [
      ...Array.from(c1.querySelectorAll("[id]")).map((el) => el.id),
      ...Array.from(c2.querySelectorAll("[id]")).map((el) => el.id),
    ];
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  // E-12: CSS トークン検証
  test("CSS does not use deprecated --color-* tokens", () => {
    const cssPath = resolve(__dirname, "../QrCodeTile.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  test("CSS does not use --accent as background directly", () => {
    const cssPath = resolve(__dirname, "../QrCodeTile.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/background(-color)?\s*:\s*var\(--accent\)/);
  });

  test("CSS does not use font-weight: 700", () => {
    const cssPath = resolve(__dirname, "../QrCodeTile.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight\s*:\s*700/);
  });

  // .controlLabel に white-space: nowrap があるか（ラベル折返し防止）
  test("CSS .controlLabel has white-space: nowrap to prevent label wrapping", () => {
    const cssPath = resolve(__dirname, "../QrCodeTile.module.css");
    const css = readFileSync(cssPath, "utf-8");
    const controlLabelBlock = css.match(/\.controlLabel\s*\{([\s\S]*?)\}/);
    expect(controlLabelBlock).not.toBeNull();
    expect(controlLabelBlock![1]).toMatch(/white-space\s*:\s*nowrap/);
  });

  // 全 CSS var(--token) が globals.css 定義トークンに解決するか
  test("all CSS var(--token) references are defined in globals.css", () => {
    const cssPath = resolve(__dirname, "../QrCodeTile.module.css");
    const globalsCssPath = resolve(__dirname, "../../../app/globals.css");
    const css = readFileSync(cssPath, "utf-8");
    const globalsCss = readFileSync(globalsCssPath, "utf-8");

    const definedTokens = new Set<string>();
    for (const m of globalsCss.matchAll(/^\s*(--[\w-]+)\s*:/gm)) {
      definedTokens.add(m[1]);
    }

    const usedTokens: string[] = [];
    for (const m of css.matchAll(/var\((--[\w-]+)[,)]/g)) {
      usedTokens.push(m[1]);
    }

    const undefinedTokens = usedTokens.filter((t) => !definedTokens.has(t));
    expect(undefinedTokens).toEqual([]);
  });
});

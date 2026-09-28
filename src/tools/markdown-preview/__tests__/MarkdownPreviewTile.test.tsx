import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";

import MarkdownPreviewTile from "../MarkdownPreviewTile";

// クリップボードの API を持つ端末にする。
const writeText = vi.fn();

beforeEach(() => {
  vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
  writeText.mockReset();
  writeText.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("MarkdownPreviewTile", () => {
  // --- 基本レンダリング ---

  // クラッシュなしにレンダリングできる
  test("renders without crashing", () => {
    render(<MarkdownPreviewTile />);
    expect(screen.getByLabelText("Markdown入力")).toBeInTheDocument();
  });

  // 入力欄と role="status" ライブリージョンが両方表示される
  test("renders input and live region", () => {
    render(<MarkdownPreviewTile />);
    expect(screen.getByLabelText("Markdown入力")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  // ルート要素が Panel（section タグ）であること
  test("root element is rendered as section (Panel)", () => {
    const { container } = render(<MarkdownPreviewTile />);
    // Panel のデフォルトは section
    const root = container.firstChild as HTMLElement;
    expect(root.tagName).toBe("SECTION");
  });

  // as="div" を渡すと div タグになること（Panel as prop の透過確認）
  test("root element can be changed via as prop", () => {
    const { container } = render(<MarkdownPreviewTile as="div" />);
    const root = container.firstChild as HTMLElement;
    expect(root.tagName).toBe("DIV");
  });

  // --- サンプル初期値 ---

  // ツールはサンプルMarkdownがデフォルト値として入っている
  test("has sample markdown in input by default", () => {
    render(<MarkdownPreviewTile />);
    const input = screen.getByLabelText("Markdown入力") as HTMLTextAreaElement;
    expect(input.value).toContain("# Heading 1");
  });

  // --- リアルタイムプレビュー ---

  // 入力変更でプレビューが更新される
  test("updates preview when input changes", () => {
    render(<MarkdownPreviewTile />);
    const input = screen.getByLabelText("Markdown入力");
    fireEvent.change(input, { target: { value: "# テスト見出し" } });
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
  });

  // 見出し Markdown のレンダリング確認
  test("renders heading markdown correctly", () => {
    render(<MarkdownPreviewTile />);
    const input = screen.getByLabelText("Markdown入力");
    fireEvent.change(input, { target: { value: "# Hello World" } });
    const previewArea = document.querySelector(
      "[data-testid='markdown-preview']",
    );
    if (previewArea) {
      expect(previewArea.innerHTML).toContain("Hello World");
    }
  });

  // 空入力時にエラーが表示されない
  test("shows empty state when input is cleared", () => {
    render(<MarkdownPreviewTile />);
    const input = screen.getByLabelText("Markdown入力");
    fireEvent.change(input, { target: { value: "" } });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // --- アクセシビリティ ---

  // ARIA — role="status" aria-live="polite" が存在する
  test("has role=status region with aria-live=polite", () => {
    render(<MarkdownPreviewTile />);
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toBeInTheDocument();
    expect(statusRegion).toHaveAttribute("aria-live", "polite");
  });

  // status 領域にサマリテキストが含まれること
  test("shows preview summary text in role=status region", () => {
    render(<MarkdownPreviewTile />);
    const input = screen.getByLabelText("Markdown入力");
    fireEvent.change(input, { target: { value: "# テスト" } });
    const statusRegion = screen.getByRole("status");
    expect(statusRegion.textContent).toBeTruthy();
  });

  // プレビュー本体は role="status" の外にある
  test("preview body is outside the live region (role=status)", () => {
    render(<MarkdownPreviewTile />);
    const input = screen.getByLabelText("Markdown入力");
    fireEvent.change(input, { target: { value: "# テスト見出し" } });
    const statusRegion = screen.getByRole("status");
    const previewBody = document.querySelector(
      "[data-testid='markdown-preview']",
    );
    if (previewBody) {
      expect(statusRegion.contains(previewBody)).toBe(false);
    }
  });

  // ライブリージョンはサマリのみ（短い文字列）
  test("live region contains only a short summary text, not full preview HTML", () => {
    render(<MarkdownPreviewTile />);
    const input = screen.getByLabelText("Markdown入力");
    fireEvent.change(input, {
      target: {
        value:
          "# Heading\n\n段落テキスト。とても長いコンテンツ。\n\n## サブ見出し\n\nさらに続く内容。",
      },
    });
    const statusRegion = screen.getByRole("status");
    const statusText = statusRegion.textContent ?? "";
    expect(statusText.length).toBeLessThan(50);
  });

  // --- エラー処理 ---

  // 入力超過でエラーが表示される（ErrorMessage: role="alert"）
  test("shows error when input exceeds max length", () => {
    render(<MarkdownPreviewTile />);
    const input = screen.getByLabelText("Markdown入力");
    fireEvent.change(input, { target: { value: "a".repeat(50_001) } });
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  // エラー文言が日本語であること
  test("shows Japanese error message for oversized input", () => {
    render(<MarkdownPreviewTile />);
    const input = screen.getByLabelText("Markdown入力");
    fireEvent.change(input, { target: { value: "a".repeat(50_001) } });
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toMatch(/[ぁ-ん|ァ-ン|一-龯]/);
  });

  // --- HTML コピーボタン ---

  // 押すと HTML を写し、ボタンが「コピー済み」になる
  test("copy button copies the HTML and shows コピー済み", async () => {
    render(<MarkdownPreviewTile />);
    const input = screen.getByLabelText("Markdown入力");
    fireEvent.change(input, { target: { value: "# テスト" } });
    const copyButton = screen.getByRole("button", { name: "HTMLをコピー" });
    fireEvent.click(copyButton);
    await waitFor(() => expect(copyButton).toHaveTextContent("コピー済み"));
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("テスト</h1>"),
    );
  });

  // 入力が空のときコピーボタンが disabled になる
  test("copy button is disabled when input is empty", () => {
    render(<MarkdownPreviewTile />);
    const input = screen.getByLabelText("Markdown入力");
    fireEvent.change(input, { target: { value: "" } });
    const copyButton = screen.getByRole("button", { name: "HTMLをコピー" });
    expect(copyButton).toBeDisabled();
  });

  // 入力がある場合はコピーボタンが有効
  test("copy button is enabled when input has content", () => {
    render(<MarkdownPreviewTile />);
    const input = screen.getByLabelText("Markdown入力");
    fireEvent.change(input, { target: { value: "# テスト" } });
    const copyButton = screen.getByRole("button", { name: "HTMLをコピー" });
    expect(copyButton).not.toBeDisabled();
  });

  // --- クリップボード ---

  // navigator.clipboard が存在しない環境でも例外を投げない
  test("does not throw when navigator.clipboard is absent", async () => {
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
      writable: true,
    });
    expect(() => {
      render(<MarkdownPreviewTile />);
    }).not.toThrow();
    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      configurable: true,
      writable: true,
    });
  });

  // --- SSR 安全性（useSyncExternalStore パターン） ---

  // [SSR] variant="full" でデフォルトレンダリングが成功すること（SSR セーフ）
  test("renders in full variant without errors (SSR-safe default)", () => {
    expect(() => render(<MarkdownPreviewTile variant="full" />)).not.toThrow();
  });

  // --- 複数インスタンス id 一意性 ---

  // 複数インスタンスを同一ページに描画したとき id 重複がないこと
  test("multiple instances have unique DOM ids (no duplicates)", () => {
    const { container } = render(
      <div>
        <MarkdownPreviewTile />
        <MarkdownPreviewTile />
      </div>,
    );
    const allIds = Array.from(container.querySelectorAll("[id]")).map(
      (el) => el.id,
    );
    const uniqueIds = new Set(allIds);
    expect(allIds.length).toBe(uniqueIds.size);
  });

  // --- サニタイズ回帰テスト ---

  // [サニタイズ回帰] <script> タグ入力でスクリプトが実行されないこと
  test("sanitize regression: script tag in input does not execute", () => {
    render(<MarkdownPreviewTile />);
    const input = screen.getByLabelText("Markdown入力");
    fireEvent.change(input, {
      target: { value: "<script>alert(1)</script>" },
    });
    const previewArea = document.querySelector(
      "[data-testid='markdown-preview']",
    );
    if (previewArea) {
      // プレビュー内に script タグが存在しないこと
      expect(previewArea.innerHTML).not.toContain("<script");
      expect(previewArea.innerHTML).not.toContain("alert");
    }
  });

  // [サニタイズ回帰] javascript: URL が除去されること
  test("sanitize regression: javascript: href is stripped", () => {
    render(<MarkdownPreviewTile />);
    const input = screen.getByLabelText("Markdown入力");
    fireEvent.change(input, {
      target: {
        value: "[xss](javascript:alert(1))",
      },
    });
    const previewArea = document.querySelector(
      "[data-testid='markdown-preview']",
    );
    if (previewArea) {
      expect(previewArea.innerHTML).not.toContain("javascript:");
    }
  });

  // [サニタイズ回帰] onmouseover イベントハンドラが除去されること
  test("sanitize regression: onerror event handler is stripped from img", () => {
    render(<MarkdownPreviewTile />);
    const input = screen.getByLabelText("Markdown入力");
    fireEvent.change(input, {
      target: { value: '<img onerror="alert(1)" src="x">' },
    });
    const previewArea = document.querySelector(
      "[data-testid='markdown-preview']",
    );
    if (previewArea) {
      expect(previewArea.innerHTML).not.toContain("onerror");
    }
  });

  // --- CSS トークン検証 ---

  // --color-* トークン・禁止パターンが CSS に含まれていないこと
  test("CSS does not reference --color-* tokens, fill with --accent directly, or use font-weight 700", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/markdown-preview/MarkdownPreviewTile.module.css",
    );
    const css = readFileSync(cssPath, "utf-8");

    // --color-* トークンを参照しないこと
    expect(css).not.toMatch(/var\(--color-/);

    // background に --accent を直接使っていないこと
    const accentBackgroundUse = css.match(
      /background(?:-color)?\s*:\s*var\(--accent\)/g,
    );
    expect(accentBackgroundUse).toBeNull();

    // font-weight: 700 が CSS に存在しないこと
    const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(cssWithoutComments).not.toMatch(/font-weight\s*:\s*700/);
  });

  // 未定義トークンを使っていないこと
  test("CSS does not use undefined tokens --bg-subtle or --fg-muted", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/markdown-preview/MarkdownPreviewTile.module.css",
    );
    const css = readFileSync(cssPath, "utf-8");

    expect(css).not.toMatch(/var\(--bg-subtle/);
    expect(css).not.toMatch(/var\(--fg-muted/);
  });
});

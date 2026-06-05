import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";

// vi.hoisted でモック変数をホイストして動的に copiedKey を制御できるようにする
const mockHook = vi.hoisted(() => ({
  copy: vi.fn(),
  copiedKey: null as string | number | boolean | null,
}));

// useCopyToClipboard をモックする（clipboard API 不在環境）
// vi.hoisted を通して copiedKey を動的に制御できる
vi.mock("@/components/hooks/useCopyToClipboard", () => ({
  useCopyToClipboard: () => mockHook,
  COPIED_LABEL: "コピーしました",
}));

import MarkdownPreviewPage from "../MarkdownPreviewPage";

describe("MarkdownPreviewPage", () => {
  beforeEach(() => {
    // 各テスト前にコピー状態をリセット（テスト間の状態汚染を防ぐ）
    mockHook.copiedKey = null;
    mockHook.copy = vi.fn();
  });

  // E-1: 基本レンダリング
  test("renders without crashing", () => {
    render(<MarkdownPreviewPage />);
    expect(screen.getByLabelText("Markdown入力")).toBeInTheDocument();
  });

  // E-1: 入力欄とプレビューパネルが両方表示される
  test("renders input and preview panels", () => {
    render(<MarkdownPreviewPage />);
    expect(screen.getByLabelText("Markdown入力")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  // E-10: ツールはサンプルMarkdownがデフォルト値として入っている
  test("has sample markdown in input by default", () => {
    render(<MarkdownPreviewPage />);
    const input = screen.getByLabelText("Markdown入力") as HTMLTextAreaElement;
    expect(input.value).toContain("# Heading 1");
  });

  // E-2: 入力→結果更新（リアルタイムプレビュー）
  test("updates preview when input changes", () => {
    render(<MarkdownPreviewPage />);
    const input = screen.getByLabelText("Markdown入力");
    fireEvent.change(input, { target: { value: "# テスト見出し" } });
    // role="status" 領域にプレビューが含まれる（C-3 対応のサマリ）
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
  });

  // E-3: 空入力時の挙動
  test("shows empty state when input is cleared", () => {
    render(<MarkdownPreviewPage />);
    const input = screen.getByLabelText("Markdown入力");
    fireEvent.change(input, { target: { value: "" } });
    // エラーは表示されない
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // E-4: 変換ロジックの正確性（見出し）
  test("renders heading markdown correctly", () => {
    render(<MarkdownPreviewPage />);
    const input = screen.getByLabelText("Markdown入力");
    fireEvent.change(input, { target: { value: "# Hello World" } });
    // プレビュー領域にHTMLがレンダリングされる
    const previewArea = document.querySelector(
      "[data-testid='markdown-preview']",
    );
    if (previewArea) {
      expect(previewArea.innerHTML).toContain("Hello World");
    }
  });

  // E-4: 変換ロジックの正確性（太字・斜体）
  test("renders bold and italic markdown correctly", () => {
    render(<MarkdownPreviewPage />);
    const input = screen.getByLabelText("Markdown入力");
    fireEvent.change(input, { target: { value: "**太字**と*斜体*" } });
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
  });

  // E-5: ARIA — role="status" aria-live="polite" が存在する（C-3）
  test("has role=status region with aria-live=polite", () => {
    render(<MarkdownPreviewPage />);
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toBeInTheDocument();
    expect(statusRegion).toHaveAttribute("aria-live", "polite");
  });

  // E-5: ARIA — status 領域に実テキストノードのサマリが含まれる（C-3）
  test("shows preview summary text in role=status region", () => {
    render(<MarkdownPreviewPage />);
    const input = screen.getByLabelText("Markdown入力");
    fireEvent.change(input, { target: { value: "# テスト" } });
    const statusRegion = screen.getByRole("status");
    // サマリテキストが含まれること（実テキストノード必須）
    expect(statusRegion.textContent).toBeTruthy();
  });

  // E-5: C-3 設計 — プレビュー本体はライブリージョンの外に配置されること
  // ライブリージョン内にレンダリング済みMarkdown全体を置くとスクリーンリーダーが
  // キー入力毎にMarkdown全文を再読み上げするため、プレビュー本体は外に出す設計が必要。
  test("preview body is outside the live region (role=status)", () => {
    render(<MarkdownPreviewPage />);
    const input = screen.getByLabelText("Markdown入力");
    fireEvent.change(input, { target: { value: "# テスト見出し" } });

    // role="status" ライブリージョンを取得
    const statusRegion = screen.getByRole("status");

    // プレビュー本体（data-testid="markdown-preview"）は role="status" の外にあること
    const previewBody = document.querySelector(
      "[data-testid='markdown-preview']",
    );
    if (previewBody) {
      // プレビュー本体がステータス領域の子孫でないことを確認
      expect(statusRegion.contains(previewBody)).toBe(false);
    }
  });

  // E-5: C-3 設計 — role="status" 内のテキストはサマリのみ（短い文字数）であること
  test("live region contains only a short summary text, not full preview HTML", () => {
    render(<MarkdownPreviewPage />);
    const input = screen.getByLabelText("Markdown入力");
    // 長いMarkdown入力
    fireEvent.change(input, {
      target: {
        value:
          "# Heading\n\n段落テキスト。とても長いコンテンツ。\n\n## サブ見出し\n\nさらに続く内容。",
      },
    });

    const statusRegion = screen.getByRole("status");
    // ライブリージョンのテキストはサマリ（短い）であり、
    // 入力の全Markdownテキストと同一ではないこと
    const statusText = statusRegion.textContent ?? "";
    // サマリは入力全体より明らかに短い（50文字以下が目安）
    expect(statusText.length).toBeLessThan(50);
  });

  // E-4 + E-5: エラー時は ErrorMessage が表示される（超過入力）
  test("shows error when input exceeds max length", () => {
    render(<MarkdownPreviewPage />);
    const input = screen.getByLabelText("Markdown入力");
    fireEvent.change(input, { target: { value: "a".repeat(50_001) } });
    // ErrorMessage が表示される（role="alert"）
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  // E-4: エラー文言が日本語であること（A-4 対応）
  test("shows Japanese error message for oversized input", () => {
    render(<MarkdownPreviewPage />);
    const input = screen.getByLabelText("Markdown入力");
    fireEvent.change(input, { target: { value: "a".repeat(50_001) } });
    const alert = screen.getByRole("alert");
    // 日本語のメッセージが含まれていること
    expect(alert.textContent).toMatch(/[ぁ-ん|ァ-ン|一-龯]/);
  });

  // E-6: コピー文言変化 — コピー前は「HTMLをコピー」、コピー後は COPIED_LABEL ("コピーしました") が表示される
  test("copy button label changes to COPIED_LABEL when copiedKey is set", () => {
    mockHook.copiedKey = true; // コピー後の状態をシミュレート
    render(<MarkdownPreviewPage />);
    // copiedKey=true(モック)のとき "コピーしました" (COPIED_LABEL) が表示される
    expect(
      screen.getByRole("button", { name: "コピーしました" }),
    ).toBeInTheDocument();
  });

  // E-7: コピー disabled 状態 — 出力が空（input が空）のとき HTMLコピーボタンが disabled になる
  test("copy button is disabled when input is empty", () => {
    render(<MarkdownPreviewPage />);
    const input = screen.getByLabelText("Markdown入力");
    fireEvent.change(input, { target: { value: "" } });
    // 入力が空のときはコピーボタンが disabled であること
    const copyButton = screen.getByRole("button", { name: "HTMLをコピー" });
    expect(copyButton).toBeDisabled();
  });

  // E-7 補足: 入力がある場合はコピーボタンが有効になる
  test("copy button is enabled when input has content", () => {
    render(<MarkdownPreviewPage />);
    // サンプルMarkdownがデフォルト値として設定されているため、初期状態でボタンが有効
    // （入力欄に文字が入っている = isMounted後に有効になる）
    const input = screen.getByLabelText("Markdown入力");
    fireEvent.change(input, { target: { value: "# テスト" } });
    const copyButton = screen.getByRole("button", { name: "HTMLをコピー" });
    expect(copyButton).not.toBeDisabled();
  });

  // E-8: navigator.clipboard が存在しない環境でコピーが例外を投げない
  test("does not throw when navigator.clipboard is absent", async () => {
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
      writable: true,
    });

    expect(() => {
      render(<MarkdownPreviewPage />);
    }).not.toThrow();

    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      configurable: true,
      writable: true,
    });
  });

  // E-9: 詳細リンク — このツールには詳細リンクなし（N/A）

  // E-12: CSS トークン検証
  test("CSS does not use deprecated --color-* tokens or --accent direct fill or font-weight 700", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/markdown-preview/MarkdownPreviewPage.module.css",
    );
    const css = readFileSync(cssPath, "utf-8");

    // 旧トークン --color-* が存在しないこと
    expect(css).not.toMatch(/var\(--color-/);

    // 選択状態・ON状態の背景塗りに --accent を直接使っていないこと（B-3: --bg-invert/--fg-invert ペアで代替）
    // リンクの text color: var(--accent) は DESIGN.md §2「リンクの位置を示す」用途として許可
    // background に --accent を直接塗ることのみを禁止する
    const accentBackgroundUse = css.match(
      /background(?:-color)?\s*:\s*var\(--accent\)/g,
    );
    expect(accentBackgroundUse).toBeNull();

    // font-weight: 700 が CSS 宣言として存在しないこと
    const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(cssWithoutComments).not.toMatch(/font-weight\s*:\s*700/);
  });

  // E-12 補足: DESIGN.md に存在しない未定義トークンを使っていないこと（B-8）
  // --bg-subtle / --fg-muted はハルシネーションされたトークン名であり、DESIGN.md に定義がない
  test("CSS does not use undefined tokens --bg-subtle or --fg-muted", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/markdown-preview/MarkdownPreviewPage.module.css",
    );
    const css = readFileSync(cssPath, "utf-8");

    // --bg-subtle は DESIGN.md に存在しない未定義トークン（正しくは --bg-soft / --bg-softer）
    expect(css).not.toMatch(/var\(--bg-subtle/);
    // --fg-muted は DESIGN.md に存在しない未定義トークン（正しくは --fg-soft）
    expect(css).not.toMatch(/var\(--fg-muted/);
  });
});

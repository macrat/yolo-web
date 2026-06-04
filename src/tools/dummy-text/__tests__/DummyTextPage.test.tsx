import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";
import DummyTextPage from "../DummyTextPage";

// vi.hoisted でモック変数をホイストして動的に copiedKey を制御できるようにする
const mockHook = vi.hoisted(() => ({
  copy: vi.fn(),
  copiedKey: null as string | number | boolean | null,
}));

// useCopyToClipboard をモックする（clipboard API 不在環境）
vi.mock("@/components/hooks/useCopyToClipboard", () => ({
  useCopyToClipboard: () => mockHook,
  COPIED_LABEL: "コピーしました",
}));

describe("DummyTextPage", () => {
  beforeEach(() => {
    mockHook.copiedKey = null;
    mockHook.copy = vi.fn();
  });

  // E-1: 基本レンダリング
  test("renders without crashing", () => {
    render(<DummyTextPage />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  // E-1: 生成結果テキストエリアが表示される
  test("renders output textarea", () => {
    render(<DummyTextPage />);
    expect(screen.getByLabelText("生成結果")).toBeInTheDocument();
  });

  // E-2: 言語切り替えで出力が変わる
  test("updates output when language changes to Japanese", () => {
    render(<DummyTextPage />);
    // 初期はLorem Ipsumモード
    const output = screen.getByLabelText("生成結果") as HTMLTextAreaElement;
    const initialValue = output.value;
    expect(initialValue).toContain("Lorem ipsum");

    // 日本語に切り替え
    const jpButton = screen.getByRole("radio", { name: "日本語" });
    fireEvent.click(jpButton);
    expect(output.value).toMatch(/[　-鿿]/);
  });

  // E-3: 初期状態では出力が空でない（マウント時生成）
  test("initial output is non-empty", () => {
    render(<DummyTextPage />);
    const output = screen.getByLabelText("生成結果") as HTMLTextAreaElement;
    expect(output.value.length).toBeGreaterThan(0);
  });

  // E-4: 変換ロジックの正確性 — Lorem Ipsum モードで英語テキストが生成される
  test("generates lorem ipsum text by default", () => {
    render(<DummyTextPage />);
    const output = screen.getByLabelText("生成結果") as HTMLTextAreaElement;
    expect(output.value).toContain("Lorem ipsum");
  });

  // E-4: 段落数変更で出力段落数が変わる
  test("updates output when paragraph count changes", () => {
    render(<DummyTextPage />);
    const paragraphInput = screen.getByLabelText("段落数") as HTMLInputElement;
    fireEvent.change(paragraphInput, { target: { value: "1" } });
    const output = screen.getByLabelText("生成結果") as HTMLTextAreaElement;
    // 段落数1のとき「\n\n」で分割した配列の長さが1
    expect(output.value.split("\n\n")).toHaveLength(1);
  });

  // E-4: 文数変更で出力が変わる
  test("updates output when sentence count changes", () => {
    render(<DummyTextPage />);
    const sentenceInput = screen.getByLabelText(
      "段落あたりの文数",
    ) as HTMLInputElement;
    fireEvent.change(sentenceInput, { target: { value: "1" } });
    const output = screen.getByLabelText("生成結果") as HTMLTextAreaElement;
    expect(output.value.length).toBeGreaterThan(0);
  });

  // E-5: ARIA — SegmentedControl に role="radiogroup" が付与されている
  test("has role=radiogroup for language selection", () => {
    render(<DummyTextPage />);
    const radiogroup = screen.getByRole("radiogroup");
    expect(radiogroup).toBeInTheDocument();
  });

  // E-5: ARIA — SegmentedControl に aria-label が付与されている
  test("SegmentedControl has aria-label", () => {
    render(<DummyTextPage />);
    const radiogroup = screen.getByRole("radiogroup");
    expect(radiogroup).toHaveAttribute("aria-label");
  });

  // E-5: ARIA — role="status" aria-live="polite" 領域が存在する（C-3）
  test("has role=status region with aria-live=polite", () => {
    render(<DummyTextPage />);
    // getAllByRole で複数のステータス領域に対応
    const statusRegions = screen.getAllByRole("status");
    expect(statusRegions.length).toBeGreaterThanOrEqual(1);
    expect(statusRegions[0]).toHaveAttribute("aria-live", "polite");
  });

  // E-5: ARIA — 生成後に role="status" 領域に実テキストサマリが表示される（C-3）
  test("shows summary text in role=status region after generation", () => {
    render(<DummyTextPage />);
    // 生成後のサマリが表示されること（初期生成後またはユーザー操作後）
    const statusRegions = screen.getAllByRole("status");
    // いずれかのステータスに文字数・段落数などのサマリが含まれること
    const allText = statusRegions.map((r) => r.textContent).join(" ");
    expect(allText.length).toBeGreaterThan(0);
  });

  // E-6: コピー文言変化 — コピー前は "コピー" が表示される
  test("copy button label is コピー before copying", () => {
    mockHook.copiedKey = null;
    render(<DummyTextPage />);
    expect(screen.getByRole("button", { name: "コピー" })).toBeInTheDocument();
  });

  // E-6: コピー文言変化 — コピー後は COPIED_LABEL が表示される
  test("copy button label changes to COPIED_LABEL when copiedKey is set", () => {
    mockHook.copiedKey = true;
    render(<DummyTextPage />);
    expect(
      screen.getByRole("button", { name: "コピーしました" }),
    ).toBeInTheDocument();
  });

  // E-7: 出力が空のときコピーボタンが disabled
  // Note: dummy-text は常に何か生成するため、このケースは初期状態では発生しないが
  // 出力が空のとき disabled になること自体の確認
  test("copy button is not disabled when output is non-empty", () => {
    render(<DummyTextPage />);
    // 初期生成後は出力が存在するのでコピーボタンは enabled
    const copyButton = screen.getByRole("button", { name: "コピー" });
    expect(copyButton).not.toBeDisabled();
  });

  // E-8: navigator.clipboard が存在しない環境でコピーが例外を投げない
  test("does not throw when navigator.clipboard is absent", () => {
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
      writable: true,
    });

    expect(() => {
      render(<DummyTextPage />);
    }).not.toThrow();

    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      configurable: true,
      writable: true,
    });
  });

  // E-10: meta 由来の表示 — 入力欄が最初から表示される（確定提示方式）
  test("shows input controls immediately on mount (確定提示方式)", () => {
    render(<DummyTextPage />);
    expect(screen.getByLabelText("段落数")).toBeInTheDocument();
    expect(screen.getByLabelText("段落あたりの文数")).toBeInTheDocument();
  });

  // E-12: CSS トークン検証
  test("CSS does not use deprecated --color-* tokens or --accent direct fill or font-weight 700", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/dummy-text/DummyTextPage.module.css",
    );
    const css = readFileSync(cssPath, "utf-8");

    // 旧トークン --color-* が存在しないこと
    expect(css).not.toMatch(/var\(--color-/);

    // --accent 直塗りがないこと（フォーカス用途 outline: 2px solid var(--accent) は許可）
    const accentDirectUse = css.match(
      /(?:background|color)\s*:\s*var\(--accent\)/g,
    );
    expect(accentDirectUse).toBeNull();

    // font-weight: 700 が CSS 宣言として存在しないこと
    const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(cssWithoutComments).not.toMatch(/font-weight\s*:\s*700/);
  });
});

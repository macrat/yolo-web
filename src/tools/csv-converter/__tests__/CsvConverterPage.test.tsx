import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";
import CsvConverterPage from "../CsvConverterPage";

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

describe("CsvConverterPage", () => {
  beforeEach(() => {
    mockHook.copiedKey = null;
    mockHook.copy = vi.fn();
  });

  // E-1: 基本レンダリング
  test("renders without crashing", () => {
    render(<CsvConverterPage />);
    expect(screen.getByLabelText("入力データ")).toBeInTheDocument();
  });

  // E-10: 確定提示方式 — 入力欄と出力欄が初期状態から見える
  test("shows input and output areas on load", () => {
    render(<CsvConverterPage />);
    expect(screen.getByLabelText("入力データ")).toBeInTheDocument();
    expect(screen.getByLabelText("変換結果")).toBeInTheDocument();
  });

  // E-3: 空入力時の挙動 — エラー非表示
  test("shows no error on empty input before conversion", () => {
    render(<CsvConverterPage />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // E-2: 変換ボタンで出力が更新される
  test("converts CSV to JSON when 変換 button is clicked", () => {
    render(<CsvConverterPage />);
    const input = screen.getByLabelText("入力データ");
    fireEvent.change(input, { target: { value: "name,age\nAlice,30" } });

    // 入力形式を CSV に、出力形式を JSON に設定
    const fromSelect = screen.getByLabelText("入力形式");
    const toSelect = screen.getByLabelText("出力形式");
    fireEvent.change(fromSelect, { target: { value: "csv" } });
    fireEvent.change(toSelect, { target: { value: "json" } });

    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;
    expect(output.value).toContain('"name": "Alice"');
  });

  // E-4: 変換ロジックの正確性 — CSV to TSV
  test("converts CSV to TSV correctly", () => {
    render(<CsvConverterPage />);
    const input = screen.getByLabelText("入力データ");
    fireEvent.change(input, { target: { value: "a,b\n1,2" } });

    const fromSelect = screen.getByLabelText("入力形式");
    const toSelect = screen.getByLabelText("出力形式");
    fireEvent.change(fromSelect, { target: { value: "csv" } });
    fireEvent.change(toSelect, { target: { value: "tsv" } });

    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;
    expect(output.value).toBe("a\tb\n1\t2");
  });

  // E-4: 変換ロジックの正確性 — CSV to Markdown
  test("converts CSV to Markdown table correctly", () => {
    render(<CsvConverterPage />);
    const input = screen.getByLabelText("入力データ");
    fireEvent.change(input, { target: { value: "Name,Age\nAlice,30" } });

    const fromSelect = screen.getByLabelText("入力形式");
    const toSelect = screen.getByLabelText("出力形式");
    fireEvent.change(fromSelect, { target: { value: "csv" } });
    fireEvent.change(toSelect, { target: { value: "markdown" } });

    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;
    expect(output.value).toContain("| Name | Age |");
    expect(output.value).toContain("| --- | --- |");
  });

  // E-4: 無効なJSONでエラー表示 — エラー文言は日本語
  test("shows Japanese error message for invalid JSON input", () => {
    render(<CsvConverterPage />);
    const input = screen.getByLabelText("入力データ");
    fireEvent.change(input, { target: { value: "{not valid json}" } });

    const fromSelect = screen.getByLabelText("入力形式");
    const toSelect = screen.getByLabelText("出力形式");
    fireEvent.change(fromSelect, { target: { value: "json" } });
    fireEvent.change(toSelect, { target: { value: "csv" } });

    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    // 英語の生パーサーエラーが露出していないこと
    expect(alert.textContent).not.toMatch(
      /Expected|Unexpected|position|at line|column/i,
    );
  });

  // E-5: ARIA — role="status" aria-live="polite" 領域が存在する
  test("has role=status region with aria-live=polite", () => {
    render(<CsvConverterPage />);
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toBeInTheDocument();
    expect(statusRegion).toHaveAttribute("aria-live", "polite");
  });

  // E-5a: ARIA — 変換後に role="status" 領域に実テキストサマリが表示される（C-3）
  test("shows summary text in role=status region after conversion", () => {
    render(<CsvConverterPage />);
    const input = screen.getByLabelText("入力データ");
    fireEvent.change(input, { target: { value: "a,b\n1,2" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    const statusRegion = screen.getByRole("status");
    expect(statusRegion.textContent).not.toBe("");
  });

  // E-7: 出力が空のときコピーボタンが disabled
  test("copy button is disabled when output is empty", () => {
    render(<CsvConverterPage />);
    const copyButton = screen.getByRole("button", { name: "コピー" });
    expect(copyButton).toBeDisabled();
  });

  // E-7: 出力があるときコピーボタンが enabled
  test("copy button is enabled when output has content", () => {
    render(<CsvConverterPage />);
    const input = screen.getByLabelText("入力データ");
    fireEvent.change(input, { target: { value: "a,b\n1,2" } });

    const fromSelect = screen.getByLabelText("入力形式");
    const toSelect = screen.getByLabelText("出力形式");
    fireEvent.change(fromSelect, { target: { value: "csv" } });
    fireEvent.change(toSelect, { target: { value: "json" } });

    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    const copyButton = screen.getByRole("button", { name: "コピー" });
    expect(copyButton).not.toBeDisabled();
  });

  // E-6: コピー文言変化 — コピー前は "コピー" が表示される
  test("copy button label is コピー when not copied (copiedKey=null)", () => {
    mockHook.copiedKey = null;
    render(<CsvConverterPage />);
    const input = screen.getByLabelText("入力データ");
    fireEvent.change(input, { target: { value: "a,b\n1,2" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    expect(screen.getByRole("button", { name: "コピー" })).toBeInTheDocument();
  });

  // E-6: コピー文言変化 — コピー後は COPIED_LABEL が表示される
  test("copy button label changes to COPIED_LABEL when copiedKey is set", () => {
    mockHook.copiedKey = true;
    render(<CsvConverterPage />);
    const input = screen.getByLabelText("入力データ");
    fireEvent.change(input, { target: { value: "a,b\n1,2" } });
    fireEvent.click(screen.getByRole("button", { name: "変換" }));
    expect(
      screen.getByRole("button", { name: "コピーしました" }),
    ).toBeInTheDocument();
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
      render(<CsvConverterPage />);
    }).not.toThrow();

    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      configurable: true,
      writable: true,
    });
  });

  // E-12: CSS トークン検証
  test("CSS does not use deprecated --color-* tokens or --accent direct fill or font-weight 700", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/csv-converter/CsvConverterPage.module.css",
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

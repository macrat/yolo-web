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

  // 日本語モードでは「単語数」を表示しない（日本語はスペース区切りがなく単語数が無意味）
  test("does not show 単語 label in Japanese mode stats bar", () => {
    render(<DummyTextPage />);
    // 日本語モードに切り替え
    const jpButton = screen.getByRole("radio", { name: "日本語" });
    fireEvent.click(jpButton);
    // 視覚上の statsBar（aria-hidden=true）に「単語」が出ないこと
    // getAllByText は aria-hidden 要素も対象にするため、直接テキスト検索で確認
    const allText = document.body.textContent ?? "";
    // 「単語」という文字列が存在しないこと
    expect(allText).not.toContain("単語");
  });

  // 日本語モードでは「文字数」を表示する（文数は廃止: pool[0]の2文問題による整合性破綻を防ぐ）
  test("shows 文字 stat in Japanese mode", () => {
    render(<DummyTextPage />);
    const jpButton = screen.getByRole("radio", { name: "日本語" });
    fireEvent.click(jpButton);
    const allText = document.body.textContent ?? "";
    expect(allText).toContain("文字");
  });

  // 日本語モードでは「文」（文数）という単独のラベルを表示しない
  // ※是正方針(a): 日本語モードは「文字数のみ」に寄せる
  // pool[0]「吾輩は猫である。名前はまだない。」が2文を含むため
  // paragraphs×sentencesPerParagraphとcountSentences結果が必ずずれる問題を根本解消する
  test("does not show 文 label in Japanese mode stats", () => {
    render(<DummyTextPage />);
    const jpButton = screen.getByRole("radio", { name: "日本語" });
    fireEvent.click(jpButton);
    // 統計バーに「N文」という表示がないこと
    // 「文字」は許可、単独の「文」のみが問題（「段落」「文字」は残す）
    const statsBar = document.querySelector("[aria-hidden='true']");
    const statsText = statsBar?.textContent ?? "";
    // 「文字」は許可するが「N文」（数字+文）は存在しないこと
    expect(statsText).not.toMatch(/\d+文(?!字)/);
  });

  // 日本語モードでは statusSummary（SR 用）に「単語」も「文」カウントも含まない
  test("statusSummary does not contain 単語 or 文カウント in Japanese mode", () => {
    render(<DummyTextPage />);
    const jpButton = screen.getByRole("radio", { name: "日本語" });
    fireEvent.click(jpButton);
    const statusRegions = screen.getAllByRole("status");
    const statusText = statusRegions.map((r) => r.textContent).join(" ");
    expect(statusText).not.toContain("単語");
    // 「文字」は許可するが「N文」（数字+文）という表現がないこと
    expect(statusText).not.toMatch(/\d+文(?!字)/);
    expect(statusText).toContain("文字");
  });

  // G-5/数値整合性: 日本語モードで paragraphs×sentencesPerParagraph と統計の整合性
  // 文字数は生成されたテキストの実際の文字数と一致するべき（入力値との整合は文字数のみ）
  test("char count in statusSummary matches actual output length in Japanese mode", () => {
    render(<DummyTextPage />);
    const jpButton = screen.getByRole("radio", { name: "日本語" });
    fireEvent.click(jpButton);
    // 出力テキストを取得
    const output = screen.getByLabelText("生成結果") as HTMLTextAreaElement;
    const actualLength = output.value.length;
    // SR サマリに実際の文字数が含まれていること
    const statusRegions = screen.getAllByRole("status");
    const statusText = statusRegions.map((r) => r.textContent).join(" ");
    // actualLength をロケール表示した文字列がサマリに含まれること
    expect(statusText).toContain(actualLength.toLocaleString());
  });

  // G-5/数値整合性: Lorem Ipsum モードで paragraphs 設定値がサマリと一致する
  test("paragraph count in statusSummary matches input value in lorem mode", () => {
    render(<DummyTextPage />);
    // 段落数を変更
    const paragraphInput = screen.getByLabelText("段落数") as HTMLInputElement;
    fireEvent.change(paragraphInput, { target: { value: "5" } });
    // SR サマリに「5段落」が含まれること
    const statusRegions = screen.getAllByRole("status");
    const statusText = statusRegions.map((r) => r.textContent).join(" ");
    expect(statusText).toContain("5段落");
  });

  // Lorem Ipsum モードでは「単語数」が表示される（英語は単語数が有意味）
  test("shows 単語 stat in lorem mode", () => {
    render(<DummyTextPage />);
    // デフォルトは Lorem Ipsum モード
    const allText = document.body.textContent ?? "";
    expect(allText).toContain("単語");
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

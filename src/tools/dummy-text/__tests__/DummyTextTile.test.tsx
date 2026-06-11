import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";
import DummyTextTile from "../DummyTextTile";

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

describe("DummyTextTile — variant='full'", () => {
  beforeEach(() => {
    mockHook.copiedKey = null;
    mockHook.copy = vi.fn();
  });

  // E-1: 基本レンダリング
  test("renders without crashing", () => {
    render(<DummyTextTile variant="full" />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  // E-1: 生成結果テキストエリアが表示される
  test("renders output textarea", () => {
    render(<DummyTextTile variant="full" />);
    expect(screen.getByLabelText("生成結果")).toBeInTheDocument();
  });

  // E-2: 言語切り替えで出力が変わる
  test("updates output when language changes to Japanese", () => {
    render(<DummyTextTile variant="full" />);
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
    render(<DummyTextTile variant="full" />);
    const output = screen.getByLabelText("生成結果") as HTMLTextAreaElement;
    expect(output.value.length).toBeGreaterThan(0);
  });

  // E-4: 変換ロジックの正確性 — Lorem Ipsum モードで英語テキストが生成される
  test("generates lorem ipsum text by default", () => {
    render(<DummyTextTile variant="full" />);
    const output = screen.getByLabelText("生成結果") as HTMLTextAreaElement;
    expect(output.value).toContain("Lorem ipsum");
  });

  // E-4: 段落数変更で出力段落数が変わる
  test("updates output when paragraph count changes", () => {
    render(<DummyTextTile variant="full" />);
    const paragraphInput = screen.getByLabelText("段落数") as HTMLInputElement;
    fireEvent.change(paragraphInput, { target: { value: "1" } });
    const output = screen.getByLabelText("生成結果") as HTMLTextAreaElement;
    // 段落数1のとき「\n\n」で分割した配列の長さが1
    expect(output.value.split("\n\n")).toHaveLength(1);
  });

  // E-4: 文数変更で出力が変わる
  test("updates output when sentence count changes", () => {
    render(<DummyTextTile variant="full" />);
    const sentenceInput = screen.getByLabelText(
      "段落あたりの文数",
    ) as HTMLInputElement;
    fireEvent.change(sentenceInput, { target: { value: "1" } });
    const output = screen.getByLabelText("生成結果") as HTMLTextAreaElement;
    expect(output.value.length).toBeGreaterThan(0);
  });

  // E-5: ARIA — SegmentedControl に role="radiogroup" が付与されている
  test("has role=radiogroup for language selection", () => {
    render(<DummyTextTile variant="full" />);
    const radiogroup = screen.getByRole("radiogroup");
    expect(radiogroup).toBeInTheDocument();
  });

  // E-5: ARIA — SegmentedControl に aria-label が付与されている
  test("SegmentedControl has aria-label", () => {
    render(<DummyTextTile variant="full" />);
    const radiogroup = screen.getByRole("radiogroup");
    expect(radiogroup).toHaveAttribute("aria-label");
  });

  // E-5: ARIA — role="status" aria-live="polite" 領域が存在する（C-3）
  test("has role=status region with aria-live=polite", () => {
    render(<DummyTextTile variant="full" />);
    const statusRegions = screen.getAllByRole("status");
    expect(statusRegions.length).toBeGreaterThanOrEqual(1);
    expect(statusRegions[0]).toHaveAttribute("aria-live", "polite");
  });

  // E-5: ARIA — 生成後に role="status" 領域に実テキストサマリが表示される（C-3）
  test("shows summary text in role=status region after generation", () => {
    render(<DummyTextTile variant="full" />);
    const statusRegions = screen.getAllByRole("status");
    const allText = statusRegions.map((r) => r.textContent).join(" ");
    expect(allText.length).toBeGreaterThan(0);
  });

  // E-6: コピー文言変化 — コピー前は "コピー" が表示される
  test("copy button label is コピー before copying", () => {
    mockHook.copiedKey = null;
    render(<DummyTextTile variant="full" />);
    expect(screen.getByRole("button", { name: "コピー" })).toBeInTheDocument();
  });

  // E-6: コピー文言変化 — コピー後は COPIED_LABEL が表示される
  test("copy button label changes to COPIED_LABEL when copiedKey is set", () => {
    mockHook.copiedKey = true;
    render(<DummyTextTile variant="full" />);
    expect(
      screen.getByRole("button", { name: "コピーしました" }),
    ).toBeInTheDocument();
  });

  // E-7: 出力が空のときコピーボタンが disabled にならない（常に何か生成する）
  test("copy button is not disabled when output is non-empty", () => {
    render(<DummyTextTile variant="full" />);
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
      render(<DummyTextTile variant="full" />);
    }).not.toThrow();

    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      configurable: true,
      writable: true,
    });
  });

  // E-10: meta 由来の表示 — 入力欄が最初から表示される（確定提示方式）
  test("shows input controls immediately on mount (確定提示方式)", () => {
    render(<DummyTextTile variant="full" />);
    expect(screen.getByLabelText("段落数")).toBeInTheDocument();
    expect(screen.getByLabelText("段落あたりの文数")).toBeInTheDocument();
  });

  // 日本語モードでは「単語数」を表示しない
  test("does not show 単語 label in Japanese mode stats bar", () => {
    render(<DummyTextTile variant="full" />);
    const jpButton = screen.getByRole("radio", { name: "日本語" });
    fireEvent.click(jpButton);
    const allText = document.body.textContent ?? "";
    expect(allText).not.toContain("単語");
  });

  // 日本語モードでは「文字数」を表示する
  test("shows 文字 stat in Japanese mode", () => {
    render(<DummyTextTile variant="full" />);
    const jpButton = screen.getByRole("radio", { name: "日本語" });
    fireEvent.click(jpButton);
    const allText = document.body.textContent ?? "";
    expect(allText).toContain("文字");
  });

  // 日本語モードでは「N文」という統計表示がない
  test("does not show 文 label in Japanese mode stats", () => {
    render(<DummyTextTile variant="full" />);
    const jpButton = screen.getByRole("radio", { name: "日本語" });
    fireEvent.click(jpButton);
    const statsBar = document.querySelector("[aria-hidden='true']");
    const statsText = statsBar?.textContent ?? "";
    expect(statsText).not.toMatch(/\d+文(?!字)/);
  });

  // 日本語モードでは statusSummary（SR 用）に「単語」も「文」カウントも含まない
  test("statusSummary does not contain 単語 or 文カウント in Japanese mode", () => {
    render(<DummyTextTile variant="full" />);
    const jpButton = screen.getByRole("radio", { name: "日本語" });
    fireEvent.click(jpButton);
    const statusRegions = screen.getAllByRole("status");
    const statusText = statusRegions.map((r) => r.textContent).join(" ");
    expect(statusText).not.toContain("単語");
    expect(statusText).not.toMatch(/\d+文(?!字)/);
    expect(statusText).toContain("文字");
  });

  // G-5/数値整合性: 日本語モードで文字数が実際の出力長と一致する
  test("char count in statusSummary matches actual output length in Japanese mode", () => {
    render(<DummyTextTile variant="full" />);
    const jpButton = screen.getByRole("radio", { name: "日本語" });
    fireEvent.click(jpButton);
    const output = screen.getByLabelText("生成結果") as HTMLTextAreaElement;
    const actualLength = output.value.length;
    const statusRegions = screen.getAllByRole("status");
    const statusText = statusRegions.map((r) => r.textContent).join(" ");
    expect(statusText).toContain(actualLength.toLocaleString());
  });

  // G-5/数値整合性: Lorem Ipsum モードで paragraphs 設定値がサマリと一致する
  test("paragraph count in statusSummary matches input value in lorem mode", () => {
    render(<DummyTextTile variant="full" />);
    const paragraphInput = screen.getByLabelText("段落数") as HTMLInputElement;
    fireEvent.change(paragraphInput, { target: { value: "5" } });
    const statusRegions = screen.getAllByRole("status");
    const statusText = statusRegions.map((r) => r.textContent).join(" ");
    expect(statusText).toContain("5段落");
  });

  // Lorem Ipsum モードでは「単語数」が表示される
  test("shows 単語 stat in lorem mode", () => {
    render(<DummyTextTile variant="full" />);
    const allText = document.body.textContent ?? "";
    expect(allText).toContain("単語");
  });

  // E-12: CSS トークン検証（ファイル先頭 import { readFileSync } from "fs" を使用）
  test("CSS does not use deprecated --color-* tokens or --accent direct fill or font-weight 700", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/dummy-text/DummyTextTile.module.css",
    );
    const css = readFileSync(cssPath, "utf-8");

    // 旧トークン --color-* が存在しないこと
    expect(css).not.toMatch(/var\(--color-/);

    // --accent 直塗りがないこと（フォーカス用途 outline は許可）
    const accentDirectUse = css.match(
      /(?:background|color)\s*:\s*var\(--accent\)/g,
    );
    expect(accentDirectUse).toBeNull();

    // font-weight: 700 が CSS 宣言として存在しないこと
    const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(cssWithoutComments).not.toMatch(/font-weight\s*:\s*700/);
  });
});

describe("DummyTextTile — variant='lorem' (固定)", () => {
  beforeEach(() => {
    mockHook.copiedKey = null;
    mockHook.copy = vi.fn();
  });

  // 固定 variant では言語選択 SegmentedControl が非表示
  test("does not show language SegmentedControl", () => {
    render(<DummyTextTile variant="lorem" />);
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  // 固定 variant でも出力が非空
  test("renders non-empty Lorem Ipsum output", () => {
    render(<DummyTextTile variant="lorem" />);
    const output = screen.getByLabelText("生成結果") as HTMLTextAreaElement;
    expect(output.value).toContain("Lorem ipsum");
  });

  // 固定 variant でも段落数・文数コントロールは表示される（G-3: 全機能維持）
  test("shows paragraph and sentence controls", () => {
    render(<DummyTextTile variant="lorem" />);
    expect(screen.getByLabelText("段落数")).toBeInTheDocument();
    expect(screen.getByLabelText("段落あたりの文数")).toBeInTheDocument();
  });

  // 固定 variant でもコピーボタンが存在する
  test("shows copy button", () => {
    render(<DummyTextTile variant="lorem" />);
    expect(screen.getByRole("button", { name: "コピー" })).toBeInTheDocument();
  });
});

describe("DummyTextTile — variant='japanese' (固定)", () => {
  beforeEach(() => {
    mockHook.copiedKey = null;
    mockHook.copy = vi.fn();
  });

  // 固定 variant では言語選択 SegmentedControl が非表示
  test("does not show language SegmentedControl", () => {
    render(<DummyTextTile variant="japanese" />);
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  // 固定 variant でも出力が非空で日本語テキストが含まれる
  test("renders non-empty Japanese output", () => {
    render(<DummyTextTile variant="japanese" />);
    const output = screen.getByLabelText("生成結果") as HTMLTextAreaElement;
    expect(output.value).toMatch(/[　-鿿]/);
  });

  // 固定 variant でも段落数・文数コントロールは表示される（G-3: 全機能維持）
  test("shows paragraph and sentence controls", () => {
    render(<DummyTextTile variant="japanese" />);
    expect(screen.getByLabelText("段落数")).toBeInTheDocument();
    expect(screen.getByLabelText("段落あたりの文数")).toBeInTheDocument();
  });
});

describe("DummyTextTile — 複数インスタンス id 一意性（A-6）", () => {
  beforeEach(() => {
    mockHook.copiedKey = null;
    mockHook.copy = vi.fn();
  });

  // 複数インスタンスを同一ページに描画しても DOM id が重複しない
  test("no duplicate DOM ids when multiple instances are rendered", () => {
    const { container: c1 } = render(<DummyTextTile variant="full" />);
    const { container: c2 } = render(<DummyTextTile variant="lorem" />);

    const allIds1 = Array.from(c1.querySelectorAll("[id]")).map((el) =>
      el.getAttribute("id"),
    );
    const allIds2 = Array.from(c2.querySelectorAll("[id]")).map((el) =>
      el.getAttribute("id"),
    );

    const duplicates = allIds1.filter((id) => allIds2.includes(id));
    expect(duplicates).toHaveLength(0);
  });
});

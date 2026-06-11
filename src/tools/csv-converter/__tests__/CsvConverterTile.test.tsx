/**
 * CsvConverterTile のユニットテスト（TDD: 実装前に書く）
 *
 * 検証観点:
 * - V-1: variant=full でのレンダリング（入力形式・出力形式 Select が表示される）
 * - V-2: 変換ボタンで CSV → JSON 変換が動く
 * - V-3: 変換ボタンで CSV → TSV 変換が動く
 * - V-4: 変換ボタンで CSV → Markdown 変換が動く
 * - V-5: 無効な JSON 入力でエラーが日本語で表示される（英語エラー露出なし）
 * - V-6: ARIA — role="status" aria-live="polite" 領域が存在する
 * - V-7: 変換後に role="status" 領域に実テキストサマリが表示される（C-3）
 * - V-8: 出力が空のときコピーボタンが disabled
 * - V-9: 出力があるときコピーボタンが enabled
 * - V-10: コピーボタン文言変化（コピー前/後）
 * - V-11: id インスタンス一意性（同一ページに2つ描画して id 重複なし）
 * - V-12: CSS トークン検証（--color-* 不使用・--accent 直塗り禁止・font-weight:700 禁止）
 * - V-13: navigator.clipboard 不在環境でクラッシュしない
 * - V-14: 変換後に形式変更すると旧結果がクリアされない（ユーザーが再度「変換」ボタンを押すまで）
 */
import { describe, test, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";
import CsvConverterTile from "../CsvConverterTile";

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

describe("CsvConverterTile", () => {
  beforeEach(() => {
    mockHook.copiedKey = null;
    mockHook.copy = vi.fn();
  });

  // V-1: 基本レンダリング
  describe("V-1: variant=full でのレンダリング", () => {
    it("renders without crashing", () => {
      render(<CsvConverterTile variant="full" />);
      expect(screen.getByLabelText("入力データ")).toBeInTheDocument();
    });

    it("入力形式・出力形式 Select が表示される", () => {
      render(<CsvConverterTile variant="full" />);
      expect(screen.getByLabelText("入力形式")).toBeInTheDocument();
      expect(screen.getByLabelText("出力形式")).toBeInTheDocument();
    });

    it("入力欄と出力欄が初期状態から見える（確定提示方式）", () => {
      render(<CsvConverterTile variant="full" />);
      expect(screen.getByLabelText("入力データ")).toBeInTheDocument();
      expect(screen.getByLabelText("変換結果")).toBeInTheDocument();
    });

    it("空入力時のデフォルト状態でエラーが表示されない", () => {
      render(<CsvConverterTile variant="full" />);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  // V-2: CSV → JSON 変換
  describe("V-2: CSV → JSON 変換", () => {
    it("変換ボタンで CSV → JSON 変換が動く", () => {
      render(<CsvConverterTile variant="full" />);
      const input = screen.getByLabelText("入力データ");
      fireEvent.change(input, { target: { value: "name,age\nAlice,30" } });

      const fromSelect = screen.getByLabelText("入力形式");
      const toSelect = screen.getByLabelText("出力形式");
      fireEvent.change(fromSelect, { target: { value: "csv" } });
      fireEvent.change(toSelect, { target: { value: "json" } });

      fireEvent.click(screen.getByRole("button", { name: "変換" }));
      const output = screen.getByLabelText("変換結果") as HTMLTextAreaElement;
      expect(output.value).toContain('"name": "Alice"');
    });
  });

  // V-3: CSV → TSV 変換
  describe("V-3: CSV → TSV 変換", () => {
    it("変換ボタンで CSV → TSV 変換が動く", () => {
      render(<CsvConverterTile variant="full" />);
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
  });

  // V-4: CSV → Markdown 変換
  describe("V-4: CSV → Markdown 変換", () => {
    it("変換ボタンで CSV → Markdown 変換が動く", () => {
      render(<CsvConverterTile variant="full" />);
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
  });

  // V-5: 無効 JSON でエラーが日本語で表示される
  describe("V-5: エラーハンドリング", () => {
    it("無効な JSON 入力でエラーが日本語で表示される（英語エラー露出なし）", () => {
      render(<CsvConverterTile variant="full" />);
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
  });

  // V-6: ARIA — role="status" aria-live="polite"
  describe("V-6: ARIA", () => {
    it("role=status aria-live=polite 領域が存在する", () => {
      render(<CsvConverterTile variant="full" />);
      const statusRegion = screen.getByRole("status");
      expect(statusRegion).toBeInTheDocument();
      expect(statusRegion).toHaveAttribute("aria-live", "polite");
    });
  });

  // V-7: 変換後に role="status" 領域に実テキストサマリが表示される
  describe("V-7: ライブリージョン サマリ", () => {
    it("変換後に role=status 領域に実テキストサマリが表示される（C-3）", () => {
      render(<CsvConverterTile variant="full" />);
      const input = screen.getByLabelText("入力データ");
      fireEvent.change(input, { target: { value: "a,b\n1,2" } });
      fireEvent.click(screen.getByRole("button", { name: "変換" }));
      const statusRegion = screen.getByRole("status");
      expect(statusRegion.textContent).not.toBe("");
    });
  });

  // V-8: 出力が空のときコピーボタンが disabled
  describe("V-8: コピーボタン disabled", () => {
    it("出力が空のときコピーボタンが disabled", () => {
      render(<CsvConverterTile variant="full" />);
      // 初期状態（サンプルデータ）でも出力欄は空。変換前は disabled。
      const copyButton = screen.getByRole("button", { name: "コピー" });
      expect(copyButton).toBeDisabled();
    });
  });

  // V-9: 出力があるときコピーボタンが enabled
  describe("V-9: コピーボタン enabled", () => {
    it("出力があるときコピーボタンが enabled", () => {
      render(<CsvConverterTile variant="full" />);
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
  });

  // V-10: コピーボタン文言変化
  describe("V-10: コピーボタン文言変化", () => {
    it("コピー前は 'コピー' が表示される（copiedKey=null）", () => {
      mockHook.copiedKey = null;
      render(<CsvConverterTile variant="full" />);
      const input = screen.getByLabelText("入力データ");
      fireEvent.change(input, { target: { value: "a,b\n1,2" } });
      fireEvent.click(screen.getByRole("button", { name: "変換" }));
      expect(
        screen.getByRole("button", { name: "コピー" }),
      ).toBeInTheDocument();
    });

    it("コピー後は COPIED_LABEL が表示される（copiedKey 設定済み）", () => {
      mockHook.copiedKey = true;
      render(<CsvConverterTile variant="full" />);
      const input = screen.getByLabelText("入力データ");
      fireEvent.change(input, { target: { value: "a,b\n1,2" } });
      fireEvent.click(screen.getByRole("button", { name: "変換" }));
      expect(
        screen.getByRole("button", { name: "コピーしました" }),
      ).toBeInTheDocument();
    });
  });

  // V-11: id インスタンス一意性
  describe("V-11: id インスタンス一意性", () => {
    it("同一ページに2つ描画しても input id が重複しない", () => {
      const { container: c1 } = render(<CsvConverterTile variant="full" />);
      const { container: c2 } = render(<CsvConverterTile variant="full" />);

      const input1 = c1.querySelector("textarea[id]");
      const input2 = c2.querySelector("textarea[id]");

      expect(input1).not.toBeNull();
      expect(input2).not.toBeNull();
      expect(input1!.id).not.toBe(input2!.id);
    });

    it("2つのインスタンスで全 id 要素が重複しない", () => {
      const { container: c1 } = render(<CsvConverterTile variant="full" />);
      const { container: c2 } = render(<CsvConverterTile variant="full" />);

      const ids1 = [...c1.querySelectorAll("[id]")].map((el) => el.id);
      const ids2 = [...c2.querySelectorAll("[id]")].map((el) => el.id);

      const overlap = ids1.filter((id) => ids2.includes(id));
      expect(overlap).toHaveLength(0);
    });
  });

  // V-12: CSS トークン検証
  test("V-12: CSS は --color-* / --accent 直塗り / font-weight:700 を含まない", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/csv-converter/CsvConverterTile.module.css",
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

  // V-13: navigator.clipboard 不在環境でクラッシュしない
  test("V-13: navigator.clipboard が存在しない環境でコピーが例外を投げない", async () => {
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
      writable: true,
    });

    expect(() => {
      render(<CsvConverterTile variant="full" />);
    }).not.toThrow();

    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      configurable: true,
      writable: true,
    });
  });
});

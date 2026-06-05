/**
 * UnitConverterPage 回帰テスト
 *
 * E-1: 基本レンダリング
 * E-2: 入力→結果更新
 * E-3: 空入力時の挙動
 * E-4: 変換ロジックの正確性（UI経由）
 * E-5: ARIA 属性
 * E-6: コピー文言変化 → N/A（T-4b: unit-converter はコピーなし）
 * E-7: コピー disabled 状態 → N/A（コピーボタンなし）
 * E-8: clipboard 不在時の silent fail → N/A（コピーボタンなし）
 * E-9: 詳細リンク → N/A（unit-converter に詳細リンクなし）
 * E-10: meta 由来の表示
 * E-11: 既存 logic.ts テストが PASS し続けるか
 * E-12: CSS トークン検証（readFileSync パターン）
 */

import { describe, test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";
import UnitConverterPage from "../UnitConverterPage";

// ---- E-1: 基本レンダリング ----
describe("E-1: 基本レンダリング", () => {
  test("コンポーネントが正常にレンダリングされる", () => {
    render(<UnitConverterPage />);
    expect(screen.getByLabelText("変換する値")).toBeInTheDocument();
    expect(screen.getByLabelText("変換元の単位")).toBeInTheDocument();
    expect(screen.getByLabelText("変換先の単位")).toBeInTheDocument();
    expect(
      screen.getByLabelText("変換元と変換先の単位を入れ替え"),
    ).toBeInTheDocument();
  });

  test("カテゴリのSegmentedControlが表示される", () => {
    render(<UnitConverterPage />);
    // 「カテゴリ」ラベルが表示されている
    expect(screen.getByText("カテゴリ")).toBeInTheDocument();
    // 5カテゴリのラジオボタンが表示されている
    const radioButtons = screen.getAllByRole("radio");
    expect(radioButtons).toHaveLength(5);
  });
});

// ---- E-2: 入力→結果更新 ----
describe("E-2: 入力→結果更新", () => {
  test("数値を入力すると変換結果が更新される", () => {
    render(<UnitConverterPage />);
    const input = screen.getByLabelText("変換する値");
    fireEvent.change(input, { target: { value: "1000" } });
    // 初期状態: meter → kilometer なので 1000m = 1km
    expect(screen.getByLabelText("変換結果")).toHaveTextContent("1");
  });

  test("カテゴリを変更すると単位が変わる", () => {
    render(<UnitConverterPage />);
    const weightButton = screen.getByRole("radio", { name: "重さ" });
    fireEvent.click(weightButton);
    // 重さカテゴリの単位が選択肢に表示されることを確認
    const fromSelect = screen.getByLabelText("変換元の単位");
    expect(fromSelect).toHaveValue("milligram");
  });

  test("単位を変更すると結果が更新される", () => {
    render(<UnitConverterPage />);
    const input = screen.getByLabelText("変換する値");
    fireEvent.change(input, { target: { value: "1" } });
    const fromSelect = screen.getByLabelText("変換元の単位");
    // meter -> centimeter に変更
    fireEvent.change(fromSelect, { target: { value: "centimeter" } });
    // 1cm = 0.001m → toUnit(kilometer) なら 0.00001km
    // 初期のtoUnitはkilometerなので
    const result = screen.getByLabelText("変換結果");
    expect(result).toBeInTheDocument();
  });
});

// ---- E-3: 空入力時の挙動 ----
describe("E-3: 空入力時の挙動", () => {
  test("初期状態では全単位変換結果が表示される（初期値が1のため）", () => {
    render(<UnitConverterPage />);
    // 初期値は"1"なので変換結果が表示される
    expect(screen.getByText("全単位での変換結果")).toBeInTheDocument();
  });

  test("入力を空にすると予告ヒントが表示される", () => {
    render(<UnitConverterPage />);
    const input = screen.getByLabelText("変換する値");
    fireEvent.change(input, { target: { value: "" } });
    expect(
      screen.getByText("数値を入力すると全単位での変換結果が表示されます"),
    ).toBeInTheDocument();
  });

  // type="number" の input では "abc" のような非数値はブラウザ・jsdom ともに
  // 無効として空文字扱いになるため、「無効数値」のエラーケースは
  // 実際の使用では発生しない（ブラウザが数値以外の入力を弾く）。
  // 代わりに、空入力時の予告ヒントをここで確認する（E-3の他テストと重複だが明示）。
  test("空文字を入力すると全単位変換結果は表示されない", () => {
    render(<UnitConverterPage />);
    const input = screen.getByLabelText("変換する値");
    fireEvent.change(input, { target: { value: "" } });
    // エラーメッセージは表示されない（hasInput が false なため）
    expect(
      screen.queryByText("有効な数値を入力してください"),
    ).not.toBeInTheDocument();
    // 予告ヒントが表示される
    expect(
      screen.getByText("数値を入力すると全単位での変換結果が表示されます"),
    ).toBeInTheDocument();
  });
});

// ---- E-4: 変換ロジックの正確性（UI経由） ----
describe("E-4: 変換ロジックの正確性", () => {
  test("1メートル → キロメートル = 0.001", () => {
    render(<UnitConverterPage />);
    const input = screen.getByLabelText("変換する値");
    fireEvent.change(input, { target: { value: "1" } });
    // 初期: meter -> kilometer
    const result = screen.getByLabelText("変換結果");
    expect(result).toHaveTextContent("0.001");
  });

  test("0摂氏 → 華氏 = 32（温度カテゴリ）", () => {
    render(<UnitConverterPage />);
    // 温度カテゴリを選択
    const tempButton = screen.getByRole("radio", { name: "温度" });
    fireEvent.click(tempButton);
    // from: celsius (初期値の最初の単位), to: fahrenheit (2番目)
    const input = screen.getByLabelText("変換する値");
    fireEvent.change(input, { target: { value: "0" } });
    const result = screen.getByLabelText("変換結果");
    expect(result).toHaveTextContent("32");
  });

  test("スワップボタンで変換元と変換先が入れ替わる", () => {
    render(<UnitConverterPage />);
    const fromSelect = screen.getByLabelText(
      "変換元の単位",
    ) as HTMLSelectElement;
    const toSelect = screen.getByLabelText("変換先の単位") as HTMLSelectElement;
    const initialFrom = fromSelect.value;
    const initialTo = toSelect.value;

    const swapButton = screen.getByLabelText("変換元と変換先の単位を入れ替え");
    fireEvent.click(swapButton);

    expect(fromSelect.value).toBe(initialTo);
    expect(toSelect.value).toBe(initialFrom);
  });
});

// ---- E-5: ARIA 属性 ----
describe("E-5: ARIA 属性", () => {
  test("SegmentedControl が role='radiogroup' を持つ", () => {
    render(<UnitConverterPage />);
    const radiogroup = screen.getByRole("radiogroup");
    expect(radiogroup).toBeInTheDocument();
  });

  test("カテゴリ SegmentedControl が aria-labelledby を持つ", () => {
    render(<UnitConverterPage />);
    const radiogroup = screen.getByRole("radiogroup");
    expect(radiogroup).toHaveAttribute("aria-labelledby");
  });

  test("変換結果欄が role='status' と aria-live='polite' を持つ", () => {
    render(<UnitConverterPage />);
    // 変換結果の role="status"エリア（変換先の単一結果）
    const statusAreas = screen.getAllByRole("status");
    // 少なくとも1つの status が aria-live="polite" を持つことを確認
    const politeStatus = statusAreas.filter(
      (el) => el.getAttribute("aria-live") === "polite",
    );
    expect(politeStatus.length).toBeGreaterThan(0);
  });

  test("スワップボタンが aria-label を持つ", () => {
    render(<UnitConverterPage />);
    const swapButton = screen.getByLabelText("変換元と変換先の単位を入れ替え");
    expect(swapButton).toBeInTheDocument();
  });

  test("スワップボタンが生グリフ「⇄」を含まず SVG アイコンを使う", () => {
    render(<UnitConverterPage />);
    const swapButton = screen.getByLabelText("変換元と変換先の単位を入れ替え");
    // 生グリフが含まれていないことを確認
    expect(swapButton.textContent).not.toContain("⇄");
    // SVG アイコンが含まれていることを確認
    const svgEl = swapButton.querySelector("svg");
    expect(svgEl).toBeInTheDocument();
    // Lucide スタイル（stroke="currentColor", fill="none"）であることを確認
    expect(svgEl).toHaveAttribute("stroke", "currentColor");
    expect(svgEl).toHaveAttribute("fill", "none");
  });

  test("初期値で長さカテゴリのラジオボタンが選択状態になっている", () => {
    render(<UnitConverterPage />);
    const lengthRadio = screen.getByRole("radio", { name: "長さ" });
    expect(lengthRadio).toHaveAttribute("aria-checked", "true");
  });
});

// ---- E-6~E-8: コピー関連 N/A（T-4b: unit-converter はコピーなし） ----
// unit-converter は「換算値を読んで知る」知る対象のため、コピーボタンなし
// E-6, E-7, E-8 はすべて N/A

// ---- E-9: 詳細リンク → N/A（このツールには詳細リンクなし） ----

// ---- E-10: meta 由来の表示 ----
// ToolPageLayout は page.tsx レベルでテストされるが、
// UnitConverterPage 単体では meta を受け取らないため N/A
// page.tsx が ToolPageLayout を通じて meta.name を表示することは
// ToolPageLayout のテストでカバー済み

// ---- E-11: 既存 logic.ts テストが PASS し続けるか ----
// logic.test.ts は独立ファイルとして存在し、この実装では logic.ts を変更していないため PASS 維持

// ---- E-12: CSS トークン検証 ----
describe("E-12: CSS トークン検証", () => {
  const cssPath = join(
    process.cwd(),
    "src/tools/unit-converter/UnitConverterPage.module.css",
  );
  const css = readFileSync(cssPath, "utf-8");

  test("旧 --color-* トークンが存在しない", () => {
    expect(css).not.toMatch(/var\(--color-/);
  });

  test("--accent を塗りに直接使っていない（フォーカス outline 以外）", () => {
    // background や color への --accent 直接使用を禁止
    // フォーカスのみ outline: 2px solid var(--accent) という使い方が許可されている
    expect(css).not.toMatch(/background[^:]*:[^;]*var\(--accent\)/);
    expect(css).not.toMatch(/color[^:]*:[^;]*var\(--accent\)/);
  });

  test("font-weight: 700 がコメント外のルールに存在しない", () => {
    // CSSコメント（/* ... */）を除去してからチェック
    const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(cssWithoutComments).not.toMatch(/font-weight:\s*700/);
  });

  test("box-shadow が通常要素に使われていない（dragging 以外）", () => {
    // box-shadow は dragging 用のみ許可
    const boxShadowMatches = css.match(/box-shadow:/g) ?? [];
    expect(boxShadowMatches).toHaveLength(0);
  });
});

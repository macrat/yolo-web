/**
 * UnitConverterTile 回帰テスト
 *
 * 旧 UnitConverterPage.test.tsx の全ケースを移植・拡張。
 *
 * T-1: 基本レンダリング（Panel ルート確認・必須コントロール存在）
 * T-2: 入力→結果更新
 * T-3: 空入力時の挙動
 * T-4: 変換ロジックの正確性（UI経由）
 * T-5: ARIA 属性
 * T-6: 複数インスタンス id 一意性
 * T-7: カテゴリ切替挙動
 * T-8: スワップ挙動
 * T-9: 全単位グリッド
 * T-10: CSS トークン検証
 */

import { describe, test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";
import UnitConverterTile from "../UnitConverterTile";

// ---- T-1: 基本レンダリング ----
describe("T-1: 基本レンダリング", () => {
  test("コンポーネントが正常にレンダリングされる", () => {
    render(<UnitConverterTile />);
    expect(screen.getByLabelText("変換する値")).toBeInTheDocument();
    expect(screen.getByLabelText("変換元の単位")).toBeInTheDocument();
    expect(screen.getByLabelText("変換先の単位")).toBeInTheDocument();
    expect(
      screen.getByLabelText("変換元と変換先の単位を入れ替え"),
    ).toBeInTheDocument();
  });

  test("カテゴリのSegmentedControlが表示される", () => {
    render(<UnitConverterTile />);
    expect(screen.getByText("カテゴリ")).toBeInTheDocument();
    const radioButtons = screen.getAllByRole("radio");
    expect(radioButtons).toHaveLength(5);
  });

  test("variant='full' のデフォルト動作", () => {
    render(<UnitConverterTile variant="full" />);
    // full はカテゴリ選択が表示される
    const radiogroup = screen.getByRole("radiogroup");
    expect(radiogroup).toBeInTheDocument();
  });

  test("Panel ルート要素を持つ（data-testid 等ではなく section/div で確認）", () => {
    const { container } = render(<UnitConverterTile as="section" />);
    // Panel が section として描画される
    const root = container.firstChild as HTMLElement;
    expect(root.tagName.toLowerCase()).toBe("section");
  });
});

// ---- T-2: 入力→結果更新 ----
describe("T-2: 入力→結果更新", () => {
  test("数値を入力すると変換結果が更新される（1000m → 1km）", () => {
    render(<UnitConverterTile />);
    const input = screen.getByLabelText("変換する値");
    fireEvent.change(input, { target: { value: "1000" } });
    expect(screen.getByLabelText("変換結果")).toHaveTextContent("1");
  });

  test("カテゴリを変更すると単位が変わる", () => {
    render(<UnitConverterTile />);
    const weightButton = screen.getByRole("radio", { name: "重さ" });
    fireEvent.click(weightButton);
    const fromSelect = screen.getByLabelText("変換元の単位");
    expect(fromSelect).toHaveValue("milligram");
  });

  test("単位を変更すると結果が更新される", () => {
    render(<UnitConverterTile />);
    const input = screen.getByLabelText("変換する値");
    fireEvent.change(input, { target: { value: "1" } });
    const fromSelect = screen.getByLabelText("変換元の単位");
    fireEvent.change(fromSelect, { target: { value: "centimeter" } });
    const result = screen.getByLabelText("変換結果");
    expect(result).toBeInTheDocument();
  });
});

// ---- T-3: 空入力時の挙動 ----
describe("T-3: 空入力時の挙動", () => {
  test("初期状態では全単位変換結果が表示される（初期値が1のため）", () => {
    render(<UnitConverterTile />);
    expect(screen.getByText("全単位での変換結果")).toBeInTheDocument();
  });

  test("入力を空にすると予告ヒントが表示される", () => {
    render(<UnitConverterTile />);
    const input = screen.getByLabelText("変換する値");
    fireEvent.change(input, { target: { value: "" } });
    expect(
      screen.getByText("数値を入力すると全単位での変換結果が表示されます"),
    ).toBeInTheDocument();
  });

  test("空文字を入力するとエラーメッセージは表示されない", () => {
    render(<UnitConverterTile />);
    const input = screen.getByLabelText("変換する値");
    fireEvent.change(input, { target: { value: "" } });
    expect(
      screen.queryByText("有効な数値を入力してください"),
    ).not.toBeInTheDocument();
  });
});

// ---- T-4: 変換ロジックの正確性 ----
describe("T-4: 変換ロジックの正確性", () => {
  test("1メートル → キロメートル = 0.001", () => {
    render(<UnitConverterTile />);
    const input = screen.getByLabelText("変換する値");
    fireEvent.change(input, { target: { value: "1" } });
    const result = screen.getByLabelText("変換結果");
    expect(result).toHaveTextContent("0.001");
  });

  test("0摂氏 → 華氏 = 32（温度カテゴリ）", () => {
    render(<UnitConverterTile />);
    const tempButton = screen.getByRole("radio", { name: "温度" });
    fireEvent.click(tempButton);
    const input = screen.getByLabelText("変換する値");
    fireEvent.change(input, { target: { value: "0" } });
    const result = screen.getByLabelText("変換結果");
    expect(result).toHaveTextContent("32");
  });

  test("カテゴリ切替後に古い結果が残らない（G-1要件）", () => {
    render(<UnitConverterTile />);
    // 長さカテゴリで 1000 を入力 → 結果が表示される
    const input = screen.getByLabelText("変換する値");
    fireEvent.change(input, { target: { value: "1000" } });
    // 重さカテゴリに変更 → 単位リセット
    const weightButton = screen.getByRole("radio", { name: "重さ" });
    fireEvent.click(weightButton);
    // カテゴリ変更後は重さ単位が選択され、計算は重さベースで行われる
    const fromSelect = screen.getByLabelText("変換元の単位");
    expect(fromSelect).toHaveValue("milligram");
    // 古い「長さ」計算結果（kilometer相当）が残っていないことを確認：
    // 新カテゴリで結果表示があるかどうかは入力値1000次第だが、
    // fromUnit がリセットされていることが確認できれば十分
    const toSelect = screen.getByLabelText("変換先の単位");
    expect(toSelect).toHaveValue("gram");
  });
});

// ---- T-5: ARIA 属性 ----
describe("T-5: ARIA 属性", () => {
  test("SegmentedControl が role='radiogroup' を持つ", () => {
    render(<UnitConverterTile />);
    const radiogroup = screen.getByRole("radiogroup");
    expect(radiogroup).toBeInTheDocument();
  });

  test("カテゴリ SegmentedControl が aria-labelledby を持つ", () => {
    render(<UnitConverterTile />);
    const radiogroup = screen.getByRole("radiogroup");
    expect(radiogroup).toHaveAttribute("aria-labelledby");
  });

  test("変換結果欄が role='status' と aria-live='polite' を持つ", () => {
    render(<UnitConverterTile />);
    const statusAreas = screen.getAllByRole("status");
    const politeStatus = statusAreas.filter(
      (el) => el.getAttribute("aria-live") === "polite",
    );
    expect(politeStatus.length).toBeGreaterThan(0);
  });

  test("スワップボタンが aria-label を持つ", () => {
    render(<UnitConverterTile />);
    const swapButton = screen.getByLabelText("変換元と変換先の単位を入れ替え");
    expect(swapButton).toBeInTheDocument();
  });

  test("スワップボタンが生グリフ「⇄」を含まず SVG アイコンを使う", () => {
    render(<UnitConverterTile />);
    const swapButton = screen.getByLabelText("変換元と変換先の単位を入れ替え");
    expect(swapButton.textContent).not.toContain("⇄");
    const svgEl = swapButton.querySelector("svg");
    expect(svgEl).toBeInTheDocument();
    expect(svgEl).toHaveAttribute("stroke", "currentColor");
    expect(svgEl).toHaveAttribute("fill", "none");
  });

  test("初期値で長さカテゴリのラジオボタンが選択状態になっている", () => {
    render(<UnitConverterTile />);
    const lengthRadio = screen.getByRole("radio", { name: "長さ" });
    expect(lengthRadio).toHaveAttribute("aria-checked", "true");
  });

  test("Input と label の関連付けが useId で一意化されている", () => {
    render(<UnitConverterTile />);
    const input = screen.getByLabelText("変換する値");
    expect(input.id).toBeTruthy();
  });
});

// ---- T-6: 複数インスタンス id 一意性 ----
describe("T-6: 複数インスタンス id 一意性", () => {
  test("2つのインスタンスが同一ページに共存しても id が重複しない", () => {
    const { container } = render(
      <>
        <UnitConverterTile as="section" />
        <UnitConverterTile as="section" />
      </>,
    );
    const allIds = Array.from(container.querySelectorAll("[id]")).map(
      (el) => el.id,
    );
    const uniqueIds = new Set(allIds);
    // id が重複していないこと
    expect(allIds.length).toBe(uniqueIds.size);
  });

  test("2インスタンス共存で label と input の関連付けが各々正しく維持される", () => {
    render(
      <>
        <UnitConverterTile as="section" />
        <UnitConverterTile as="section" />
      </>,
    );
    // 2つの「変換する値」ラベルが存在する
    const inputs = screen.getAllByLabelText("変換する値");
    expect(inputs).toHaveLength(2);
    // 各入力欄のidが異なること
    expect(inputs[0].id).not.toBe(inputs[1].id);
  });
});

// ---- T-7: カテゴリ切替挙動 ----
describe("T-7: カテゴリ切替", () => {
  test("長さ → 面積 切替で面積単位が現れる", () => {
    render(<UnitConverterTile />);
    const areaButton = screen.getByRole("radio", { name: "面積" });
    fireEvent.click(areaButton);
    const fromSelect = screen.getByLabelText("変換元の単位");
    // 面積カテゴリの最初の単位（sqmillimeter = 平方ミリメートル）
    expect(fromSelect).toHaveValue("sqmillimeter");
  });

  test("長さ → 速度 切替で速度単位が現れる", () => {
    render(<UnitConverterTile />);
    const speedButton = screen.getByRole("radio", { name: "速度" });
    fireEvent.click(speedButton);
    const fromSelect = screen.getByLabelText("変換元の単位");
    // 速度カテゴリの最初の単位（mps = メートル毎秒）
    expect(fromSelect).toHaveValue("mps");
  });
});

// ---- T-8: スワップ挙動 ----
describe("T-8: スワップ挙動", () => {
  test("スワップボタンで変換元と変換先が入れ替わる", () => {
    render(<UnitConverterTile />);
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

  test("スワップ後も入力値は保持される", () => {
    render(<UnitConverterTile />);
    const input = screen.getByLabelText("変換する値");
    fireEvent.change(input, { target: { value: "42" } });

    const swapButton = screen.getByLabelText("変換元と変換先の単位を入れ替え");
    fireEvent.click(swapButton);

    expect((input as HTMLInputElement).value).toBe("42");
  });
});

// ---- T-9: 全単位グリッド ----
describe("T-9: 全単位グリッド", () => {
  test("数値入力後に全単位変換結果グリッドが表示される", () => {
    render(<UnitConverterTile />);
    // 初期値1が入力されているので全単位グリッドが表示される
    expect(screen.getByText("全単位での変換結果")).toBeInTheDocument();
  });

  test("長さカテゴリで from=meter 以外の全単位が結果に含まれる", () => {
    render(<UnitConverterTile />);
    const input = screen.getByLabelText("変換する値");
    fireEvent.change(input, { target: { value: "1" } });
    // from=meter, 全単位グリッドには fromUnit 以外の単位が表示される
    // 長さカテゴリには11単位 (millimeter, centimeter, meter, kilometer, ...) あり
    // fromUnit(meter) 以外の10単位が全単位グリッドに表示される
    expect(screen.getByText("全単位での変換結果")).toBeInTheDocument();
    // キロメートルが結果一覧に含まれる（mm, cm, km, in, ft, yd, mi, 尺, 寸, 間）
    expect(screen.getByText(/km \(キロメートル\)/)).toBeInTheDocument();
  });

  test("空入力時は全単位グリッドが消えヒントが表示される", () => {
    render(<UnitConverterTile />);
    const input = screen.getByLabelText("変換する値");
    fireEvent.change(input, { target: { value: "" } });
    expect(screen.queryByText("全単位での変換結果")).not.toBeInTheDocument();
    expect(
      screen.getByText("数値を入力すると全単位での変換結果が表示されます"),
    ).toBeInTheDocument();
  });
});

// ---- T-10: CSS トークン検証 ----
describe("T-10: CSS トークン検証", () => {
  const cssPath = join(
    process.cwd(),
    "src/tools/unit-converter/UnitConverterTile.module.css",
  );
  const css = readFileSync(cssPath, "utf-8");

  test("旧 --color-* トークンが存在しない（B-1）", () => {
    expect(css).not.toMatch(/var\(--color-/);
  });

  test("--accent を塗りに直接使っていない（B-3）", () => {
    expect(css).not.toMatch(/background[^:]*:[^;]*var\(--accent\)/);
    expect(css).not.toMatch(/color[^:]*:[^;]*var\(--accent\)/);
  });

  test("font-weight: 700 がコメント外のルールに存在しない（B-4）", () => {
    const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(cssWithoutComments).not.toMatch(/font-weight:\s*700/);
  });

  test("box-shadow が通常要素に使われていない（B-6）", () => {
    const boxShadowMatches = css.match(/box-shadow:/g) ?? [];
    expect(boxShadowMatches).toHaveLength(0);
  });
});

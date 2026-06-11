import { describe, test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";
import AgeCalculatorTile from "../AgeCalculatorTile";

describe("AgeCalculatorTile", () => {
  // A-1: ルートが Panel であること（タグは section がデフォルト）
  test("renders root element as section (Panel default)", () => {
    const { container } = render(<AgeCalculatorTile />);
    expect(container.firstChild?.nodeName).toBe("SECTION");
  });

  // A-1: as prop で変更可能
  test("renders root as div when as=div", () => {
    const { container } = render(<AgeCalculatorTile as="div" />);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  // 基本レンダリング: 生年月日・基準日の入力欄が表示される
  test("renders birth date and target date inputs", () => {
    render(<AgeCalculatorTile />);
    expect(screen.getByLabelText("生年月日")).toBeInTheDocument();
    expect(screen.getByLabelText("基準日")).toBeInTheDocument();
  });

  // 基本レンダリング: 計算ボタンと今日に設定ボタンが表示される
  test("renders calculate and set-today buttons", () => {
    render(<AgeCalculatorTile />);
    expect(screen.getByRole("button", { name: "計算" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "今日に設定" }),
    ).toBeInTheDocument();
  });

  // 初期状態: エラーも結果も表示されない
  test("shows no error and no result on initial state", () => {
    render(<AgeCalculatorTile />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByText("年齢")).not.toBeInTheDocument();
  });

  // 計算後に年齢結果が表示される
  test("shows age result after calculation", () => {
    render(<AgeCalculatorTile />);
    const birthInput = screen.getByLabelText("生年月日");
    const targetInput = screen.getByLabelText("基準日");
    fireEvent.change(birthInput, { target: { value: "2000-01-01" } });
    fireEvent.change(targetInput, { target: { value: "2026-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    const resultSection = screen.getByRole("region", { name: "年齢計算結果" });
    expect(resultSection).toBeInTheDocument();
    expect(resultSection.textContent).toMatch(/26歳0ヶ月0日/);
  });

  // 変換ロジックの正確性
  test("calculates age correctly for known date", () => {
    render(<AgeCalculatorTile />);
    const birthInput = screen.getByLabelText("生年月日");
    const targetInput = screen.getByLabelText("基準日");
    fireEvent.change(birthInput, { target: { value: "1990-06-15" } });
    fireEvent.change(targetInput, { target: { value: "2026-06-05" } });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    const resultSection = screen.getByRole("region", { name: "年齢計算結果" });
    expect(resultSection.textContent).toMatch(/35歳11ヶ月/);
  });

  // 和暦が表示される
  test("shows wareki for birth date", () => {
    render(<AgeCalculatorTile />);
    const birthInput = screen.getByLabelText("生年月日");
    const targetInput = screen.getByLabelText("基準日");
    fireEvent.change(birthInput, { target: { value: "2000-01-01" } });
    fireEvent.change(targetInput, { target: { value: "2026-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    expect(screen.getByText(/平成12年/)).toBeInTheDocument();
  });

  // 干支が読み仮名付きで表示される
  test("shows zodiac with reading for birth year", () => {
    render(<AgeCalculatorTile />);
    const birthInput = screen.getByLabelText("生年月日");
    const targetInput = screen.getByLabelText("基準日");
    fireEvent.change(birthInput, { target: { value: "2000-01-01" } });
    fireEvent.change(targetInput, { target: { value: "2026-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    // 2000年 = 辰（たつ）年
    expect(screen.getByText(/辰（たつ）/)).toBeInTheDocument();
  });

  // 干支の読み仮名が別の年でも正しく表示される（午年）
  test("shows zodiac with reading 午（うま）for 2026", () => {
    render(<AgeCalculatorTile />);
    const birthInput = screen.getByLabelText("生年月日");
    const targetInput = screen.getByLabelText("基準日");
    fireEvent.change(birthInput, { target: { value: "2026-01-01" } });
    fireEvent.change(targetInput, { target: { value: "2030-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    // 2026年 = 午（うま）年
    expect(screen.getByText(/午（うま）/)).toBeInTheDocument();
  });

  // 星座が表示される
  test("shows constellation for birth date", () => {
    render(<AgeCalculatorTile />);
    const birthInput = screen.getByLabelText("生年月日");
    const targetInput = screen.getByLabelText("基準日");
    fireEvent.change(birthInput, { target: { value: "2000-01-15" } });
    fireEvent.change(targetInput, { target: { value: "2026-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    // 1月15日 = 山羊座
    expect(screen.getByText(/山羊座/)).toBeInTheDocument();
  });

  // 通算日数が表示される
  test("shows total days", () => {
    render(<AgeCalculatorTile />);
    const birthInput = screen.getByLabelText("生年月日");
    const targetInput = screen.getByLabelText("基準日");
    fireEvent.change(birthInput, { target: { value: "2000-01-01" } });
    fireEvent.change(targetInput, { target: { value: "2026-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    expect(screen.getByText(/通算日数/)).toBeInTheDocument();
  });

  // 通算月数が表示される
  test("shows total months", () => {
    render(<AgeCalculatorTile />);
    const birthInput = screen.getByLabelText("生年月日");
    const targetInput = screen.getByLabelText("基準日");
    fireEvent.change(birthInput, { target: { value: "2000-01-01" } });
    fireEvent.change(targetInput, { target: { value: "2026-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    expect(screen.getByText(/通算月数/)).toBeInTheDocument();
  });

  // 生年月日未入力のエラー表示
  test("shows error when birth date is empty", () => {
    render(<AgeCalculatorTile />);
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert.textContent).toMatch(/生年月日/);
  });

  // 生年月日 > 基準日のエラー表示
  test("shows error when birth date is after target date", () => {
    render(<AgeCalculatorTile />);
    const birthInput = screen.getByLabelText("生年月日");
    const targetInput = screen.getByLabelText("基準日");
    fireEvent.change(birthInput, { target: { value: "2030-01-01" } });
    fireEvent.change(targetInput, { target: { value: "2000-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  // C-3: ライブリージョンが存在する
  test("has role=status aria-live=polite for live region", () => {
    render(<AgeCalculatorTile />);
    const statusEl = screen.getByRole("status");
    expect(statusEl).toBeInTheDocument();
    expect(statusEl).toHaveAttribute("aria-live", "polite");
  });

  // C-3: 計算後にライブリージョンに実テキストが入る
  test("live region contains summary text after calculation", () => {
    render(<AgeCalculatorTile />);
    const birthInput = screen.getByLabelText("生年月日");
    const targetInput = screen.getByLabelText("基準日");
    fireEvent.change(birthInput, { target: { value: "2000-01-01" } });
    fireEvent.change(targetInput, { target: { value: "2026-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    const statusEl = screen.getByRole("status");
    expect(statusEl.textContent).not.toBe("");
  });

  // ライブリージョンが srOnly クラスで視覚的に隠されていること
  test("live region has srOnly class to hide it visually", () => {
    render(<AgeCalculatorTile />);
    const statusEl = screen.getByRole("status");
    expect(statusEl.className).toMatch(/srOnly/);
  });

  // コピーボタンなし（age-calculator はコピー不要）
  test("no copy buttons", () => {
    render(<AgeCalculatorTile />);
    expect(
      screen.queryByRole("button", { name: /コピー/ }),
    ).not.toBeInTheDocument();
  });

  // A-6: 複数インスタンスで DOM id が重複しない
  test("multiple instances have unique ids (no duplication)", () => {
    render(
      <>
        <AgeCalculatorTile />
        <AgeCalculatorTile />
      </>,
    );
    const birthInputs = screen.getAllByLabelText("生年月日");
    const targetInputs = screen.getAllByLabelText("基準日");
    expect(birthInputs).toHaveLength(2);
    expect(targetInputs).toHaveLength(2);
    // id の一意性確認
    const id1 = birthInputs[0].id;
    const id2 = birthInputs[1].id;
    expect(id1).not.toBe("");
    expect(id2).not.toBe("");
    expect(id1).not.toBe(id2);
  });

  // CSS トークン検証（ファイル先頭の import { readFileSync } から）
  test("CSS does not use deprecated --color-* tokens", () => {
    const cssPath = resolve(__dirname, "../AgeCalculatorTile.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  test("CSS does not use --accent as background directly", () => {
    const cssPath = resolve(__dirname, "../AgeCalculatorTile.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/background(-color)?\s*:\s*var\(--accent\)/);
  });

  test("CSS does not use font-weight: 700", () => {
    const cssPath = resolve(__dirname, "../AgeCalculatorTile.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight\s*:\s*700/);
  });

  test("CSS defines .srOnly class for visually-hidden live region", () => {
    const cssPath = resolve(__dirname, "../AgeCalculatorTile.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toMatch(/\.srOnly/);
    expect(css).toMatch(/position\s*:\s*absolute/);
  });
});

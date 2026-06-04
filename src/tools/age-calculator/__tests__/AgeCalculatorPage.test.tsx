import { describe, test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";
import AgeCalculatorPage from "../AgeCalculatorPage";

describe("AgeCalculatorPage", () => {
  // E-1: 基本レンダリング
  test("renders without crashing", () => {
    render(<AgeCalculatorPage />);
    expect(screen.getByLabelText("生年月日")).toBeInTheDocument();
  });

  // E-1: 日付入力欄が2つ表示される
  test("renders birth date and target date inputs", () => {
    render(<AgeCalculatorPage />);
    expect(screen.getByLabelText("生年月日")).toBeInTheDocument();
    expect(screen.getByLabelText("基準日")).toBeInTheDocument();
  });

  // E-1: 計算ボタンと今日に設定ボタンが表示される
  test("renders calculate and set-today buttons", () => {
    render(<AgeCalculatorPage />);
    expect(screen.getByRole("button", { name: "計算" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "今日に設定" }),
    ).toBeInTheDocument();
  });

  // E-3: 空入力の初期状態ではエラーも結果も表示されない
  test("shows no error and no result on initial state", () => {
    render(<AgeCalculatorPage />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    // 結果テーブルが表示されていない
    expect(screen.queryByText("年齢")).not.toBeInTheDocument();
  });

  // E-2: 生年月日を入力して計算すると年齢が表示される
  test("shows age result after calculation", () => {
    render(<AgeCalculatorPage />);
    const birthInput = screen.getByLabelText("生年月日");
    const targetInput = screen.getByLabelText("基準日");
    fireEvent.change(birthInput, { target: { value: "2000-01-01" } });
    fireEvent.change(targetInput, { target: { value: "2026-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    // 結果セクション内に年齢テキストが表示されることを確認(結果のspanを確認)
    const resultSection = screen.getByRole("region", { name: "年齢計算結果" });
    expect(resultSection).toBeInTheDocument();
    expect(resultSection.textContent).toMatch(/26歳0ヶ月0日/);
  });

  // E-4: 変換ロジックの正確性
  test("calculates age correctly for known date", () => {
    render(<AgeCalculatorPage />);
    const birthInput = screen.getByLabelText("生年月日");
    const targetInput = screen.getByLabelText("基準日");
    fireEvent.change(birthInput, { target: { value: "1990-06-15" } });
    fireEvent.change(targetInput, { target: { value: "2026-06-05" } });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    // 35歳11ヶ月21日
    const resultSection = screen.getByRole("region", { name: "年齢計算結果" });
    expect(resultSection.textContent).toMatch(/35歳11ヶ月/);
  });

  // E-4: 和暦が表示される
  test("shows wareki for birth date", () => {
    render(<AgeCalculatorPage />);
    const birthInput = screen.getByLabelText("生年月日");
    const targetInput = screen.getByLabelText("基準日");
    fireEvent.change(birthInput, { target: { value: "2000-01-01" } });
    fireEvent.change(targetInput, { target: { value: "2026-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    expect(screen.getByText(/平成12年/)).toBeInTheDocument();
  });

  // E-4: 干支が表示される
  test("shows zodiac for birth year", () => {
    render(<AgeCalculatorPage />);
    const birthInput = screen.getByLabelText("生年月日");
    const targetInput = screen.getByLabelText("基準日");
    fireEvent.change(birthInput, { target: { value: "2000-01-01" } });
    fireEvent.change(targetInput, { target: { value: "2026-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    // 2000年 = 辰年
    expect(screen.getByText(/辰/)).toBeInTheDocument();
  });

  // E-4: 星座が表示される
  test("shows constellation for birth date", () => {
    render(<AgeCalculatorPage />);
    const birthInput = screen.getByLabelText("生年月日");
    const targetInput = screen.getByLabelText("基準日");
    fireEvent.change(birthInput, { target: { value: "2000-01-15" } });
    fireEvent.change(targetInput, { target: { value: "2026-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    // 1月15日 = 山羊座
    expect(screen.getByText(/山羊座/)).toBeInTheDocument();
  });

  // E-4: 通算日数が表示される
  test("shows total days", () => {
    render(<AgeCalculatorPage />);
    const birthInput = screen.getByLabelText("生年月日");
    const targetInput = screen.getByLabelText("基準日");
    fireEvent.change(birthInput, { target: { value: "2000-01-01" } });
    fireEvent.change(targetInput, { target: { value: "2026-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    expect(screen.getByText(/通算日数/)).toBeInTheDocument();
  });

  // E-2: 生年月日が未入力のままで計算するとエラーが表示される
  test("shows error when birth date is empty", () => {
    render(<AgeCalculatorPage />);
    // 生年月日を空のままにして計算
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    // エラーメッセージに「生年月日」を含む
    expect(alert.textContent).toMatch(/生年月日/);
  });

  // E-2: 生年月日 > 基準日のときエラーが表示される
  test("shows error when birth date is after target date", () => {
    render(<AgeCalculatorPage />);
    const birthInput = screen.getByLabelText("生年月日");
    const targetInput = screen.getByLabelText("基準日");
    fireEvent.change(birthInput, { target: { value: "2030-01-01" } });
    fireEvent.change(targetInput, { target: { value: "2000-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  // E-5: ARIA - role=status aria-live=polite の存在確認
  test("has role=status aria-live=polite for live region", () => {
    render(<AgeCalculatorPage />);
    const statusEl = screen.getByRole("status");
    expect(statusEl).toBeInTheDocument();
    expect(statusEl).toHaveAttribute("aria-live", "polite");
  });

  // E-5: C-3 - 計算後にライブリージョンに実テキストが入る
  test("live region contains summary text after calculation", () => {
    render(<AgeCalculatorPage />);
    const birthInput = screen.getByLabelText("生年月日");
    const targetInput = screen.getByLabelText("基準日");
    fireEvent.change(birthInput, { target: { value: "2000-01-01" } });
    fireEvent.change(targetInput, { target: { value: "2026-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    const statusEl = screen.getByRole("status");
    expect(statusEl.textContent).not.toBe("");
  });

  // E-6, E-7, E-8: コピーボタンなし (T-4b: age-calculator はコピーなし)
  test("no copy buttons (T-4b: age-calculator has no copy button)", () => {
    render(<AgeCalculatorPage />);
    // コピーボタンが存在しないことを確認
    expect(
      screen.queryByRole("button", { name: /コピー/ }),
    ).not.toBeInTheDocument();
  });

  // E-10: meta.name がページ内で参照可能か(AgeCalculatorPageは単独コンポーネントとしてテスト)
  test("renders the tool's input form with correct aria labels", () => {
    render(<AgeCalculatorPage />);
    expect(screen.getByLabelText("生年月日")).toBeInTheDocument();
    expect(screen.getByLabelText("基準日")).toBeInTheDocument();
  });

  // E-12: CSS トークン検証
  test("CSS does not use deprecated --color-* tokens", () => {
    const cssPath = resolve(__dirname, "../AgeCalculatorPage.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  test("CSS does not use --accent as background directly", () => {
    const cssPath = resolve(__dirname, "../AgeCalculatorPage.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/background(-color)?\s*:\s*var\(--accent\)/);
  });

  test("CSS does not use font-weight: 700", () => {
    const cssPath = resolve(__dirname, "../AgeCalculatorPage.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight\s*:\s*700/);
  });
});

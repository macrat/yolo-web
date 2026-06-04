import { describe, test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";
import DateCalculatorPage from "../DateCalculatorPage";

describe("DateCalculatorPage", () => {
  // E-1: 基本レンダリング
  test("renders without crashing", () => {
    render(<DateCalculatorPage />);
    expect(screen.getByLabelText("日付1")).toBeInTheDocument();
    expect(screen.getByLabelText("日付2")).toBeInTheDocument();
  });

  // E-1: 3セクションのタイトルが表示される
  test("renders all three section headings", () => {
    render(<DateCalculatorPage />);
    expect(screen.getByText("日付の差分")).toBeInTheDocument();
    expect(screen.getByText("日付の加算・減算")).toBeInTheDocument();
    expect(screen.getByText("和暦・西暦変換")).toBeInTheDocument();
  });

  // E-1: 各種ボタンが表示される
  test("renders all action buttons", () => {
    render(<DateCalculatorPage />);
    expect(
      screen.getByRole("button", { name: "差分を計算" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "加算" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "減算" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "西暦→和暦 変換" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "和暦→西暦 変換" }),
    ).toBeInTheDocument();
  });

  // E-3: 初期状態でエラーも結果も表示されない
  test("shows no error and no result on initial render", () => {
    render(<DateCalculatorPage />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    // 差分結果リージョンなし
    expect(
      screen.queryByRole("region", { name: "日付差分の結果" }),
    ).not.toBeInTheDocument();
    // 加減算結果リージョンなし
    expect(
      screen.queryByRole("region", { name: "加減算の結果" }),
    ).not.toBeInTheDocument();
    // 和暦変換結果リージョンなし
    expect(
      screen.queryByRole("region", { name: "和暦変換の結果" }),
    ).not.toBeInTheDocument();
  });

  // E-2: 日付差分の計算が正しく動作する
  test("calculates date difference when button is clicked", () => {
    render(<DateCalculatorPage />);
    const date1Input = screen.getByLabelText("日付1");
    const date2Input = screen.getByLabelText("日付2");
    fireEvent.change(date1Input, { target: { value: "2026-01-01" } });
    fireEvent.change(date2Input, { target: { value: "2026-01-15" } });
    fireEvent.click(screen.getByRole("button", { name: "差分を計算" }));
    // 差分結果が表示される
    const resultRegion = screen.getByRole("region", { name: "日付差分の結果" });
    expect(resultRegion).toBeInTheDocument();
    expect(resultRegion.textContent).toContain("14");
  });

  // E-4: 変換ロジックの正確性: 1年の差は365日
  test("correctly shows 365 days for one year difference", () => {
    render(<DateCalculatorPage />);
    const date1Input = screen.getByLabelText("日付1");
    const date2Input = screen.getByLabelText("日付2");
    fireEvent.change(date1Input, { target: { value: "2025-01-01" } });
    fireEvent.change(date2Input, { target: { value: "2026-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "差分を計算" }));
    const resultRegion = screen.getByRole("region", { name: "日付差分の結果" });
    expect(resultRegion.textContent).toContain("365");
  });

  // E-2: 日付加算が正しく動作する
  test("calculates date addition when plus button is clicked", () => {
    render(<DateCalculatorPage />);
    const baseDateInput = screen.getByLabelText("基準日");
    const daysInput = screen.getByLabelText("日数");
    fireEvent.change(baseDateInput, { target: { value: "2026-01-01" } });
    fireEvent.change(daysInput, { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "加算" }));
    const resultRegion = screen.getByRole("region", { name: "加減算の結果" });
    expect(resultRegion).toBeInTheDocument();
    expect(resultRegion.textContent).toContain("2026-01-11");
  });

  // E-2: 日付減算が正しく動作する
  test("calculates date subtraction when minus button is clicked", () => {
    render(<DateCalculatorPage />);
    const baseDateInput = screen.getByLabelText("基準日");
    const daysInput = screen.getByLabelText("日数");
    fireEvent.change(baseDateInput, { target: { value: "2026-01-15" } });
    fireEvent.change(daysInput, { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: "減算" }));
    const resultRegion = screen.getByRole("region", { name: "加減算の結果" });
    expect(resultRegion.textContent).toContain("2026-01-10");
  });

  // E-2: 西暦→和暦変換が正しく動作する
  test("converts western date to wareki", () => {
    render(<DateCalculatorPage />);
    const warekiInput = screen.getByLabelText("西暦→和暦 日付入力");
    fireEvent.change(warekiInput, { target: { value: "2026-02-14" } });
    fireEvent.click(screen.getByRole("button", { name: "西暦→和暦 変換" }));
    const resultRegion = screen.getByRole("region", { name: "和暦変換の結果" });
    expect(resultRegion).toBeInTheDocument();
    expect(resultRegion.textContent).toContain("令和");
  });

  // E-2: 和暦→西暦変換が正しく動作する
  test("converts wareki to western date", () => {
    render(<DateCalculatorPage />);
    // 元号セレクトは初期値「令和」
    const eraYearInput = screen.getByLabelText("元号年");
    const monthInput = screen.getByLabelText("月");
    const dayInput = screen.getByLabelText("日");
    fireEvent.change(eraYearInput, { target: { value: "8" } });
    fireEvent.change(monthInput, { target: { value: "2" } });
    fireEvent.change(dayInput, { target: { value: "14" } });
    fireEvent.click(screen.getByRole("button", { name: "和暦→西暦 変換" }));
    const resultRegion = screen.getByRole("region", { name: "西暦変換の結果" });
    expect(resultRegion).toBeInTheDocument();
    expect(resultRegion.textContent).toContain("2026");
  });

  // E-4: 和暦変換エラー: 範囲外の日付
  test("shows error for out-of-range wareki conversion", () => {
    render(<DateCalculatorPage />);
    // 昭和を選択して64年5月1日は平成になるのでエラー
    const eraSelect = screen.getByLabelText("元号");
    fireEvent.change(eraSelect, { target: { value: "昭和" } });
    const eraYearInput = screen.getByLabelText("元号年");
    const monthInput = screen.getByLabelText("月");
    const dayInput = screen.getByLabelText("日");
    fireEvent.change(eraYearInput, { target: { value: "64" } });
    fireEvent.change(monthInput, { target: { value: "1" } });
    fireEvent.change(dayInput, { target: { value: "8" } });
    fireEvent.click(screen.getByRole("button", { name: "和暦→西暦 変換" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  // E-5: ARIA — live regionが存在する
  test("has role=status aria-live=polite live region", () => {
    render(<DateCalculatorPage />);
    const liveRegions = document.querySelectorAll('[role="status"]');
    // 少なくとも1つのlive regionが存在する
    expect(liveRegions.length).toBeGreaterThan(0);
    const hasPolite = Array.from(liveRegions).some(
      (el) => el.getAttribute("aria-live") === "polite",
    );
    expect(hasPolite).toBe(true);
  });

  // E-5: ARIA — 差分結果セクションにrole=regionがある
  test("has role=region on diff result after calculation", () => {
    render(<DateCalculatorPage />);
    const date1Input = screen.getByLabelText("日付1");
    const date2Input = screen.getByLabelText("日付2");
    fireEvent.change(date1Input, { target: { value: "2026-01-01" } });
    fireEvent.change(date2Input, { target: { value: "2026-01-15" } });
    fireEvent.click(screen.getByRole("button", { name: "差分を計算" }));
    expect(
      screen.getByRole("region", { name: "日付差分の結果" }),
    ).toBeInTheDocument();
  });

  // E-6: コピーボタンなし（T-4b: date-calculatorはコピーなし）
  test("does not render any copy button", () => {
    render(<DateCalculatorPage />);
    const buttons = screen.getAllByRole("button");
    const copyButton = buttons.find(
      (btn) =>
        btn.textContent?.includes("コピー") ||
        btn.getAttribute("aria-label")?.includes("コピー"),
    );
    expect(copyButton).toBeUndefined();
  });

  // E-10: meta由来の表示確認（componentは直接meta情報を持たないが、ページとして組み込まれることを確認）
  test("renders date input fields for all three sections", () => {
    render(<DateCalculatorPage />);
    // 差分セクション: 2つのdate input
    expect(screen.getByLabelText("日付1")).toBeInTheDocument();
    expect(screen.getByLabelText("日付2")).toBeInTheDocument();
    // 加減算セクション: 1つのdate input
    expect(screen.getByLabelText("基準日")).toBeInTheDocument();
    // 和暦セクション: 1つのdate input
    expect(screen.getByLabelText("西暦→和暦 日付入力")).toBeInTheDocument();
  });

  // E-12: CSSトークン検証 (readFileSync パターン)
  test("CSS does not use old --color-* tokens", () => {
    const cssPath = resolve(__dirname, "../DateCalculatorPage.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  test("CSS does not use --accent directly as fill/bg", () => {
    const cssPath = resolve(__dirname, "../DateCalculatorPage.module.css");
    const css = readFileSync(cssPath, "utf-8");
    // background/background-colorに--accentを直塗りしていない
    expect(css).not.toMatch(/background(?:-color)?:\s*var\(--accent\)/);
  });

  test("CSS does not use font-weight: 700", () => {
    const cssPath = resolve(__dirname, "../DateCalculatorPage.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight:\s*700/);
  });
});

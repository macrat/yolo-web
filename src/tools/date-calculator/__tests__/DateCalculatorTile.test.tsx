import { describe, test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";
import DateCalculatorTile from "../DateCalculatorTile";

// ------------------------------------------------------------
// DateCalculatorTile テスト
// cycle-228 T-21: DateCalculatorPage.test.tsx の振る舞いを移植・拡張
//
// テスト方針:
// - variant="full" は3セクション全表示（diff/add/wareki）
// - variant="diff" は差分セクションのみ
// - variant="add" は加算・減算セクションのみ
// - variant="wareki" は和暦変換セクションのみ
// - 複数インスタンスで DOM id 重複ゼロ
// - CSS トークン検証（readFileSync パターン）
// ------------------------------------------------------------

describe("DateCalculatorTile", () => {
  // ----------------------------------------------------------
  // variant="full" 基本レンダリング
  // ----------------------------------------------------------
  describe("variant=full (default)", () => {
    test("renders without crashing", () => {
      render(<DateCalculatorTile />);
      expect(screen.getByLabelText("日付1")).toBeInTheDocument();
      expect(screen.getByLabelText("日付2")).toBeInTheDocument();
    });

    test("renders all three section headings", () => {
      render(<DateCalculatorTile variant="full" />);
      expect(screen.getByText("日付の差分")).toBeInTheDocument();
      expect(screen.getByText("日付の加算・減算")).toBeInTheDocument();
      expect(screen.getByText("和暦・西暦変換")).toBeInTheDocument();
    });

    test("renders all action buttons", () => {
      render(<DateCalculatorTile variant="full" />);
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

    test("shows no error and no result on initial render", () => {
      render(<DateCalculatorTile />);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("region", { name: "日付差分の結果" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("region", { name: "加減算の結果" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("region", { name: "和暦変換の結果" }),
      ).not.toBeInTheDocument();
    });

    test("calculates date difference when button is clicked", () => {
      render(<DateCalculatorTile />);
      fireEvent.change(screen.getByLabelText("日付1"), {
        target: { value: "2026-01-01" },
      });
      fireEvent.change(screen.getByLabelText("日付2"), {
        target: { value: "2026-01-15" },
      });
      fireEvent.click(screen.getByRole("button", { name: "差分を計算" }));
      const resultRegion = screen.getByRole("region", {
        name: "日付差分の結果",
      });
      expect(resultRegion).toBeInTheDocument();
      expect(resultRegion.textContent).toContain("14");
    });

    test("correctly shows 365 days for one year difference", () => {
      render(<DateCalculatorTile />);
      fireEvent.change(screen.getByLabelText("日付1"), {
        target: { value: "2025-01-01" },
      });
      fireEvent.change(screen.getByLabelText("日付2"), {
        target: { value: "2026-01-01" },
      });
      fireEvent.click(screen.getByRole("button", { name: "差分を計算" }));
      const resultRegion = screen.getByRole("region", {
        name: "日付差分の結果",
      });
      expect(resultRegion.textContent).toContain("365");
    });

    test("calculates date addition when plus button is clicked", () => {
      render(<DateCalculatorTile />);
      fireEvent.change(screen.getByLabelText("基準日"), {
        target: { value: "2026-01-01" },
      });
      fireEvent.change(screen.getByLabelText("日数"), {
        target: { value: "10" },
      });
      fireEvent.click(screen.getByRole("button", { name: "加算" }));
      const resultRegion = screen.getByRole("region", {
        name: "加減算の結果",
      });
      expect(resultRegion).toBeInTheDocument();
      expect(resultRegion.textContent).toContain("2026-01-11");
    });

    test("calculates date subtraction when minus button is clicked", () => {
      render(<DateCalculatorTile />);
      fireEvent.change(screen.getByLabelText("基準日"), {
        target: { value: "2026-01-15" },
      });
      fireEvent.change(screen.getByLabelText("日数"), {
        target: { value: "5" },
      });
      fireEvent.click(screen.getByRole("button", { name: "減算" }));
      const resultRegion = screen.getByRole("region", {
        name: "加減算の結果",
      });
      expect(resultRegion.textContent).toContain("2026-01-10");
    });

    test("converts western date to wareki", () => {
      render(<DateCalculatorTile />);
      fireEvent.change(screen.getByLabelText("西暦→和暦 日付入力"), {
        target: { value: "2026-02-14" },
      });
      fireEvent.click(screen.getByRole("button", { name: "西暦→和暦 変換" }));
      const resultRegion = screen.getByRole("region", {
        name: "和暦変換の結果",
      });
      expect(resultRegion).toBeInTheDocument();
      expect(resultRegion.textContent).toContain("令和");
    });

    test("converts wareki to western date", () => {
      render(<DateCalculatorTile />);
      // 元号セレクトは初期値「令和」
      fireEvent.change(screen.getByLabelText("元号年"), {
        target: { value: "8" },
      });
      fireEvent.change(screen.getByLabelText("月"), {
        target: { value: "2" },
      });
      fireEvent.change(screen.getByLabelText("日"), {
        target: { value: "14" },
      });
      fireEvent.click(screen.getByRole("button", { name: "和暦→西暦 変換" }));
      const resultRegion = screen.getByRole("region", {
        name: "西暦変換の結果",
      });
      expect(resultRegion).toBeInTheDocument();
      expect(resultRegion.textContent).toContain("2026");
    });

    test("shows error for out-of-range wareki conversion", () => {
      render(<DateCalculatorTile />);
      // 昭和を選択して64年1月8日は平成になるのでエラー
      fireEvent.change(screen.getByLabelText("元号"), {
        target: { value: "昭和" },
      });
      fireEvent.change(screen.getByLabelText("元号年"), {
        target: { value: "64" },
      });
      fireEvent.change(screen.getByLabelText("月"), {
        target: { value: "1" },
      });
      fireEvent.change(screen.getByLabelText("日"), {
        target: { value: "8" },
      });
      fireEvent.click(screen.getByRole("button", { name: "和暦→西暦 変換" }));
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    test("has role=status aria-live=polite live region", () => {
      render(<DateCalculatorTile />);
      const liveRegions = document.querySelectorAll('[role="status"]');
      expect(liveRegions.length).toBeGreaterThan(0);
      const hasPolite = Array.from(liveRegions).some(
        (el) => el.getAttribute("aria-live") === "polite",
      );
      expect(hasPolite).toBe(true);
    });

    test("has role=region on diff result after calculation", () => {
      render(<DateCalculatorTile />);
      fireEvent.change(screen.getByLabelText("日付1"), {
        target: { value: "2026-01-01" },
      });
      fireEvent.change(screen.getByLabelText("日付2"), {
        target: { value: "2026-01-15" },
      });
      fireEvent.click(screen.getByRole("button", { name: "差分を計算" }));
      expect(
        screen.getByRole("region", { name: "日付差分の結果" }),
      ).toBeInTheDocument();
    });

    test("does not render any copy button", () => {
      render(<DateCalculatorTile />);
      const buttons = screen.getAllByRole("button");
      const copyButton = buttons.find(
        (btn) =>
          btn.textContent?.includes("コピー") ||
          btn.getAttribute("aria-label")?.includes("コピー"),
      );
      expect(copyButton).toBeUndefined();
    });

    test("renders date input fields for all three sections", () => {
      render(<DateCalculatorTile />);
      expect(screen.getByLabelText("日付1")).toBeInTheDocument();
      expect(screen.getByLabelText("日付2")).toBeInTheDocument();
      expect(screen.getByLabelText("基準日")).toBeInTheDocument();
      expect(screen.getByLabelText("西暦→和暦 日付入力")).toBeInTheDocument();
    });

    // G-5: 代表入力で結果に明らかな誤りがないか
    test("shows correct result for 令和6年1月1日 → 2024-01-01", () => {
      render(<DateCalculatorTile />);
      // 令和6年 = 令和開始2019 + 6 - 1 = 2024年
      fireEvent.change(screen.getByLabelText("元号"), {
        target: { value: "令和" },
      });
      fireEvent.change(screen.getByLabelText("元号年"), {
        target: { value: "6" },
      });
      fireEvent.change(screen.getByLabelText("月"), {
        target: { value: "1" },
      });
      fireEvent.change(screen.getByLabelText("日"), {
        target: { value: "1" },
      });
      fireEvent.click(screen.getByRole("button", { name: "和暦→西暦 変換" }));
      const resultRegion = screen.getByRole("region", {
        name: "西暦変換の結果",
      });
      expect(resultRegion.textContent).toContain("2024");
    });
  });

  // ----------------------------------------------------------
  // variant="diff" — 差分セクションのみ
  // ----------------------------------------------------------
  describe("variant=diff", () => {
    test("renders only diff section controls", () => {
      render(<DateCalculatorTile variant="diff" />);
      expect(screen.getByLabelText("日付1")).toBeInTheDocument();
      expect(screen.getByLabelText("日付2")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "差分を計算" }),
      ).toBeInTheDocument();
      // 他のセクションのボタンは表示されない
      expect(
        screen.queryByRole("button", { name: "加算" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "西暦→和暦 変換" }),
      ).not.toBeInTheDocument();
    });

    test("calculates date difference correctly", () => {
      render(<DateCalculatorTile variant="diff" />);
      fireEvent.change(screen.getByLabelText("日付1"), {
        target: { value: "2024-01-01" },
      });
      fireEvent.change(screen.getByLabelText("日付2"), {
        target: { value: "2024-12-31" },
      });
      fireEvent.click(screen.getByRole("button", { name: "差分を計算" }));
      const resultRegion = screen.getByRole("region", {
        name: "日付差分の結果",
      });
      expect(resultRegion.textContent).toContain("365");
    });
  });

  // ----------------------------------------------------------
  // variant="add" — 加算・減算セクションのみ
  // ----------------------------------------------------------
  describe("variant=add", () => {
    test("renders only add section controls", () => {
      render(<DateCalculatorTile variant="add" />);
      expect(screen.getByLabelText("基準日")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "加算" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "減算" })).toBeInTheDocument();
      // 他のセクションのボタンは表示されない
      expect(
        screen.queryByRole("button", { name: "差分を計算" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "西暦→和暦 変換" }),
      ).not.toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------
  // variant="wareki" — 和暦変換セクションのみ
  // ----------------------------------------------------------
  describe("variant=wareki", () => {
    test("renders only wareki section controls", () => {
      render(<DateCalculatorTile variant="wareki" />);
      expect(
        screen.getByRole("button", { name: "西暦→和暦 変換" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "和暦→西暦 変換" }),
      ).toBeInTheDocument();
      // 他のセクションのボタンは表示されない
      expect(
        screen.queryByRole("button", { name: "差分を計算" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "加算" }),
      ).not.toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------
  // 複数インスタンス: id 重複ゼロ
  // ----------------------------------------------------------
  test("multiple instances have no duplicate DOM ids", () => {
    render(
      <div>
        <DateCalculatorTile variant="full" />
        <DateCalculatorTile variant="full" />
      </div>,
    );
    const allIds = Array.from(document.querySelectorAll("[id]")).map((el) =>
      el.getAttribute("id"),
    );
    const uniqueIds = new Set(allIds);
    expect(allIds.length).toBe(uniqueIds.size);
  });

  // ----------------------------------------------------------
  // A-1: ルート要素が Panel（section/article/div 等）か
  // ----------------------------------------------------------
  test("root element is a Panel (section tag by default)", () => {
    const { container } = render(<DateCalculatorTile />);
    // Panel のデフォルトは <section>
    expect(container.firstChild?.nodeName).toBe("SECTION");
  });

  test("accepts as prop and renders with specified tag", () => {
    const { container } = render(<DateCalculatorTile as="div" />);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  // ----------------------------------------------------------
  // CSS トークン検証（readFileSync パターン）
  // ----------------------------------------------------------
  test("CSS does not use old --color-* tokens", () => {
    const cssPath = resolve(__dirname, "../DateCalculatorTile.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  test("CSS does not use --accent directly as fill/bg", () => {
    const cssPath = resolve(__dirname, "../DateCalculatorTile.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/background(?:-color)?:\s*var\(--accent\)/);
  });

  test("CSS does not use font-weight: 700", () => {
    const cssPath = resolve(__dirname, "../DateCalculatorTile.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight:\s*700/);
  });
});

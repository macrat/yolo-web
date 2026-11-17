import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";
import { revealResult } from "@/lib/reveal";
import AgeCalculatorTile from "../AgeCalculatorTile";

vi.mock("@/lib/reveal", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/reveal")>()),
  revealResult: vi.fn(),
}));

function calculate(birth: string, target: string) {
  fireEvent.change(screen.getByLabelText(/生年月日/), {
    target: { value: birth },
  });
  fireEvent.change(screen.getByLabelText(/基準日/), {
    target: { value: target },
  });
  fireEvent.click(screen.getByRole("button", { name: "計算" }));
}

const resultBox = () =>
  screen.getByRole("region", { name: "年齢の計算の結果" });

describe("AgeCalculatorTile", () => {
  beforeEach(() => {
    vi.mocked(revealResult).mockClear();
  });

  // 基本レンダリング: 生年月日・基準日の入力欄が表示される
  test("renders birth date and target date inputs", () => {
    render(<AgeCalculatorTile />);
    expect(screen.getByLabelText(/生年月日/)).toBeInTheDocument();
    expect(screen.getByLabelText(/基準日/)).toBeInTheDocument();
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
    const birthInput = screen.getByLabelText(/生年月日/);
    const targetInput = screen.getByLabelText(/基準日/);
    fireEvent.change(birthInput, { target: { value: "2000-01-01" } });
    fireEvent.change(targetInput, { target: { value: "2026-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    const resultSection = screen.getByRole("region", {
      name: "年齢の計算の結果",
    });
    expect(resultSection).toBeInTheDocument();
    expect(resultSection.textContent).toMatch(/26歳0ヶ月0日/);
  });

  // 入力欄は結果のボックスの外にあり、結果は表で並ぶ
  test("puts only the result in the result box, as a table", () => {
    render(<AgeCalculatorTile />);
    fireEvent.change(screen.getByLabelText(/生年月日/), {
      target: { value: "2000-01-01" },
    });
    fireEvent.change(screen.getByLabelText(/基準日/), {
      target: { value: "2026-01-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    const box = screen.getByRole("region", { name: "年齢の計算の結果" });
    expect(box).not.toContainElement(screen.getByLabelText(/生年月日/));
    expect(box).not.toContainElement(
      screen.getByRole("button", { name: "計算" }),
    );
    const table = within(box).getByRole("table");
    const headers = within(table)
      .getAllByRole("rowheader")
      .map((th) => th.textContent);
    expect(headers).toEqual([
      "年齢",
      "通算日数",
      "通算月数",
      "生まれ年（和暦）",
      "干支",
      "星座",
    ]);
    expect(within(table).getByRole("cell", { name: "9,497日" })).toBeTruthy();
  });

  // 見出しのセルは文節の切れ目にだけ折り所を持つ
  test("label cell breaks only between phrases", () => {
    render(<AgeCalculatorTile />);
    fireEvent.change(screen.getByLabelText(/生年月日/), {
      target: { value: "2000-01-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    const th = screen.getByRole("rowheader", { name: "生まれ年（和暦）" });
    expect(th.innerHTML).toBe("生まれ年<wbr>（和暦）");
  });

  // 値のセルは組（数と単位・元号と年・干支と読み）の切れ目と桁区切りの位置にだけ折り所を持つ
  test("value cells break only between number+unit groups", () => {
    render(<AgeCalculatorTile />);
    fireEvent.change(screen.getByLabelText(/生年月日/), {
      target: { value: "1990-06-15" },
    });
    fireEvent.change(screen.getByLabelText(/基準日/), {
      target: { value: "2026-09-27" },
    });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    const valueOf = (label: string) =>
      screen.getByRole("rowheader", { name: label }).nextElementSibling!
        .innerHTML;
    expect(valueOf("年齢")).toBe("36歳<wbr>3ヶ月<wbr>12日");
    expect(valueOf("通算日数")).toBe("13,<wbr>253日");
    expect(valueOf("通算月数")).toBe("435ヶ月");
    expect(valueOf("生まれ年（和暦）")).toBe("平成<wbr>2年");
    expect(valueOf("干支")).toBe("午<wbr>（うま）");
  });

  // ブラウザの言語が日本語でなくても、桁区切りは「,」で、そこに折り所を置く
  test("groups digits the Japanese way whatever the browser language is", () => {
    const original = Number.prototype.toLocaleString;
    const spy = vi
      .spyOn(Number.prototype, "toLocaleString")
      .mockImplementation(function (
        this: number,
        locales?: Intl.LocalesArgument,
        options?: Intl.NumberFormatOptions,
      ) {
        return original.call(this, locales ?? "de-DE", options);
      });
    try {
      render(<AgeCalculatorTile />);
      calculate("1900-01-01", "2026-09-27");
      const valueOf = (label: string) =>
        screen.getByRole("rowheader", { name: label }).nextElementSibling!
          .innerHTML;
      expect(valueOf("通算日数")).toBe("46,<wbr>290日");
      expect(valueOf("通算月数")).toBe("1,<wbr>520ヶ月");
    } finally {
      spy.mockRestore();
    }
  });

  // 変換ロジックの正確性
  test("calculates age correctly for known date", () => {
    render(<AgeCalculatorTile />);
    const birthInput = screen.getByLabelText(/生年月日/);
    const targetInput = screen.getByLabelText(/基準日/);
    fireEvent.change(birthInput, { target: { value: "1990-06-15" } });
    fireEvent.change(targetInput, { target: { value: "2026-06-05" } });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    const resultSection = screen.getByRole("region", {
      name: "年齢の計算の結果",
    });
    expect(resultSection.textContent).toMatch(/35歳11ヶ月/);
  });

  // 和暦が表示される
  test("shows wareki for birth date", () => {
    render(<AgeCalculatorTile />);
    const birthInput = screen.getByLabelText(/生年月日/);
    const targetInput = screen.getByLabelText(/基準日/);
    fireEvent.change(birthInput, { target: { value: "2000-01-01" } });
    fireEvent.change(targetInput, { target: { value: "2026-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    expect(screen.getByText(/平成12年/)).toBeInTheDocument();
  });

  // 干支が読み仮名付きで表示される
  test("shows zodiac with reading for birth year", () => {
    render(<AgeCalculatorTile />);
    const birthInput = screen.getByLabelText(/生年月日/);
    const targetInput = screen.getByLabelText(/基準日/);
    fireEvent.change(birthInput, { target: { value: "2000-01-01" } });
    fireEvent.change(targetInput, { target: { value: "2026-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    // 2000年 = 辰（たつ）年
    expect(screen.getByText(/辰（たつ）/)).toBeInTheDocument();
  });

  // 干支の読み仮名が別の年でも正しく表示される（午年）
  test("shows zodiac with reading 午（うま）for 2026", () => {
    render(<AgeCalculatorTile />);
    const birthInput = screen.getByLabelText(/生年月日/);
    const targetInput = screen.getByLabelText(/基準日/);
    fireEvent.change(birthInput, { target: { value: "2026-01-01" } });
    fireEvent.change(targetInput, { target: { value: "2030-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    // 2026年 = 午（うま）年
    expect(screen.getByText(/午（うま）/)).toBeInTheDocument();
  });

  // 星座が表示される
  test("shows constellation for birth date", () => {
    render(<AgeCalculatorTile />);
    const birthInput = screen.getByLabelText(/生年月日/);
    const targetInput = screen.getByLabelText(/基準日/);
    fireEvent.change(birthInput, { target: { value: "2000-01-15" } });
    fireEvent.change(targetInput, { target: { value: "2026-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    // 1月15日 = 山羊座
    expect(screen.getByText(/山羊座/)).toBeInTheDocument();
  });

  // 通算日数が表示される
  test("shows total days", () => {
    render(<AgeCalculatorTile />);
    const birthInput = screen.getByLabelText(/生年月日/);
    const targetInput = screen.getByLabelText(/基準日/);
    fireEvent.change(birthInput, { target: { value: "2000-01-01" } });
    fireEvent.change(targetInput, { target: { value: "2026-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    expect(screen.getByText(/通算日数/)).toBeInTheDocument();
  });

  // 通算月数が表示される
  test("shows total months", () => {
    render(<AgeCalculatorTile />);
    const birthInput = screen.getByLabelText(/生年月日/);
    const targetInput = screen.getByLabelText(/基準日/);
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
    const birthInput = screen.getByLabelText(/生年月日/);
    const targetInput = screen.getByLabelText(/基準日/);
    fireEvent.change(birthInput, { target: { value: "2030-01-01" } });
    fireEvent.change(targetInput, { target: { value: "2000-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toBe(
      "生年月日には、基準日と同じ日か、それより前の日付を入力してください",
    );
    expect(birthInput).toHaveAttribute("aria-invalid", "true");
    expect(birthInput.getAttribute("aria-describedby")).toBe(alert.id);
    expect(targetInput).not.toHaveAttribute("aria-invalid");
  });

  // 基準日が空のときは基準日の欄にエラーを出す
  test("shows error on the target date field when it is empty", () => {
    render(<AgeCalculatorTile />);
    const targetInput = screen.getByLabelText(/基準日/);
    fireEvent.change(screen.getByLabelText(/生年月日/), {
      target: { value: "2000-01-01" },
    });
    fireEvent.change(targetInput, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    expect(targetInput).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert").textContent).toMatch(/基準日/);
  });

  // 必須は文字で示す
  test("marks both inputs as required in text", () => {
    render(<AgeCalculatorTile />);
    expect(screen.getByText("生年月日（必須）")).toBeInTheDocument();
    expect(screen.getByText("基準日（必須）")).toBeInTheDocument();
  });

  // 同じ日なら 0歳0ヶ月0日 でエラーにしない（エラーの文と同じ振る舞い）
  test("accepts the same day for birth and target dates", () => {
    render(<AgeCalculatorTile />);
    calculate("2026-01-01", "2026-01-01");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(resultBox().textContent).toMatch(/0歳0ヶ月0日/);
  });

  // 計算後にライブリージョンが年齢を知らせる
  test("announces the age after calculation", () => {
    render(<AgeCalculatorTile />);
    calculate("1990-06-15", "2026-09-27");
    expect(screen.getByRole("status").textContent).toBe(
      "年齢は36歳3ヶ月12日です",
    );
  });

  // 同じ入力で計算し直しても、知らせの中身を作り直して読ませる
  test("re-creates the announcement when the same input is recalculated", () => {
    render(<AgeCalculatorTile />);
    calculate("1990-06-15", "2026-09-27");
    const first = screen.getByRole("status").firstElementChild;
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    const second = screen.getByRole("status").firstElementChild;
    expect(second?.textContent).toBe("年齢は36歳3ヶ月12日です");
    expect(second).not.toBe(first);
  });

  // 計算し直すと結果のボックスを作り直し、登場の動きを持たせる
  test("recalculating re-creates the result box with the appear animation", () => {
    render(<AgeCalculatorTile />);
    calculate("1990-06-15", "2026-09-27");
    const first = resultBox();
    expect(first.className).toMatch(/appears/);
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    const second = resultBox();
    expect(second).not.toBe(first);
    expect(first).not.toBeInTheDocument();
    expect(second.className).toMatch(/appears/);
  });

  // エラーになると前の結果と知らせを消す
  test("clears the previous result after an error", () => {
    render(<AgeCalculatorTile />);
    calculate("1990-06-15", "2026-09-27");
    expect(resultBox()).toBeInTheDocument();
    calculate("2030-01-01", "2026-09-27");
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "年齢の計算の結果" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("status").textContent).toBe("");
  });

  // 計算するたびに、計算のボタンの行と結果のボックスを渡して結果を画面に入れる
  test("reveals the result box after each calculation", () => {
    render(<AgeCalculatorTile />);
    calculate("1990-06-15", "2026-09-27");
    expect(revealResult).toHaveBeenCalledTimes(1);
    const [operations, result] = vi.mocked(revealResult).mock.calls[0];
    expect(operations).toContainElement(
      screen.getByRole("button", { name: "計算" }),
    );
    expect(result).toBe(resultBox());
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    expect(revealResult).toHaveBeenCalledTimes(2);
    expect(vi.mocked(revealResult).mock.calls[1][1]).toBe(resultBox());
  });

  // エラーのときは送らない
  test("does not reveal anything on an error", () => {
    render(<AgeCalculatorTile />);
    fireEvent.click(screen.getByRole("button", { name: "計算" }));
    expect(revealResult).not.toHaveBeenCalled();
  });

  // ライブリージョンは画面に出さず、スクリーンリーダーにだけ読ませる
  test("live region is visually hidden", () => {
    render(<AgeCalculatorTile />);
    expect(screen.getByRole("status").className).toMatch(/visually-hidden/);
  });

  // コピーボタンなし（age-calculator はコピー不要）
  test("no copy buttons", () => {
    render(<AgeCalculatorTile />);
    expect(
      screen.queryByRole("button", { name: /コピー/ }),
    ).not.toBeInTheDocument();
  });

  // CSS のトークンと組み方
  test("CSS does not reference --color-* tokens", () => {
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

  test("CSS does not use monospace, --paper-2 rows, weight 600 or --ink card borders", () => {
    const cssPath = resolve(__dirname, "../AgeCalculatorTile.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/--font-mono/);
    expect(css).not.toMatch(/--paper-2/);
    expect(css).not.toMatch(/font-weight\s*:\s*600/);
    expect(css).not.toMatch(/border[^;]*var\(--ink\)/);
  });

  test("CSS breaks cells only at wbr and lines up digits in value cells", () => {
    const cssPath = resolve(__dirname, "../AgeCalculatorTile.module.css");
    const css = readFileSync(cssPath, "utf-8");
    const cellRule =
      css.match(/\.resultTable th,\s*\.resultTable td\s*\{([^}]*)\}/)?.[1] ??
      "";
    expect(cellRule).toMatch(/word-break\s*:\s*keep-all/);
    expect(css).toMatch(
      /\.resultTable td\s*\{[^}]*font-variant-numeric\s*:\s*tabular-nums/,
    );
    expect(css).not.toMatch(/white-space\s*:\s*nowrap/);
  });
});

/**
 * BmiCalculatorPage 回帰テスト
 *
 * E-1: 基本レンダリング
 * E-2: 入力→結果更新
 * E-3: 空入力時の挙動
 * E-4: 変換ロジックの正確性（UI経由）
 * E-5: ARIA 属性
 * E-6: コピー文言変化 → N/A（T-4b: bmi-calculator はコピーなし）
 * E-7: コピー disabled 状態 → N/A（コピーボタンなし）
 * E-8: clipboard 不在時の silent fail → N/A（コピーボタンなし）
 * E-9: 詳細リンク → N/A（bmi-calculator に詳細リンクなし）
 * E-10: meta 由来の表示 → N/A（page.tsx で ToolPageLayout 経由）
 * E-11: 既存 logic.ts テストが PASS し続けるか（logic.test.ts が独立して存在）
 * E-12: CSS トークン検証（readFileSync パターン）
 */

import { describe, test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";
import BmiCalculatorPage from "../BmiCalculatorPage";

// ---- E-1: 基本レンダリング ----
describe("E-1: 基本レンダリング", () => {
  test("コンポーネントが正常にレンダリングされる", () => {
    render(<BmiCalculatorPage />);
    expect(screen.getByLabelText("身長（cm）")).toBeInTheDocument();
    expect(screen.getByLabelText("体重（kg）")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "計算する" }),
    ).toBeInTheDocument();
  });

  test("初期状態では結果が表示されない", () => {
    render(<BmiCalculatorPage />);
    expect(screen.queryByText("BMI")).not.toBeInTheDocument();
    expect(screen.queryByText("判定")).not.toBeInTheDocument();
  });

  test("免責事項が表示される", () => {
    render(<BmiCalculatorPage />);
    expect(screen.getByText(/この結果は参考値です/)).toBeInTheDocument();
  });
});

// ---- E-2: 入力→結果更新 ----
describe("E-2: 入力→結果更新", () => {
  test("身長・体重を入力して計算すると結果が表示される", () => {
    render(<BmiCalculatorPage />);
    fireEvent.change(screen.getByLabelText("身長（cm）"), {
      target: { value: "170" },
    });
    fireEvent.change(screen.getByLabelText("体重（kg）"), {
      target: { value: "65" },
    });
    fireEvent.click(screen.getByRole("button", { name: "計算する" }));
    // BMI値が表示される
    expect(screen.getByText("22.5")).toBeInTheDocument();
    // 判定が表示される
    expect(screen.getByText("普通体重")).toBeInTheDocument();
  });

  test("別の値を入力して再計算すると結果が更新される", () => {
    render(<BmiCalculatorPage />);
    // 1回目の計算
    fireEvent.change(screen.getByLabelText("身長（cm）"), {
      target: { value: "170" },
    });
    fireEvent.change(screen.getByLabelText("体重（kg）"), {
      target: { value: "65" },
    });
    fireEvent.click(screen.getByRole("button", { name: "計算する" }));
    expect(screen.getByText("22.5")).toBeInTheDocument();

    // 2回目の計算（体重を変更）
    fireEvent.change(screen.getByLabelText("体重（kg）"), {
      target: { value: "90" },
    });
    fireEvent.click(screen.getByRole("button", { name: "計算する" }));
    // 新しいBMI値が表示される: 90 / 1.7^2 = 31.1...
    expect(screen.getByText("31.1")).toBeInTheDocument();
  });
});

// ---- E-3: 空入力時の挙動 ----
describe("E-3: 空入力時の挙動", () => {
  test("何も入力せず計算するとエラーメッセージが表示される", () => {
    render(<BmiCalculatorPage />);
    fireEvent.click(screen.getByRole("button", { name: "計算する" }));
    expect(
      screen.getByText("身長と体重に正の数値を入力してください"),
    ).toBeInTheDocument();
  });

  test("身長のみ入力して計算するとエラーメッセージが表示される", () => {
    render(<BmiCalculatorPage />);
    fireEvent.change(screen.getByLabelText("身長（cm）"), {
      target: { value: "170" },
    });
    fireEvent.click(screen.getByRole("button", { name: "計算する" }));
    expect(
      screen.getByText("身長と体重に正の数値を入力してください"),
    ).toBeInTheDocument();
  });

  test("初期状態でエラーメッセージが表示されない", () => {
    render(<BmiCalculatorPage />);
    // role="alert" の要素が存在しないことを確認
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("空入力状態で結果欄は非表示", () => {
    render(<BmiCalculatorPage />);
    // 計算前は計算結果セクションが表示されない
    expect(screen.queryByText("計算結果")).not.toBeInTheDocument();
  });
});

// ---- E-4: 変換ロジックの正確性（UI経由） ----
describe("E-4: 変換ロジックの正確性", () => {
  function calculate(height: string, weight: string) {
    render(<BmiCalculatorPage />);
    fireEvent.change(screen.getByLabelText("身長（cm）"), {
      target: { value: height },
    });
    fireEvent.change(screen.getByLabelText("体重（kg）"), {
      target: { value: weight },
    });
    fireEvent.click(screen.getByRole("button", { name: "計算する" }));
  }

  test("170cm 65kg → BMI 22.5 普通体重", () => {
    calculate("170", "65");
    expect(screen.getByText("22.5")).toBeInTheDocument();
    expect(screen.getByText("普通体重")).toBeInTheDocument();
  });

  test("170cm 50kg → BMI 17.3 低体重（やせ）", () => {
    calculate("170", "50");
    expect(screen.getByText("17.3")).toBeInTheDocument();
    expect(screen.getByText("低体重（やせ）")).toBeInTheDocument();
  });

  test("170cm 80kg → BMI 27.7 肥満（1度）", () => {
    calculate("170", "80");
    expect(screen.getByText("27.7")).toBeInTheDocument();
    expect(screen.getByText("肥満（1度）")).toBeInTheDocument();
  });

  test("適正体重（BMI 22）が表示される: 170cm → 63.6kg", () => {
    calculate("170", "65");
    expect(screen.getByText(/63\.6/)).toBeInTheDocument();
  });

  test("普通体重の範囲が表示される: 170cm → 53.5kg ~ 72.2kg", () => {
    calculate("170", "65");
    expect(screen.getByText(/53\.5/)).toBeInTheDocument();
    expect(screen.getByText(/72\.2/)).toBeInTheDocument();
  });
});

// ---- E-5: ARIA 属性 ----
describe("E-5: ARIA 属性", () => {
  test("計算結果欄が role='status' と aria-live='polite' を持つ", () => {
    render(<BmiCalculatorPage />);
    fireEvent.change(screen.getByLabelText("身長（cm）"), {
      target: { value: "170" },
    });
    fireEvent.change(screen.getByLabelText("体重（kg）"), {
      target: { value: "65" },
    });
    fireEvent.click(screen.getByRole("button", { name: "計算する" }));
    // role="status" aria-live="polite" の要素が存在する
    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveAttribute("aria-live", "polite");
  });

  test("計算前もライブリージョン要素が DOM に存在する（実テキストノードのサマリ方式）", () => {
    render(<BmiCalculatorPage />);
    // C-3: ライブリージョンは常にDOMに存在し、計算後にサマリテキストが入る
    const liveRegions = document.querySelectorAll('[role="status"]');
    expect(liveRegions.length).toBeGreaterThan(0);
  });

  test("身長入力に aria-label が付与されている", () => {
    render(<BmiCalculatorPage />);
    const heightInput = screen.getByLabelText("身長（cm）");
    expect(heightInput).toBeInTheDocument();
  });

  test("体重入力に aria-label が付与されている", () => {
    render(<BmiCalculatorPage />);
    const weightInput = screen.getByLabelText("体重（kg）");
    expect(weightInput).toBeInTheDocument();
  });

  test("エラー表示が role='alert' を持つ", () => {
    render(<BmiCalculatorPage />);
    fireEvent.click(screen.getByRole("button", { name: "計算する" }));
    const alertEl = screen.getByRole("alert");
    expect(alertEl).toBeInTheDocument();
  });

  test("BMIメーターに role='img' と aria-label が付与されている（計算後）", () => {
    render(<BmiCalculatorPage />);
    fireEvent.change(screen.getByLabelText("身長（cm）"), {
      target: { value: "170" },
    });
    fireEvent.change(screen.getByLabelText("体重（kg）"), {
      target: { value: "65" },
    });
    fireEvent.click(screen.getByRole("button", { name: "計算する" }));
    const meterImg = screen.getByRole("img");
    expect(meterImg).toHaveAttribute("aria-label");
    expect(meterImg.getAttribute("aria-label")).toMatch(/BMI/);
  });
});

// ---- E-13: メーターラベルの線形スケール整合 ----
describe("E-13: メーターラベルとスケールの整合（回帰テスト）", () => {
  // getMeterPercent: (bmi - 10) / 40 * 100 で算出した left 値を期待値とする
  // ラベルの left/right スタイルが線形スケールと一致していることを確認する

  function renderAndGetLabels() {
    render(<BmiCalculatorPage />);
    fireEvent.change(screen.getByLabelText("身長（cm）"), {
      target: { value: "170" },
    });
    fireEvent.change(screen.getByLabelText("体重（kg）"), {
      target: { value: "65" },
    });
    fireEvent.click(screen.getByRole("button", { name: "計算する" }));
    // data-testid の代わりにテキストコンテンツでラベルを取得
    return {
      label10: screen.getByText("10"),
      label18_5: screen.getByText("18.5"),
      label25: screen.getByText("25"),
      label30: screen.getByText("30"),
      label40: screen.getByText("40"),
      label50: screen.getByText("50"),
    };
  }

  test("BMI 10 ラベルが left: 0% に配置される", () => {
    const { label10 } = renderAndGetLabels();
    expect(label10).toHaveStyle({ left: "0%" });
  });

  test("BMI 18.5 ラベルが left: 21.25% に配置される", () => {
    // (18.5 - 10) / 40 * 100 = 21.25
    const { label18_5 } = renderAndGetLabels();
    expect(label18_5).toHaveStyle({ left: "21.25%" });
  });

  test("BMI 25 ラベルが left: 37.5% に配置される", () => {
    // (25 - 10) / 40 * 100 = 37.5
    const { label25 } = renderAndGetLabels();
    expect(label25).toHaveStyle({ left: "37.5%" });
  });

  test("BMI 30 ラベルが left: 50% に配置される", () => {
    // (30 - 10) / 40 * 100 = 50
    const { label30 } = renderAndGetLabels();
    expect(label30).toHaveStyle({ left: "50%" });
  });

  test("BMI 40 ラベルが left: 75% に配置される", () => {
    // (40 - 10) / 40 * 100 = 75
    const { label40 } = renderAndGetLabels();
    expect(label40).toHaveStyle({ left: "75%" });
  });

  test("BMI 50 ラベルが right: 0% に配置される", () => {
    // getMeterPercent(50) = 100%, right: 100 - 100 = 0%
    const { label50 } = renderAndGetLabels();
    expect(label50).toHaveStyle({ right: "0%" });
  });
});

// ---- E-6~E-8: コピー関連 N/A（T-4b: bmi-calculator はコピーなし） ----
// bmi-calculator は「BMI値・判定区分を読んで知る」知る対象のためコピーボタンなし

// ---- E-9: 詳細リンク → N/A（このツールには詳細リンクなし） ----

// ---- E-10: meta 由来の表示 → N/A（ToolPageLayout は page.tsx レベルでテスト） ----
// BmiCalculatorPage 単体では meta を受け取らない。
// page.tsx が ToolPageLayout を通じて meta.name を表示することは
// ToolPageLayout のテストでカバー済み。

// ---- E-11: 既存 logic.ts テストが PASS し続けるか ----
// logic.test.ts が独立ファイルとして存在し、この実装では logic.ts を変更していないため PASS 維持

// ---- E-12: CSS トークン検証 ----
describe("E-12: CSS トークン検証", () => {
  const cssPath = join(
    process.cwd(),
    "src/tools/bmi-calculator/BmiCalculatorPage.module.css",
  );
  const css = readFileSync(cssPath, "utf-8");

  test("旧 --color-* トークンが存在しない", () => {
    expect(css).not.toMatch(/var\(--color-/);
  });

  test("--accent を塗りに直接使っていない（フォーカス outline 以外）", () => {
    expect(css).not.toMatch(/background[^:]*:[^;]*var\(--accent\)/);
    expect(css).not.toMatch(/^(?!.*outline).*color[^:]*:[^;]*var\(--accent\)/m);
  });

  test("font-weight: 700 がコメント外のルールに存在しない", () => {
    const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(cssWithoutComments).not.toMatch(/font-weight:\s*700/);
  });

  test("box-shadow が通常要素に使われていない", () => {
    const boxShadowMatches = css.match(/box-shadow:/g) ?? [];
    expect(boxShadowMatches).toHaveLength(0);
  });

  // B-8 準拠: ハードコードの色値（oklch/hex/rgb 等）が存在しないこと
  // SKILL.md「定義済みの色のみを使う。上記以外の色は使わない」
  // transparent などの CSS キーワードと var(--...) のみが許容される
  test("ハードコードの oklch() 色値が存在しない（B-8: 定義済みトークン外の色禁止）", () => {
    // コメントを除去してから検査
    const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(cssWithoutComments).not.toMatch(/oklch\(/);
  });

  test("ハードコードの #hex 色値が存在しない（B-8: 定義済みトークン外の色禁止）", () => {
    const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(cssWithoutComments).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });

  test("ハードコードの rgb()/rgba() 色値が存在しない（B-8: 定義済みトークン外の色禁止）", () => {
    const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(cssWithoutComments).not.toMatch(/rgba?\(/);
  });

  // B-5 角丸規約: ハードコードの border-radius 値が存在しない
  // DESIGN.md §5「角丸」: --r-normal(2px) または --r-interactive(8px) のみ許容
  test("ハードコードの border-radius 値が存在しない（B-5: 定義済みトークン外の角丸禁止）", () => {
    const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
    // border-radius の値がハードコードの px/em/% 値でない（var(--...) のみ許容）
    expect(cssWithoutComments).not.toMatch(/border-radius:\s*[0-9]/);
  });

  // B-5 角丸規約: 非インタラクティブ装飾要素に --r-interactive を使っていない
  // .meterTrack は非インタラクティブな装飾バー → --r-normal を使うべき
  test("非インタラクティブ装飾バー(.meterTrack)に --r-interactive を使っていない（B-5）", () => {
    const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
    // .meterTrack ブロック内に --r-interactive が存在しないことを確認
    const meterTrackMatch = cssWithoutComments.match(
      /\.meterTrack\s*\{[^}]*\}/,
    );
    if (meterTrackMatch) {
      expect(meterTrackMatch[0]).not.toMatch(/--r-interactive/);
    }
  });

  // DESIGN.md §6 Don't: グラデーションを使わない
  // .meterZoneHigh の linear-gradient は DESIGN.md §6「カラフルな背景やグラデーションを使わない」に違反
  test("linear-gradient が CSS に存在しない（DESIGN.md §6: グラデーション禁止）", () => {
    const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(cssWithoutComments).not.toMatch(/linear-gradient/);
  });

  // DESIGN.md §2: --accent はリンクやフォーカス専用。--accent-soft も同様に
  // 低体重ゾーン（.meterZoneLow）に --accent-soft を背景色として使うのは意味色の誤用
  // 低体重は中立色（--bg-softer 等）で表現するべき
  test("--accent-soft を background-color に使っていない（§2: --accent はフォーカス専用）", () => {
    const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(cssWithoutComments).not.toMatch(
      /background(-color)?[^;]*var\(--accent-soft\)/,
    );
  });
});

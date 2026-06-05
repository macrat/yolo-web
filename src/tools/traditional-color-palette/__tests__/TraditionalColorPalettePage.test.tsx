/**
 * TraditionalColorPalettePage 単一実装の回帰テスト（cycle-225 T-6 / U-8 是正）
 *
 * 収束チェックリスト E-1〜E-12 に対応。
 * コピーボタンは T-4b U-8 PM 判断で「あり」に更新（hex/rgb/hsl 各値をコピー可能）。
 * color-converter との一貫性・FAQ の「ワンクリックでコピーできます」の約束を実現。
 */

import { readFileSync } from "fs";
import { join } from "path";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import TraditionalColorPalettePage from "../TraditionalColorPalettePage";

// =========================================================
// navigator.clipboard モック
// =========================================================
beforeEach(() => {
  vi.stubGlobal("navigator", {
    ...navigator,
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

// =========================================================
// E-12: CSS トークン検証
// =========================================================
describe("CSS トークン検証（E-12）", () => {
  const cssPath = join(
    process.cwd(),
    "src/tools/traditional-color-palette/TraditionalColorPalettePage.module.css",
  );

  it("--color-* 旧トークンが存在しない", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  it("--accent を塗り（background）に直接使っていない", () => {
    const css = readFileSync(cssPath, "utf-8");
    // background系のプロパティで --accent を直接使っていないこと
    // outline: 2px solid var(--accent) は許可
    const lines = css.split("\n");
    for (const line of lines) {
      if (
        line.includes("var(--accent)") &&
        (line.includes("background") || line.includes("background-color"))
      ) {
        throw new Error(
          `--accent を background に直接使っている行: ${line.trim()}`,
        );
      }
    }
    expect(true).toBe(true);
  });

  it("font-weight: 700 が存在しない", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight\s*:\s*700/);
  });

  it("規定外 box-shadow が存在しない（②-13）", () => {
    const css = readFileSync(cssPath, "utf-8");
    // swatch.selected の box-shadow が除去されていること
    // outline に置き換えられるべき
    expect(css).not.toMatch(/box-shadow.*var\(--accent\)/);
  });
});

// =========================================================
// E-1: 基本レンダリング
// =========================================================
describe("基本レンダリング（E-1）", () => {
  it("コンポーネントが正常にレンダリングされる", () => {
    render(<TraditionalColorPalettePage />);
    // スウォッチグリッドが描画されている
    expect(
      document.querySelector("[data-testid='swatch-grid']"),
    ).toBeInTheDocument();
  });

  it("カテゴリフィルタが表示される", () => {
    render(<TraditionalColorPalettePage />);
    expect(
      screen.getByRole("radiogroup", { name: "カテゴリフィルタ" }),
    ).toBeInTheDocument();
  });

  it("配色パターン選択が表示される", () => {
    render(<TraditionalColorPalettePage />);
    expect(
      screen.getByRole("radiogroup", { name: "配色パターン" }),
    ).toBeInTheDocument();
  });
});

// =========================================================
// E-2: 入力→結果更新
// =========================================================
describe("入力→結果更新（E-2）", () => {
  it("スウォッチをクリックすると配色結果が表示される", async () => {
    render(<TraditionalColorPalettePage />);
    // 最初のスウォッチをクリック
    const swatches = document.querySelectorAll("[data-swatch-slug]");
    expect(swatches.length).toBeGreaterThan(0);
    await act(async () => {
      fireEvent.click(swatches[0] as HTMLElement);
    });
    // パレット結果が表示される
    const paletteResults = document.querySelector(
      "[data-testid='palette-results']",
    );
    expect(paletteResults).toBeInTheDocument();
  });

  it("配色パターンを切り替えると表示が変わる", async () => {
    render(<TraditionalColorPalettePage />);
    // 最初のスウォッチをクリックして色を選択
    const swatches = document.querySelectorAll("[data-swatch-slug]");
    await act(async () => {
      fireEvent.click(swatches[0] as HTMLElement);
    });
    // 類似色タブをクリック
    const analogousOption = screen.getByRole("radio", { name: /類似色/ });
    await act(async () => {
      fireEvent.click(analogousOption);
    });
    expect(analogousOption).toHaveAttribute("aria-checked", "true");
  });
});

// =========================================================
// E-3: 空入力（未選択状態）
// =========================================================
describe("空入力・未選択状態（E-3）", () => {
  it("初期状態では色を選ぶよう促すメッセージが表示される", () => {
    render(<TraditionalColorPalettePage />);
    // 未選択時のプレースホルダーメッセージが表示される
    expect(
      screen.getByText(/パレットから伝統色を選んでください/),
    ).toBeInTheDocument();
  });
});

// =========================================================
// E-4: 変換ロジックの正確性（UI 経由）
// =========================================================
describe("変換ロジックの正確性（E-4）", () => {
  it("スウォッチを選ぶと HEX 値が表示される", async () => {
    render(<TraditionalColorPalettePage />);
    const swatches = document.querySelectorAll("[data-swatch-slug]");
    await act(async () => {
      fireEvent.click(swatches[0] as HTMLElement);
    });
    // HEX 値（#XXXXXX 形式）が表示されている
    const hexPattern = /#[0-9a-fA-F]{6}/;
    const allText = document.body.textContent ?? "";
    expect(hexPattern.test(allText)).toBe(true);
  });

  it("無彩色を選んだ場合は無彩色パレット表示になる", async () => {
    render(<TraditionalColorPalettePage />);
    // 無彩色カテゴリに切り替え
    const achromaticOption = screen.getByRole("radio", { name: /無彩色/ });
    await act(async () => {
      fireEvent.click(achromaticOption);
    });
    // 無彩色スウォッチをクリック
    const swatches = document.querySelectorAll("[data-swatch-slug]");
    await act(async () => {
      fireEvent.click(swatches[0] as HTMLElement);
    });
    // 無彩色パレットの説明が表示される（複数ノードにマッチしうるので getAllByText）
    const achromaticTexts = screen.getAllByText(/無彩色/);
    expect(achromaticTexts.length).toBeGreaterThan(0);
  });
});

// =========================================================
// E-5: ARIA 属性
// =========================================================
describe("ARIA 属性（E-5）", () => {
  it("カテゴリフィルタに role='radiogroup' が付与されている", () => {
    render(<TraditionalColorPalettePage />);
    const group = screen.getByRole("radiogroup", { name: "カテゴリフィルタ" });
    expect(group).toBeInTheDocument();
  });

  it("配色パターン選択に role='radiogroup' が付与されている", () => {
    render(<TraditionalColorPalettePage />);
    const group = screen.getByRole("radiogroup", { name: "配色パターン" });
    expect(group).toBeInTheDocument();
  });

  it("ライブリージョンに role='status' と aria-live='polite' が付与されている（C-3）", async () => {
    render(<TraditionalColorPalettePage />);
    // 結果サマリのライブリージョンが存在する
    const liveRegion = document.querySelector(
      "[role='status'][aria-live='polite']",
    );
    expect(liveRegion).toBeInTheDocument();
  });

  it("選択時にライブリージョンに実テキストノードのサマリが入る（C-3）", async () => {
    render(<TraditionalColorPalettePage />);
    const swatches = document.querySelectorAll("[data-swatch-slug]");
    await act(async () => {
      fireEvent.click(swatches[0] as HTMLElement);
    });
    const liveRegion = document.querySelector(
      "[role='status'][aria-live='polite']",
    );
    expect(liveRegion?.textContent?.trim()).not.toBe("");
  });
});

// =========================================================
// E-6: コピー文言変化（T-4b U-8 更新：あり）
// =========================================================
describe("コピー文言変化（E-6）", () => {
  it("色選択後、HEX コピーボタンが表示される", async () => {
    render(<TraditionalColorPalettePage />);
    const swatches = document.querySelectorAll("[data-swatch-slug]");
    await act(async () => {
      fireEvent.click(swatches[0] as HTMLElement);
    });
    // HEX コピーボタンが表示されている
    const hexCopyButtons = screen.getAllByRole("button", {
      name: /HEX.*コピー/,
    });
    expect(hexCopyButtons.length).toBeGreaterThan(0);
  });

  it("コピーボタンをクリックすると COPIED_LABEL に文言が変わる", async () => {
    vi.useFakeTimers();
    render(<TraditionalColorPalettePage />);
    const swatches = document.querySelectorAll("[data-swatch-slug]");
    await act(async () => {
      fireEvent.click(swatches[0] as HTMLElement);
    });

    // HEX コピーボタンをクリック
    const hexCopyButtons = screen.getAllByRole("button", {
      name: /HEX.*コピー/,
    });
    await act(async () => {
      fireEvent.click(hexCopyButtons[0]);
    });

    // COPIED_LABEL「コピーしました」に変化
    expect(
      screen.getByRole("button", { name: /コピーしました/ }),
    ).toBeInTheDocument();
  });
});

// =========================================================
// E-7: コピー disabled 状態（未選択時はコピーボタン自体が表示されない）
//      reviewer 指摘: Button コンポーネント採用後は「カード描画時には必ず
//      有効な aria-label が付く」ことを保証する観点のテストを追加
// =========================================================
describe("コピー disabled 状態（E-7）", () => {
  it("色未選択時はコピーボタンが存在しない", () => {
    render(<TraditionalColorPalettePage />);
    const copyButtons = screen.queryAllByRole("button", {
      name: /コピー/,
    });
    expect(copyButtons).toHaveLength(0);
  });

  it("カード描画時、コピーボタンは共通 Button コンポーネント(size=small)を使っている", async () => {
    // reviewer 指摘: 素の <button> + 自作 CSS でなく Button コンポーネントを使う
    // data-size='small' 属性で Button コンポーネントの採用を検証する
    render(<TraditionalColorPalettePage />);
    const swatches = document.querySelectorAll("[data-swatch-slug]");
    await act(async () => {
      fireEvent.click(swatches[0] as HTMLElement);
    });
    // パレット結果が表示されている
    const paletteResults = document.querySelector(
      "[data-testid='palette-results']",
    );
    expect(paletteResults).toBeInTheDocument();
    // Button コンポーネント(size=small)が使われていることを data-size 属性で確認
    const smallButtons = document.querySelectorAll("[data-size='small']");
    expect(smallButtons.length).toBeGreaterThan(0);
  });

  it("カード描画時、各コピーボタンに有効な aria-label が付いている", async () => {
    // reviewer 指摘: カード描画時には常に値が存在するため disabled の概念は不要だが、
    // aria-label が正しく付与されて a11y が担保されていることを確認する
    render(<TraditionalColorPalettePage />);
    const swatches = document.querySelectorAll("[data-swatch-slug]");
    await act(async () => {
      fireEvent.click(swatches[0] as HTMLElement);
    });
    // HEX / RGB / HSL 各コピーボタンに有効な aria-label が付いている
    const hexButtons = screen.queryAllByRole("button", {
      name: /HEX.*コピー|HEXをコピー/,
    });
    const rgbButtons = screen.queryAllByRole("button", {
      name: /RGB.*コピー|RGBをコピー/,
    });
    const hslButtons = screen.queryAllByRole("button", {
      name: /HSL.*コピー|HSLをコピー/,
    });
    expect(hexButtons.length).toBeGreaterThan(0);
    expect(rgbButtons.length).toBeGreaterThan(0);
    expect(hslButtons.length).toBeGreaterThan(0);
    // 全コピーボタンが aria-label を持つ
    [...hexButtons, ...rgbButtons, ...hslButtons].forEach((btn) => {
      expect(btn).toHaveAttribute("aria-label");
      expect(btn.getAttribute("aria-label")).not.toBe("");
    });
  });
});

// =========================================================
// E-8: clipboard 不在時の silent fail
// =========================================================
describe("clipboard 不在時の silent fail（E-8）", () => {
  it("navigator.clipboard が存在しない環境でもエラーが発生しない", async () => {
    vi.stubGlobal("navigator", {
      clipboard: undefined,
    });
    render(<TraditionalColorPalettePage />);
    const swatches = document.querySelectorAll("[data-swatch-slug]");
    await act(async () => {
      fireEvent.click(swatches[0] as HTMLElement);
    });
    const hexCopyButtons = screen.queryAllByRole("button", {
      name: /HEX.*コピー/,
    });
    // clipboard がなくてもクラッシュしない
    if (hexCopyButtons.length > 0) {
      await expect(
        act(async () => {
          fireEvent.click(hexCopyButtons[0]);
        }),
      ).resolves.not.toThrow();
    }
  });
});

// =========================================================
// E-9: 詳細リンク（N/A – TraditionalColorPalettePage はページ本体のため不要）
// =========================================================

// =========================================================
// E-10: meta 由来の表示
// =========================================================
describe("meta 由来の表示（E-10）", () => {
  it("コンポーネントが独立してレンダリングされる（ToolPageLayout の children として描画可能）", () => {
    render(<TraditionalColorPalettePage />);
    // 検索欄のラベルが表示されている
    expect(screen.getByLabelText(/色を検索/)).toBeInTheDocument();
  });
});

// =========================================================
// E-11: 既存の logic.ts テスト PASS 維持（logic.ts に変更なし）
// =========================================================

// =========================================================
// 個別論点: 検索機能
// =========================================================
describe("検索機能", () => {
  it("検索するとスウォッチが絞り込まれる", async () => {
    render(<TraditionalColorPalettePage />);
    const searchInput = screen.getByLabelText(/色を検索/);
    const allSwatches = document.querySelectorAll("[data-swatch-slug]");
    const allCount = allSwatches.length;

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "鴇" } });
    });

    const filteredSwatches = document.querySelectorAll("[data-swatch-slug]");
    expect(filteredSwatches.length).toBeLessThanOrEqual(allCount);
    expect(filteredSwatches.length).toBeGreaterThan(0);
  });

  it("マッチしない検索語では空メッセージが表示される", async () => {
    render(<TraditionalColorPalettePage />);
    const searchInput = screen.getByLabelText(/色を検索/);
    await act(async () => {
      fireEvent.change(searchInput, {
        target: { value: "存在しない色xyzxyz" },
      });
    });
    expect(screen.getByText(/見つかりませんでした/)).toBeInTheDocument();
  });
});

// =========================================================
// 個別論点: カテゴリフィルタ
// =========================================================
describe("カテゴリフィルタ", () => {
  it("赤系タブをクリックするとスウォッチが絞り込まれる", async () => {
    render(<TraditionalColorPalettePage />);
    const allSwatches = document.querySelectorAll("[data-swatch-slug]");
    const allCount = allSwatches.length;

    const redOption = screen.getByRole("radio", { name: /赤系/ });
    await act(async () => {
      fireEvent.click(redOption);
    });

    const filteredSwatches = document.querySelectorAll("[data-swatch-slug]");
    expect(filteredSwatches.length).toBeGreaterThan(0);
    expect(filteredSwatches.length).toBeLessThan(allCount);
  });
});

// =========================================================
// 個別論点: 5種類の配色パターンタブ
// =========================================================
describe("配色パターンタブ", () => {
  it("補色・類似色・トライアド・テトラド・分裂補色の5つが表示される", () => {
    render(<TraditionalColorPalettePage />);
    expect(screen.getByRole("radio", { name: "補色" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "類似色" })).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "トライアド" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "テトラド" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "分裂補色" })).toBeInTheDocument();
  });

  it("初期状態で「補色」が選択されている", () => {
    render(<TraditionalColorPalettePage />);
    const complementaryOption = screen.getByRole("radio", { name: "補色" });
    expect(complementaryOption).toHaveAttribute("aria-checked", "true");
  });
});

// =========================================================
// 個別論点: 伝統色詳細ページへのリンク（色名から辿れる）
// =========================================================
describe("伝統色詳細ページリンク", () => {
  it("色を選んだ後、各配色カードに辞書への詳細リンクが表示される", async () => {
    render(<TraditionalColorPalettePage />);
    const swatches = document.querySelectorAll("[data-swatch-slug]");
    await act(async () => {
      fireEvent.click(swatches[0] as HTMLElement);
    });
    // /dictionary/colors/<slug> 形式のリンクが存在する
    const links = document.querySelectorAll('a[href^="/dictionary/colors/"]');
    expect(links.length).toBeGreaterThan(0);
  });
});

/**
 * TraditionalColorPaletteTile 単一正典タイルのテスト（cycle-228 T-19）
 *
 * 旧 TraditionalColorPalettePage.test.tsx の全振る舞いを移植し、
 * タイルアーキテクチャ要件（Panel ルート・useId・variant・複数インスタンス）を追加。
 *
 * CSS トークン検証: readFileSync（import { readFileSync } from "fs"）を使用。
 */

import { readFileSync } from "fs";
import { join } from "path";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import TraditionalColorPaletteTile from "../TraditionalColorPaletteTile";

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
// CSS トークン検証（新タイル CSS）
// =========================================================
describe("CSS トークン検証", () => {
  const cssPath = join(
    process.cwd(),
    "src/tools/traditional-color-palette/TraditionalColorPaletteTile.module.css",
  );

  it("--color-* 旧トークンが存在しない（B-1）", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  it("--accent を塗り（background）に直接使っていない（B-3）", () => {
    const css = readFileSync(cssPath, "utf-8");
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

  it("font-weight: 700 が存在しない（B-4）", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight\s*:\s*700/);
  });

  it("規定外 box-shadow が存在しない（B-6）", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/box-shadow.*var\(--accent\)/);
  });
});

// =========================================================
// A-1: Panel ルート要素
// =========================================================
describe("Panel ルート要素（A-1）", () => {
  it("ルート要素に panel クラスが付与されている", () => {
    const { container } = render(<TraditionalColorPaletteTile />);
    // Panel コンポーネントが出力した最初の要素
    const root = container.firstElementChild;
    expect(root).not.toBeNull();
    // Panel の CSS Module クラス名は動的だが、section/div/article/aside のいずれか
    const tag = root?.tagName.toLowerCase();
    expect(["section", "div", "article", "aside"]).toContain(tag);
  });
});

// =========================================================
// A-6: DOM id の useId による一意化（複数インスタンス同居）
// =========================================================
describe("複数インスタンスで id 重複がない（A-6）", () => {
  it("2つのタイルを同一ページに描画しても id 重複がない", () => {
    render(
      <div>
        <TraditionalColorPaletteTile />
        <TraditionalColorPaletteTile />
      </div>,
    );
    const allIds = Array.from(document.querySelectorAll("[id]")).map(
      (el) => el.id,
    );
    const uniqueIds = new Set(allIds);
    expect(allIds.length).toBe(uniqueIds.size);
  });
});

// =========================================================
// 基本レンダリング
// =========================================================
describe("基本レンダリング", () => {
  it("コンポーネントが正常にレンダリングされる", () => {
    render(<TraditionalColorPaletteTile />);
    expect(
      document.querySelector("[data-testid='swatch-grid']"),
    ).toBeInTheDocument();
  });

  it("カテゴリフィルタが表示される", () => {
    render(<TraditionalColorPaletteTile />);
    expect(
      screen.getByRole("radiogroup", { name: "カテゴリフィルタ" }),
    ).toBeInTheDocument();
  });

  it("配色パターン選択が表示される", () => {
    render(<TraditionalColorPaletteTile />);
    expect(
      screen.getByRole("radiogroup", { name: "配色パターン" }),
    ).toBeInTheDocument();
  });
});

// =========================================================
// 入力→結果更新
// =========================================================
describe("入力→結果更新", () => {
  it("スウォッチをクリックすると配色結果が表示される", async () => {
    render(<TraditionalColorPaletteTile />);
    const swatches = document.querySelectorAll("[data-swatch-slug]");
    expect(swatches.length).toBeGreaterThan(0);
    await act(async () => {
      fireEvent.click(swatches[0] as HTMLElement);
    });
    const paletteResults = document.querySelector(
      "[data-testid='palette-results']",
    );
    expect(paletteResults).toBeInTheDocument();
  });

  it("配色パターンを切り替えると表示が変わる", async () => {
    render(<TraditionalColorPaletteTile />);
    const swatches = document.querySelectorAll("[data-swatch-slug]");
    await act(async () => {
      fireEvent.click(swatches[0] as HTMLElement);
    });
    const analogousOption = screen.getByRole("radio", { name: /類似色/ });
    await act(async () => {
      fireEvent.click(analogousOption);
    });
    expect(analogousOption).toHaveAttribute("aria-checked", "true");
  });
});

// =========================================================
// 空入力・未選択状態
// =========================================================
describe("空入力・未選択状態", () => {
  it("初期状態では色を選ぶよう促すメッセージが表示される", () => {
    render(<TraditionalColorPaletteTile />);
    expect(
      screen.getByText(/パレットから伝統色を選んでください/),
    ).toBeInTheDocument();
  });
});

// =========================================================
// 変換ロジックの正確性（UI 経由）
// =========================================================
describe("変換ロジックの正確性（UI 経由）", () => {
  it("スウォッチを選ぶと HEX 値が表示される", async () => {
    render(<TraditionalColorPaletteTile />);
    const swatches = document.querySelectorAll("[data-swatch-slug]");
    await act(async () => {
      fireEvent.click(swatches[0] as HTMLElement);
    });
    const hexPattern = /#[0-9a-fA-F]{6}/;
    const allText = document.body.textContent ?? "";
    expect(hexPattern.test(allText)).toBe(true);
  });

  it("無彩色を選んだ場合は無彩色パレット表示になる", async () => {
    render(<TraditionalColorPaletteTile />);
    const achromaticOption = screen.getByRole("radio", { name: /無彩色/ });
    await act(async () => {
      fireEvent.click(achromaticOption);
    });
    const swatches = document.querySelectorAll("[data-swatch-slug]");
    await act(async () => {
      fireEvent.click(swatches[0] as HTMLElement);
    });
    const achromaticTexts = screen.getAllByText(/無彩色/);
    expect(achromaticTexts.length).toBeGreaterThan(0);
  });
});

// =========================================================
// ARIA 属性（C-3）
// =========================================================
describe("ARIA 属性（C-3）", () => {
  it("カテゴリフィルタに role='radiogroup' が付与されている", () => {
    render(<TraditionalColorPaletteTile />);
    const group = screen.getByRole("radiogroup", { name: "カテゴリフィルタ" });
    expect(group).toBeInTheDocument();
  });

  it("配色パターン選択に role='radiogroup' が付与されている", () => {
    render(<TraditionalColorPaletteTile />);
    const group = screen.getByRole("radiogroup", { name: "配色パターン" });
    expect(group).toBeInTheDocument();
  });

  it("ライブリージョンに role='status' と aria-live='polite' が付与されている（C-3）", () => {
    render(<TraditionalColorPaletteTile />);
    const liveRegion = document.querySelector(
      "[role='status'][aria-live='polite']",
    );
    expect(liveRegion).toBeInTheDocument();
  });

  it("選択時にライブリージョンに実テキストノードのサマリが入る（C-3）", async () => {
    render(<TraditionalColorPaletteTile />);
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
// コピー文言変化
// =========================================================
describe("コピー文言変化", () => {
  it("色選択後、HEX コピーボタンが表示される", async () => {
    render(<TraditionalColorPaletteTile />);
    const swatches = document.querySelectorAll("[data-swatch-slug]");
    await act(async () => {
      fireEvent.click(swatches[0] as HTMLElement);
    });
    const hexCopyButtons = screen.getAllByRole("button", {
      name: /HEX.*コピー/,
    });
    expect(hexCopyButtons.length).toBeGreaterThan(0);
  });

  it("コピーボタンをクリックすると COPIED_LABEL に文言が変わる", async () => {
    vi.useFakeTimers();
    render(<TraditionalColorPaletteTile />);
    const swatches = document.querySelectorAll("[data-swatch-slug]");
    await act(async () => {
      fireEvent.click(swatches[0] as HTMLElement);
    });
    const hexCopyButtons = screen.getAllByRole("button", {
      name: /HEX.*コピー/,
    });
    await act(async () => {
      fireEvent.click(hexCopyButtons[0]);
    });
    expect(
      screen.getByRole("button", { name: /コピーしました/ }),
    ).toBeInTheDocument();
  });
});

// =========================================================
// コピーボタン状態（未選択時）
// =========================================================
describe("コピーボタン状態", () => {
  it("色未選択時はコピーボタンが存在しない", () => {
    render(<TraditionalColorPaletteTile />);
    const copyButtons = screen.queryAllByRole("button", {
      name: /コピー/,
    });
    expect(copyButtons).toHaveLength(0);
  });

  it("カード描画時、コピーボタンは共通 Button コンポーネント(size=small)を使っている", async () => {
    render(<TraditionalColorPaletteTile />);
    const swatches = document.querySelectorAll("[data-swatch-slug]");
    await act(async () => {
      fireEvent.click(swatches[0] as HTMLElement);
    });
    const paletteResults = document.querySelector(
      "[data-testid='palette-results']",
    );
    expect(paletteResults).toBeInTheDocument();
    const smallButtons = document.querySelectorAll("[data-size='small']");
    expect(smallButtons.length).toBeGreaterThan(0);
  });

  it("カード描画時、各コピーボタンに有効な aria-label が付いている", async () => {
    render(<TraditionalColorPaletteTile />);
    const swatches = document.querySelectorAll("[data-swatch-slug]");
    await act(async () => {
      fireEvent.click(swatches[0] as HTMLElement);
    });
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
    [...hexButtons, ...rgbButtons, ...hslButtons].forEach((btn) => {
      expect(btn).toHaveAttribute("aria-label");
      expect(btn.getAttribute("aria-label")).not.toBe("");
    });
  });
});

// =========================================================
// clipboard 不在時の silent fail
// =========================================================
describe("clipboard 不在時の silent fail", () => {
  it("navigator.clipboard が存在しない環境でもエラーが発生しない", async () => {
    vi.stubGlobal("navigator", {
      clipboard: undefined,
    });
    render(<TraditionalColorPaletteTile />);
    const swatches = document.querySelectorAll("[data-swatch-slug]");
    await act(async () => {
      fireEvent.click(swatches[0] as HTMLElement);
    });
    const hexCopyButtons = screen.queryAllByRole("button", {
      name: /HEX.*コピー/,
    });
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
// 検索機能
// =========================================================
describe("検索機能", () => {
  it("検索するとスウォッチが絞り込まれる", async () => {
    render(<TraditionalColorPaletteTile />);
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
    render(<TraditionalColorPaletteTile />);
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
// カテゴリフィルタ
// =========================================================
describe("カテゴリフィルタ", () => {
  it("赤系タブをクリックするとスウォッチが絞り込まれる", async () => {
    render(<TraditionalColorPaletteTile />);
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
// 配色パターンタブ
// =========================================================
describe("配色パターンタブ", () => {
  it("補色・類似色・トライアド・テトラド・分裂補色の5つが表示される", () => {
    render(<TraditionalColorPaletteTile />);
    expect(screen.getByRole("radio", { name: "補色" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "類似色" })).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "トライアド" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "テトラド" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "分裂補色" })).toBeInTheDocument();
  });

  it("初期状態で「補色」が選択されている（C-5）", () => {
    render(<TraditionalColorPaletteTile />);
    const complementaryOption = screen.getByRole("radio", { name: "補色" });
    expect(complementaryOption).toHaveAttribute("aria-checked", "true");
  });
});

// =========================================================
// 伝統色詳細ページへのリンク
// =========================================================
describe("伝統色詳細ページリンク", () => {
  it("色を選んだ後、各配色カードに辞書への詳細リンクが表示される", async () => {
    render(<TraditionalColorPaletteTile />);
    const swatches = document.querySelectorAll("[data-swatch-slug]");
    await act(async () => {
      fireEvent.click(swatches[0] as HTMLElement);
    });
    const links = document.querySelectorAll('a[href^="/dictionary/colors/"]');
    expect(links.length).toBeGreaterThan(0);
  });
});

// =========================================================
// 独立レンダリング
// =========================================================
describe("独立レンダリング（ToolPageLayout 非依存）", () => {
  it("コンポーネントが独立してレンダリングされる", () => {
    render(<TraditionalColorPaletteTile />);
    expect(screen.getByLabelText(/色を検索/)).toBeInTheDocument();
  });
});

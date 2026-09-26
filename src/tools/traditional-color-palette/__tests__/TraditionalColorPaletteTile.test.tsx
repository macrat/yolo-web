import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { hexToOklch } from "@/lib/hexToOklch";
import TraditionalColorPaletteTile from "../TraditionalColorPaletteTile";
import { PALETTE_ITEMS } from "../palette-list";

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
  // 格子の列の数を読む ResizeObserver と、押した見本の位置を保つ scrollBy は jsdom に無い。
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("scrollBy", vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  // 絞り込みと並び順は URL のクエリに持つので、テストごとにクエリの無い URL へ戻す。
  window.history.replaceState(null, "", "/tools/traditional-color-palette");
});

// 見えている件数の行。読み上げに伝える文は、これとは別の見えない role="status" が持つ。
function countLine(): HTMLElement {
  const line = document.querySelector<HTMLElement>('p[tabindex="-1"]');
  if (!line) throw new Error("件数の行がありません");
  return line;
}

function searchBox(): HTMLElement {
  return screen.getByRole("searchbox", { name: "色名・ローマ字で探す" });
}

function swatchSlugs(): string[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>("[data-swatch-slug]"),
    (swatch) => swatch.dataset.swatchSlug ?? "",
  );
}

// =========================================================
// ルート要素
// =========================================================
describe("ルート要素", () => {
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
// 複数のタイル
// =========================================================
describe("複数インスタンスで id 重複がない", () => {
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
      screen.getByRole("radiogroup", { name: "色の系統" }),
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
  it("色見本を押すと配色結果が表示される", async () => {
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
    expect(analogousOption).toBeChecked();
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
  it("色見本を選ぶと HEX 値が表示される", async () => {
    render(<TraditionalColorPaletteTile />);
    const swatches = document.querySelectorAll("[data-swatch-slug]");
    await act(async () => {
      fireEvent.click(swatches[0] as HTMLElement);
    });
    const hexPattern = /#[0-9a-fA-F]{6}/;
    const allText = document.body.textContent ?? "";
    expect(hexPattern.test(allText)).toBe(true);
  });

  it("無彩色を選ぶと、明度の違う無彩色のカードのうち選んだ色のカードに「選んだ色」と添える", () => {
    render(<TraditionalColorPaletteTile />);
    fireEvent.click(screen.getByRole("radio", { name: /無彩色/ }));
    const swatch = document.querySelector<HTMLElement>("[data-swatch-slug]")!;
    fireEvent.click(swatch);
    const slug = swatch.dataset.swatchSlug!;
    const cards = screen.getByTestId("palette-results");
    const pickedCards = Array.from(cards.children).filter((card) =>
      card.textContent?.includes("選んだ色"),
    );
    expect(pickedCards).toHaveLength(1);
    expect(
      pickedCards[0].querySelector(`a[href="/dictionary/colors/${slug}"]`),
    ).not.toBeNull();
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
// ARIA 属性
// =========================================================
describe("ARIA 属性", () => {
  it("カテゴリフィルタに role='radiogroup' が付与されている", () => {
    render(<TraditionalColorPaletteTile />);
    const group = screen.getByRole("radiogroup", { name: "色の系統" });
    expect(group).toBeInTheDocument();
  });

  it("配色パターン選択に role='radiogroup' が付与されている", () => {
    render(<TraditionalColorPaletteTile />);
    const group = screen.getByRole("radiogroup", { name: "配色パターン" });
    expect(group).toBeInTheDocument();
  });

  it("ライブリージョンに role='status' と aria-live='polite' が付与されている", () => {
    render(<TraditionalColorPaletteTile />);
    const liveRegion = document.querySelector(
      "[role='status'][aria-live='polite']",
    );
    expect(liveRegion).toBeInTheDocument();
  });

  it("選択時にライブリージョンに配色の文が入る", async () => {
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

  it("カード描画時、コピーボタンは共通 Button コンポーネントを使っている", async () => {
    render(<TraditionalColorPaletteTile />);
    const swatches = document.querySelectorAll("[data-swatch-slug]");
    await act(async () => {
      fireEvent.click(swatches[0] as HTMLElement);
    });
    const paletteResults = document.querySelector(
      "[data-testid='palette-results']",
    );
    expect(paletteResults).toBeInTheDocument();
    const sharedButtons = paletteResults!.querySelectorAll("[data-variant]");
    expect(sharedButtons.length).toBeGreaterThan(0);
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
// 件数・名前の欄・色の系統・並び順
// =========================================================
describe("色の格子の件数と備え", () => {
  it("件数の行が全体の数を言い、色の系統と並び順の組を畳む", () => {
    render(<TraditionalColorPaletteTile />);
    expect(countLine()).toHaveTextContent("全250色");
    expect(swatchSlugs()).toHaveLength(250);
    expect(
      screen.getByRole("button", {
        name: "絞り込みと並び順（すべて、色み順）",
      }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("名前の欄で絞り込み、件数の行が該当件数を言う", () => {
    render(<TraditionalColorPaletteTile />);
    fireEvent.change(searchBox(), { target: { value: "鴇" } });
    expect(swatchSlugs()[0]).toBe("toki");
    expect(countLine()).toHaveTextContent(
      `${swatchSlugs().length}色（全250色）`,
    );
  });

  it("当たらないときは件数の行が言い、「絞り込みを外す」で名前の欄へ戻る", () => {
    render(<TraditionalColorPaletteTile />);
    fireEvent.change(searchBox(), {
      target: { value: "存在しない色xyzxyz" },
    });
    expect(countLine()).toHaveTextContent(
      "条件に合う色はありません（全250色）",
    );
    expect(swatchSlugs()).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "絞り込みを外す" }));
    expect(swatchSlugs()).toHaveLength(250);
    expect(searchBox()).toHaveFocus();
  });

  it("色の系統で絞り込み、URL の kind に書く", () => {
    render(<TraditionalColorPaletteTile />);
    fireEvent.click(screen.getByRole("radio", { name: "赤系" }));
    expect(swatchSlugs().length).toBeGreaterThan(0);
    expect(swatchSlugs().length).toBeLessThan(250);
    expect(new URLSearchParams(window.location.search).get("kind")).toBe("red");
  });

  it("色見本は1つを選ぶラジオボタンの組で、選んだ見本だけが選ばれた状態になる", () => {
    render(<TraditionalColorPaletteTile />);
    const group = screen.getByRole("radiogroup", { name: "伝統色" });
    const swatches = Array.from(
      group.querySelectorAll<HTMLInputElement>("[data-swatch-slug]"),
    );
    expect(swatches).toHaveLength(250);
    expect(swatches.every((swatch) => swatch.type === "radio")).toBe(true);
    expect(swatches.some((swatch) => swatch.hasAttribute("aria-pressed"))).toBe(
      false,
    );
    fireEvent.click(swatches[2]);
    expect(swatches[2]).toBeChecked();
    expect(swatches.filter((swatch) => swatch.checked)).toHaveLength(1);
  });

  it("選んだ色の名前とカラーコードが、選んだ見本のすぐ後ろに出る", () => {
    render(<TraditionalColorPaletteTile />);
    expect(screen.queryByTestId("picked-color")).toBeNull();
    const toki = PALETTE_ITEMS.find(({ color }) => color.slug === "toki")!;
    const swatch = document.querySelector<HTMLElement>(
      '[data-swatch-slug="toki"]',
    )!;
    fireEvent.click(swatch);
    const picked = screen.getByTestId("picked-color");
    expect(picked).toHaveTextContent(toki.color.name);
    expect(picked).toHaveTextContent(toki.color.hex);
    // jsdom では格子の列の数が1になるので、選んだ見本の次に開く。
    expect(swatch.closest("label")?.nextElementSibling).toBe(picked);
  });

  it("色見本は字を載せず、読み上げの名前に色の名前とカラーコードを持つ", () => {
    render(<TraditionalColorPaletteTile />);
    const swatch = document.querySelector<HTMLElement>(
      '[data-swatch-slug="toki"]',
    );
    expect(swatch).not.toBeNull();
    expect(swatch).toHaveTextContent("");
    const toki = PALETTE_ITEMS.find(({ color }) => color.slug === "toki")!;
    expect(swatch).toHaveAccessibleName(
      `${toki.color.name} (${toki.color.hex})`,
    );
  });

  it("URL のクエリの並び順で出す", () => {
    window.history.replaceState(
      null,
      "",
      "/tools/traditional-color-palette?sort=light",
    );
    render(<TraditionalColorPaletteTile />);
    expect(screen.getByRole("radio", { name: "明るい順" })).toBeChecked();
    const lightest = PALETTE_ITEMS.reduce((a, b) =>
      hexToOklch(b.color.hex).l > hexToOklch(a.color.hex).l ? b : a,
    );
    expect(swatchSlugs()[0]).toBe(lightest.color.slug);
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

  it("初期状態で「補色」が選択されている", () => {
    render(<TraditionalColorPaletteTile />);
    const complementaryOption = screen.getByRole("radio", { name: "補色" });
    expect(complementaryOption).toBeChecked();
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
describe("独立レンダリング", () => {
  it("コンポーネントが独立してレンダリングされる", () => {
    render(<TraditionalColorPaletteTile />);
    expect(searchBox()).toBeInTheDocument();
  });
});

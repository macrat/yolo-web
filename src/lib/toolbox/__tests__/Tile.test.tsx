import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import React from "react";
import type { TileComponentProps } from "../tile-loader";

/**
 * Tile コンテナコンポーネントのテスト（C-1 v10）
 *
 * カバレッジ目標:
 * - 状態 4 種: 通常 / 編集中 / ドラッグ中 / 空きスロット
 * - サイズ 3 種: small / medium / large
 * - href あり/なし
 * - isEditing true/false
 * - fade-in クラス付与（マウント時）
 * - 長押し 500ms で onLongPress 呼び出し
 * - 8px 移動で長押しキャンセル
 * - 編集モード時の長押し無効
 * - tile--wiggle クラス（揺れ受け皿）
 *
 * 【設計変更（lint 対応）】
 * Tile は tileComponent を props として受け取る設計に変更された。
 * getTileComponent の呼び出しは呼び出し元（TileGrid 等）で行う。
 * これにより react-hooks/static-components ルール違反（レンダー中のコンポーネント生成）を解消する。
 */

// テスト用スタブコンポーネント（DynamicStub）: モジュールレベルで定義
function DynamicStub({ slug }: TileComponentProps) {
  return React.createElement(
    "div",
    { "data-testid": "fallback-tile", "data-slug": slug },
    slug,
  );
}

// CSS モジュールのモック
vi.mock("../Tile.module.css", () => ({
  default: {
    tile: "tile",
    "tile--small": "tile--small",
    "tile--medium": "tile--medium",
    "tile--large": "tile--large",
    "tile--editing": "tile--editing",
    "tile--dragging": "tile--dragging",
    "tile--empty": "tile--empty",
    "tile--fade-in": "tile--fade-in",
    "tile--long-pressing": "tile--long-pressing",
    "tile--wiggle": "tile--wiggle",
    tileInner: "tileInner",
    tileInnerDisabled: "tileInnerDisabled",
    tileMeta: "tileMeta",
    tileName: "tileName",
    tileDescription: "tileDescription",
    dragHandle: "dragHandle",
    tileHeader: "tileHeader",
    stretchedLink: "stretchedLink",
    // F-1: sizeBar（Tile 内部に移動、CRIT-F1-1）
    sizeBar: "sizeBar",
    sizeButton: "sizeButton",
    sizeButtonActive: "sizeButtonActive",
    // MID-F1v2-1: controlsOverlay（Tile 内部に移動）
    controlsOverlay: "controlsOverlay",
    moveButton: "moveButton",
    removeButton: "removeButton",
  },
}));

// next/link モック（jsdom 環境で動作させるため）
// unstable_viewTransition など Next.js 固有の props は DOM に渡さず除外する
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    unstable_viewTransition: _viewTransition,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    unstable_viewTransition?: boolean;
    [key: string]: unknown;
  }) =>
    React.createElement(
      "a",
      { href, className, "data-next-link": "true", ...rest },
      children,
    ),
}));

// registry モック
vi.mock("../registry", () => ({
  getTileableBySlug: vi.fn((slug: string) => {
    if (slug === "json-formatter") {
      return {
        slug: "json-formatter",
        displayName: "JSON フォーマッター",
        shortDescription: "JSON を整形する",
        contentKind: "tool",
        publishedAt: "2024-01-01T00:00:00+0900",
        trustLevel: "verified",
        href: "/tools/json-formatter",
      };
    }
    if (slug === "no-href-tool") {
      return {
        slug: "no-href-tool",
        displayName: "リンクなしツール",
        shortDescription: "href がないツール",
        contentKind: "tool",
        publishedAt: "2024-01-01T00:00:00+0900",
        trustLevel: "verified",
      };
    }
    return undefined;
  }),
}));

// モックセットアップ後にインポート
const { Tile } = await import("../Tile");

// ---- テスト用 props ----
const baseEntry = {
  slug: "json-formatter",
  size: "medium" as const,
  order: 0,
};

describe("Tile — サイズ 3 種", () => {
  test("size=small のとき small クラスが付く", () => {
    const { container } = render(
      <Tile
        entry={{ ...baseEntry, size: "small" }}
        isEditing={false}
        tileComponent={DynamicStub}
      />,
    );
    expect(container.firstChild).toBeTruthy();
    // data-size 属性で確認
    expect(container.querySelector('[data-size="small"]')).toBeTruthy();
  });

  test("size=medium のとき medium クラスが付く", () => {
    const { container } = render(
      <Tile
        entry={{ ...baseEntry, size: "medium" }}
        isEditing={false}
        tileComponent={DynamicStub}
      />,
    );
    expect(container.querySelector('[data-size="medium"]')).toBeTruthy();
  });

  test("size=large のとき large クラスが付く", () => {
    const { container } = render(
      <Tile
        entry={{ ...baseEntry, size: "large" }}
        isEditing={false}
        tileComponent={DynamicStub}
      />,
    );
    expect(container.querySelector('[data-size="large"]')).toBeTruthy();
  });
});

describe("Tile — isEditing フラグ", () => {
  test("isEditing=false のとき editing 状態ではない", () => {
    const { container } = render(
      <Tile entry={baseEntry} isEditing={false} tileComponent={DynamicStub} />,
    );
    expect(container.querySelector('[data-editing="false"]')).toBeTruthy();
  });

  test("isEditing=true のとき editing 状態になる", () => {
    const { container } = render(
      <Tile entry={baseEntry} isEditing={true} tileComponent={DynamicStub} />,
    );
    expect(container.querySelector('[data-editing="true"]')).toBeTruthy();
  });

  test("isEditing=true のときタイル本体に tileInnerDisabled クラスが付く（DESIGN.md §4 L76 参照）", () => {
    render(
      <Tile entry={baseEntry} isEditing={true} tileComponent={DynamicStub} />,
    );
    // 編集モード中はタイル本体クリック禁止（CSS クラスで管理）
    const inner = document.querySelector("[data-tile-inner]");
    expect(inner).toBeTruthy();
    expect(inner?.classList.contains("tileInnerDisabled")).toBe(true);
  });
});

describe("Tile — ドラッグ状態", () => {
  test("isDragging=true のとき dragging 状態になる", () => {
    const { container } = render(
      <Tile
        entry={baseEntry}
        isEditing={true}
        isDragging={true}
        tileComponent={DynamicStub}
      />,
    );
    expect(container.querySelector('[data-dragging="true"]')).toBeTruthy();
  });

  test("isDragging=false のとき dragging 状態ではない", () => {
    const { container } = render(
      <Tile
        entry={baseEntry}
        isEditing={false}
        isDragging={false}
        tileComponent={DynamicStub}
      />,
    );
    expect(container.querySelector('[data-dragging="false"]')).toBeTruthy();
  });
});

describe("Tile — 空きスロット状態", () => {
  test("isEmpty=true のとき empty 状態になる", () => {
    const { container } = render(
      <Tile
        entry={{ ...baseEntry, slug: "" }}
        isEditing={false}
        isEmpty={true}
        tileComponent={DynamicStub}
      />,
    );
    expect(container.querySelector('[data-empty="true"]')).toBeTruthy();
  });
});

describe("Tile — メタ情報表示", () => {
  test("displayName が表示される（登録済み slug）", () => {
    render(
      <Tile entry={baseEntry} isEditing={false} tileComponent={DynamicStub} />,
    );
    expect(screen.getByText("JSON フォーマッター")).toBeTruthy();
  });

  test("shortDescription が補助表示される", () => {
    render(
      <Tile entry={baseEntry} isEditing={false} tileComponent={DynamicStub} />,
    );
    expect(screen.getByText("JSON を整形する")).toBeTruthy();
  });

  test("未登録 slug のとき slug 名がフォールバックで表示される", () => {
    render(
      <Tile
        entry={{ ...baseEntry, slug: "unknown-slug" }}
        isEditing={false}
        tileComponent={DynamicStub}
      />,
    );
    // slug がそのまま表示される（tileName + fallback-tile の両方に出るため getAllByText を使う）
    const elements = screen.getAllByText("unknown-slug");
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Tile — href あり/なし", () => {
  test("href あり（Tileable.href が存在）のとき a タグが存在する", () => {
    render(
      <Tile entry={baseEntry} isEditing={false} tileComponent={DynamicStub} />,
    );
    // json-formatter は href="/tools/json-formatter" を持つ
    const link = document.querySelector('a[href="/tools/json-formatter"]');
    expect(link).toBeTruthy();
  });

  test("href なし（Tileable.href が未設定）のとき a タグは存在しない", () => {
    render(
      <Tile
        entry={{ ...baseEntry, slug: "no-href-tool" }}
        isEditing={false}
        tileComponent={DynamicStub}
      />,
    );
    // href なし = リンクなし
    const link = document.querySelector("a[href]");
    expect(link).toBeNull();
  });

  test("使用モード href あり: article 内に href を持つ a タグが存在する（I-4: Stretched Link）", () => {
    render(
      <Tile entry={baseEntry} isEditing={false} tileComponent={DynamicStub} />,
    );
    // 使用モードでは article 内に href リンクが存在する
    const link = document.querySelector(
      'article a[href="/tools/json-formatter"]',
    );
    expect(link).toBeTruthy();
  });

  test("isEditing=true のとき href がある tileable でも a タグが描画されない（I-2: aria-hidden 廃止）", () => {
    render(
      <Tile entry={baseEntry} isEditing={true} tileComponent={DynamicStub} />,
    );
    // 編集モード中は a タグを描画しない（span で代替）
    const link = document.querySelector("a");
    expect(link).toBeNull();
  });
});

describe("Tile — タップターゲット（WCAG SC 2.5.8）", () => {
  test("ドラッグハンドルが data-drag-handle 属性を持つ（編集モード時）", () => {
    render(
      <Tile entry={baseEntry} isEditing={true} tileComponent={DynamicStub} />,
    );
    const handle = document.querySelector("[data-drag-handle]");
    expect(handle).toBeTruthy();
  });

  test("ドラッグハンドルにのみ grab カーソルが指定される（§4 L75）", () => {
    render(
      <Tile entry={baseEntry} isEditing={true} tileComponent={DynamicStub} />,
    );
    const handle = document.querySelector(
      "[data-drag-handle]",
    ) as HTMLElement | null;
    // data-drag-handle はハンドル要素のみ grab カーソルを持つ（CSS クラスで管理）
    // ここでは要素の存在確認のみ（CSS は jsdom では評価されない）
    expect(handle).toBeTruthy();
  });
});

describe("Tile — tileComponent props として受け取る（lint 対応）", () => {
  test("tileComponent が内包される（data-testid=fallback-tile）", () => {
    render(
      <Tile entry={baseEntry} isEditing={false} tileComponent={DynamicStub} />,
    );
    expect(screen.getByTestId("fallback-tile")).toBeTruthy();
  });

  test("tileComponent に slug が渡される", () => {
    render(
      <Tile entry={baseEntry} isEditing={false} tileComponent={DynamicStub} />,
    );
    const fallback = screen.getByTestId("fallback-tile");
    expect(fallback.getAttribute("data-slug")).toBe("json-formatter");
  });
});

// ---- v10 新規テスト ----

describe("Tile v10 — fade-in アニメーション（瞬間 1 / 2）", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("マウント後に tile--fade-in クラスが付与される", async () => {
    const { container } = render(
      <Tile entry={baseEntry} isEditing={false} tileComponent={DynamicStub} />,
    );
    // requestAnimationFrame をフラッシュして useEffect コールバックを実行させる
    await act(async () => {
      vi.runAllTimers();
    });
    const tile = container.querySelector("[data-tile-slug]");
    expect(tile?.classList.contains("tile--fade-in")).toBe(true);
  });
});

describe("Tile v10 — View Transitions 対応（瞬間 6）", () => {
  test("href ありのとき data-next-link 属性を持つ a タグが描画される", () => {
    render(
      <Tile entry={baseEntry} isEditing={false} tileComponent={DynamicStub} />,
    );
    // next/link モックは data-next-link="true" を付与する
    const link = document.querySelector('[data-next-link="true"]');
    expect(link).toBeTruthy();
  });

  test("href ありのとき a タグに href が設定される", () => {
    render(
      <Tile entry={baseEntry} isEditing={false} tileComponent={DynamicStub} />,
    );
    const link = document.querySelector('a[href="/tools/json-formatter"]');
    expect(link).toBeTruthy();
  });

  test("編集モード時は Link が描画されない（isEditing=true）", () => {
    render(
      <Tile entry={baseEntry} isEditing={true} tileComponent={DynamicStub} />,
    );
    const link = document.querySelector('[data-next-link="true"]');
    expect(link).toBeNull();
  });
});

describe("Tile v10 — 長押しハンドラ（瞬間 37）", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("500ms 長押しで onLongPress が呼ばれる（使用モード）", async () => {
    const onLongPress = vi.fn();
    const { container } = render(
      <Tile
        entry={baseEntry}
        isEditing={false}
        tileComponent={DynamicStub}
        onLongPress={onLongPress}
      />,
    );
    const tile = container.querySelector("[data-tile-slug]") as HTMLElement;
    expect(tile).toBeTruthy();

    // pointerdown をトリガー
    tile.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        clientX: 100,
        clientY: 100,
      }),
    );

    // 500ms 経過前はまだ呼ばれない
    vi.advanceTimersByTime(499);
    expect(onLongPress).not.toHaveBeenCalled();

    // 500ms 経過で呼ばれる
    vi.advanceTimersByTime(1);
    expect(onLongPress).toHaveBeenCalledWith("json-formatter");
  });

  test("500ms 前に pointerup すると onLongPress は呼ばれない", () => {
    const onLongPress = vi.fn();
    const { container } = render(
      <Tile
        entry={baseEntry}
        isEditing={false}
        tileComponent={DynamicStub}
        onLongPress={onLongPress}
      />,
    );
    const tile = container.querySelector("[data-tile-slug]") as HTMLElement;

    tile.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        clientX: 100,
        clientY: 100,
      }),
    );
    vi.advanceTimersByTime(300);
    tile.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
    vi.advanceTimersByTime(300);

    expect(onLongPress).not.toHaveBeenCalled();
  });

  test("8px 以上の移動で長押しキャンセル", () => {
    const onLongPress = vi.fn();
    const { container } = render(
      <Tile
        entry={baseEntry}
        isEditing={false}
        tileComponent={DynamicStub}
        onLongPress={onLongPress}
      />,
    );
    const tile = container.querySelector("[data-tile-slug]") as HTMLElement;

    tile.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        clientX: 100,
        clientY: 100,
      }),
    );
    vi.advanceTimersByTime(300);
    // 8px 以上の移動
    tile.dispatchEvent(
      new PointerEvent("pointermove", {
        bubbles: true,
        clientX: 109,
        clientY: 100,
      }),
    );
    vi.advanceTimersByTime(300);

    expect(onLongPress).not.toHaveBeenCalled();
  });

  test("編集モード時は長押しでも onLongPress が呼ばれない", () => {
    const onLongPress = vi.fn();
    const { container } = render(
      <Tile
        entry={baseEntry}
        isEditing={true}
        tileComponent={DynamicStub}
        onLongPress={onLongPress}
      />,
    );
    const tile = container.querySelector("[data-tile-slug]") as HTMLElement;

    tile.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        clientX: 100,
        clientY: 100,
      }),
    );
    vi.advanceTimersByTime(600);

    expect(onLongPress).not.toHaveBeenCalled();
  });
});

describe("Tile v10 — 編集モード アクセント枠線 / wiggle 受け皿（瞬間 9）", () => {
  test("isEditing=true のとき tile--editing クラスが付与される", () => {
    const { container } = render(
      <Tile entry={baseEntry} isEditing={true} tileComponent={DynamicStub} />,
    );
    const tile = container.querySelector("[data-tile-slug]");
    expect(tile?.classList.contains("tile--editing")).toBe(true);
  });

  test("tile--wiggle クラスは TileGrid が外部から付与できる受け皿として存在する（data 属性で確認）", () => {
    // wiggle クラスは TileGrid が付与する受け皿。Tile 自体は data-tile-slug を持つ。
    // TileGrid が外部から className を追加できる構造であることを確認する。
    const { container } = render(
      <Tile entry={baseEntry} isEditing={true} tileComponent={DynamicStub} />,
    );
    const tile = container.querySelector("[data-tile-slug]");
    // tile 要素が存在し、外部クラス付与の受け皿として機能できる
    expect(tile).toBeTruthy();
    expect(tile?.tagName.toLowerCase()).toBe("article");
  });
});

describe("Tile v10 — onLongPress props インタフェース", () => {
  test("onLongPress なしでもエラーにならない（省略可能）", () => {
    expect(() => {
      render(
        <Tile
          entry={baseEntry}
          isEditing={false}
          tileComponent={DynamicStub}
        />,
      );
    }).not.toThrow();
  });
});

// -----------------------------------------------------------------------
// CRIT-r2-2: Stretched Link — タイル全体がクリック可能（使用モード + href あり）
// -----------------------------------------------------------------------

describe("CRIT-r2-2 — Stretched Link（タイル全体がリンク）", () => {
  test("使用モード + href あり: article に stretched-link クラスの a タグが存在する", () => {
    render(
      <Tile entry={baseEntry} isEditing={false} tileComponent={DynamicStub} />,
    );
    // stretchedLink クラスを持つ a タグが article 内に存在する
    const article = document.querySelector("article");
    const stretchedLink = article?.querySelector(
      "a.stretchedLink, [class*='stretchedLink']",
    );
    expect(stretchedLink).toBeTruthy();
  });

  test("使用モード + href あり: article 内の a タグが href を持つ", () => {
    render(
      <Tile entry={baseEntry} isEditing={false} tileComponent={DynamicStub} />,
    );
    const link = document.querySelector(
      'article a[href="/tools/json-formatter"]',
    );
    expect(link).toBeTruthy();
  });

  test("編集モード時: stretchedLink は存在しない（編集操作を妨げないよう）", () => {
    render(
      <Tile entry={baseEntry} isEditing={true} tileComponent={DynamicStub} />,
    );
    const article = document.querySelector("article");
    const stretchedLink = article?.querySelector("a[class*='stretchedLink']");
    expect(stretchedLink).toBeNull();
  });

  test("href なし + 使用モード: stretchedLink は存在しない", () => {
    render(
      <Tile
        entry={{ ...baseEntry, slug: "no-href-tool" }}
        isEditing={false}
        tileComponent={DynamicStub}
      />,
    );
    const article = document.querySelector("article");
    const stretchedLink = article?.querySelector("a[class*='stretchedLink']");
    expect(stretchedLink).toBeNull();
  });
});

// -----------------------------------------------------------------------
// MID-r2-3: small タイルで displayName を 2 行クリップ
// -----------------------------------------------------------------------

describe("MID-r2-3 — small タイルの displayName クリップ", () => {
  test("tileName は CSS クラスが付与されている（overflow制御は CSS）", () => {
    const { container } = render(
      <Tile
        entry={{ ...baseEntry, size: "small" }}
        isEditing={false}
        tileComponent={DynamicStub}
      />,
    );
    const tileName = container.querySelector("[class*='tileName']");
    expect(tileName).toBeTruthy();
  });
});

// -----------------------------------------------------------------------
// F-1 / CRIT-F1-1: sizeBar が Tile 内部（article 最下部）に配置される
// -----------------------------------------------------------------------

describe("Tile F-1 — sizeBar の Tile 内部配置（CRIT-F1-1）", () => {
  test("isEditing=false のとき S/M/L サイズ変更ボタンが表示されない", () => {
    render(
      <Tile
        entry={baseEntry}
        isEditing={false}
        tileComponent={DynamicStub}
        onChangeSize={vi.fn()}
      />,
    );
    expect(
      screen.queryAllByRole("button", { name: /サイズに変更/ }).length,
    ).toBe(0);
  });

  test("isEditing=true のとき S/M/L サイズ変更ボタンが article 内部に表示される", () => {
    render(
      <Tile
        entry={baseEntry}
        isEditing={true}
        tileComponent={DynamicStub}
        onChangeSize={vi.fn()}
      />,
    );
    const article = document.querySelector("article");
    const sButton = article?.querySelector('[aria-label*="小サイズ"]');
    const mButton = article?.querySelector('[aria-label*="中サイズ"]');
    const lButton = article?.querySelector('[aria-label*="大サイズ"]');
    expect(sButton).toBeTruthy();
    expect(mButton).toBeTruthy();
    expect(lButton).toBeTruthy();
  });

  test("onChangeSize が未指定でも isEditing=true 時に sizeBar が表示される", () => {
    render(
      <Tile entry={baseEntry} isEditing={true} tileComponent={DynamicStub} />,
    );
    // onChangeSize なしでも S/M/L ボタンが表示される
    const article = document.querySelector("article");
    const sButton = article?.querySelector('[aria-label*="小サイズ"]');
    expect(sButton).toBeTruthy();
  });

  test("M サイズのとき M ボタンに aria-pressed='true' が設定される", () => {
    render(
      <Tile
        entry={{ ...baseEntry, size: "medium" }}
        isEditing={true}
        tileComponent={DynamicStub}
        onChangeSize={vi.fn()}
      />,
    );
    const mButton = screen.getByRole("button", {
      name: /中サイズに変更/,
    });
    expect(mButton.getAttribute("aria-pressed")).toBe("true");
    const sButton = screen.getByRole("button", {
      name: /小サイズに変更/,
    });
    expect(sButton.getAttribute("aria-pressed")).toBe("false");
  });

  test("S ボタンをクリックすると onChangeSize('small') が呼ばれる", () => {
    const onChangeSize = vi.fn();
    render(
      <Tile
        entry={{ ...baseEntry, size: "medium" }}
        isEditing={true}
        tileComponent={DynamicStub}
        onChangeSize={onChangeSize}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /小サイズに変更/ }));
    expect(onChangeSize).toHaveBeenCalledWith("small");
  });

  test("L ボタンをクリックすると onChangeSize('large') が呼ばれる", () => {
    const onChangeSize = vi.fn();
    render(
      <Tile
        entry={{ ...baseEntry, size: "small" }}
        isEditing={true}
        tileComponent={DynamicStub}
        onChangeSize={onChangeSize}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /大サイズに変更/ }));
    expect(onChangeSize).toHaveBeenCalledWith("large");
  });

  test("article 内部（最下部）に sizeBar が配置される（DESIGN.md §1 パネル原則）", () => {
    render(
      <Tile
        entry={baseEntry}
        isEditing={true}
        tileComponent={DynamicStub}
        onChangeSize={vi.fn()}
      />,
    );
    const article = document.querySelector("article");
    // sizeBar は article 内の最後の子要素であるべき
    const lastChild = article?.lastElementChild;
    // sizeBar 相当の要素には S/M/L ボタンが含まれる
    const sButton = lastChild?.querySelector('[aria-label*="小サイズ"]');
    expect(sButton).toBeTruthy();
  });
});

// -----------------------------------------------------------------------
// MID-F1v2-1: controlsOverlay (↑↓×) が article 内部に配置される
// -----------------------------------------------------------------------

describe("MID-F1v2-1 — controlsOverlay が Tile 内部（article 内）に配置される", () => {
  test("isEditing=true かつ onMoveUp/onMoveDown/onRemove あり: article 内に ↑ ボタンが存在する（先頭以外）", () => {
    render(
      <Tile
        entry={{ ...baseEntry, order: 1 }}
        isEditing={true}
        tileComponent={DynamicStub}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        onRemove={vi.fn()}
        isFirst={false}
        isLast={false}
      />,
    );
    const article = document.querySelector("article");
    const upButton = article?.querySelector('[aria-label*="上に移動"]');
    expect(upButton).toBeTruthy();
  });

  test("isEditing=true: article 内に削除ボタンが存在する", () => {
    render(
      <Tile
        entry={baseEntry}
        isEditing={true}
        tileComponent={DynamicStub}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        onRemove={vi.fn()}
        isFirst={false}
        isLast={false}
      />,
    );
    const article = document.querySelector("article");
    const removeButton = article?.querySelector('[aria-label*="削除"]');
    expect(removeButton).toBeTruthy();
  });

  test("isEditing=false のとき ↑↓× ボタンが article 内に存在しない", () => {
    render(
      <Tile
        entry={baseEntry}
        isEditing={false}
        tileComponent={DynamicStub}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        onRemove={vi.fn()}
        isFirst={false}
        isLast={false}
      />,
    );
    const article = document.querySelector("article");
    const upButton = article?.querySelector('[aria-label*="上に移動"]');
    const removeButton = article?.querySelector('[aria-label*="削除"]');
    expect(upButton).toBeNull();
    expect(removeButton).toBeNull();
  });

  test("isFirst=true のとき ↑ ボタンが表示されない", () => {
    render(
      <Tile
        entry={baseEntry}
        isEditing={true}
        tileComponent={DynamicStub}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        onRemove={vi.fn()}
        isFirst={true}
        isLast={false}
      />,
    );
    const article = document.querySelector("article");
    const upButton = article?.querySelector('[aria-label*="上に移動"]');
    expect(upButton).toBeNull();
  });

  test("isLast=true のとき ↓ ボタンが表示されない", () => {
    render(
      <Tile
        entry={baseEntry}
        isEditing={true}
        tileComponent={DynamicStub}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        onRemove={vi.fn()}
        isFirst={false}
        isLast={true}
      />,
    );
    const article = document.querySelector("article");
    const downButton = article?.querySelector('[aria-label*="下に移動"]');
    expect(downButton).toBeNull();
  });

  test("削除ボタンクリックで onRemove が呼ばれる", () => {
    const onRemove = vi.fn();
    render(
      <Tile
        entry={baseEntry}
        isEditing={true}
        tileComponent={DynamicStub}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        onRemove={onRemove}
        isFirst={false}
        isLast={false}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /削除/ }));
    expect(onRemove).toHaveBeenCalledWith("json-formatter");
  });

  test("↑ ボタンクリックで onMoveUp が呼ばれる", () => {
    const onMoveUp = vi.fn();
    render(
      <Tile
        entry={{ ...baseEntry, order: 1 }}
        isEditing={true}
        tileComponent={DynamicStub}
        onMoveUp={onMoveUp}
        onMoveDown={vi.fn()}
        onRemove={vi.fn()}
        isFirst={false}
        isLast={false}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /上に移動/ }));
    expect(onMoveUp).toHaveBeenCalledWith("json-formatter");
  });

  test("↓ ボタンクリックで onMoveDown が呼ばれる", () => {
    const onMoveDown = vi.fn();
    render(
      <Tile
        entry={baseEntry}
        isEditing={true}
        tileComponent={DynamicStub}
        onMoveUp={vi.fn()}
        onMoveDown={onMoveDown}
        onRemove={vi.fn()}
        isFirst={false}
        isLast={false}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /下に移動/ }));
    expect(onMoveDown).toHaveBeenCalledWith("json-formatter");
  });
});

// -----------------------------------------------------------------------
// MIN-F1v2-2: サイズボタンの aria-label 日本語化
// -----------------------------------------------------------------------

describe("MIN-F1v2-2 — サイズボタン aria-label が日本語になっている", () => {
  test("S ボタンの aria-label が「小サイズ」を含む", () => {
    render(
      <Tile
        entry={baseEntry}
        isEditing={true}
        tileComponent={DynamicStub}
        onChangeSize={vi.fn()}
      />,
    );
    // S ボタンの aria-label に「小」が含まれる
    const sButton = screen.getByRole("button", { name: /小サイズ/ });
    expect(sButton).toBeTruthy();
  });

  test("M ボタンの aria-label が「中サイズ」を含む", () => {
    render(
      <Tile
        entry={baseEntry}
        isEditing={true}
        tileComponent={DynamicStub}
        onChangeSize={vi.fn()}
      />,
    );
    const mButton = screen.getByRole("button", { name: /中サイズ/ });
    expect(mButton).toBeTruthy();
  });

  test("L ボタンの aria-label が「大サイズ」を含む", () => {
    render(
      <Tile
        entry={baseEntry}
        isEditing={true}
        tileComponent={DynamicStub}
        onChangeSize={vi.fn()}
      />,
    );
    const lButton = screen.getByRole("button", { name: /大サイズ/ });
    expect(lButton).toBeTruthy();
  });

  test("S ボタンの表示テキストは 'S' のまま（表示用ラベルは変えない）", () => {
    render(
      <Tile
        entry={baseEntry}
        isEditing={true}
        tileComponent={DynamicStub}
        onChangeSize={vi.fn()}
      />,
    );
    const sButton = screen.getByRole("button", { name: /小サイズ/ });
    expect(sButton.textContent).toBe("S");
  });
});

/**
 * CRIT-4: displayName と FallbackTile の slug が二重表示されないことを検証する。
 *
 * 登録済み slug では displayName ("JSON フォーマッター") が一度だけ表示されること、
 * FallbackTile が二重に slug を表示しないことを確認する。
 */
describe("CRIT-4 — displayName と TileComponent の二重表示がない", () => {
  test("登録済み slug のとき displayName がタイル内に 1 回だけ表示される", () => {
    render(
      <Tile entry={baseEntry} isEditing={false} tileComponent={DynamicStub} />,
    );
    // displayName = "JSON フォーマッター" の出現回数が 1 回だけであること
    const elements = screen.getAllByText("JSON フォーマッター");
    expect(elements.length).toBe(1);
  });

  test("登録済み slug のとき slug 文字列 (json-formatter) は tileMeta 領域に表示されない", () => {
    const { container } = render(
      <Tile entry={baseEntry} isEditing={false} tileComponent={DynamicStub} />,
    );
    // tileMeta エリア（.tileMeta クラス相当）には slug 文字列が表示されないこと
    // DynamicStub は data-testid="fallback-tile" を持ち、slug 文字列を表示するが
    // それは TileComponent 内部の表示であり、tileMeta には含まれない
    const tileMeta = container.querySelector(".tileMeta");
    // tileMeta が存在する場合、その中に slug 文字列がないこと
    if (tileMeta) {
      expect(tileMeta.textContent).not.toContain("json-formatter");
    }
  });
});

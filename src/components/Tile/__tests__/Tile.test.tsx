/**
 * Tile コンポーネントのテスト
 *
 * テスト戦略:
 * - jsdom でレンダリング可能なロジック・DOM 構造・a11y のみをここで検証する
 * - CSS スタッキング・ドラッグ中の影適用・z-index の物理的検証は Playwright（AP-I09 準拠）
 * - useSortable は vi.mock でモックして DnD 環境不要にする
 *
 * edit モード時の content click ブロックについて:
 *   実機では CSS `pointer-events: none` により click イベント自体が発火しない。
 *   jsdom は pointer-events を評価しないため jsdom では発火する（実機と挙動が異なる）。
 *   この動作差異があるため、jsdom テストでは edit モードの click 不能を検証せず、
 *   view モードの正常系（click が届く）のみを検証する（AP-I09 準拠）。
 *   edit モードの click 不能は Playwright 実機テスト（2.2.10）で検証する。
 */

import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Tile from "../Tile";
import type { Tileable, TileDefinition } from "@/lib/toolbox/types";

// @dnd-kit/sortable の useSortable をモック（jsdom では DnD Context 不要にする）
// attributes に role: "button" を含めないこと：article 要素の implicit role を上書きしてしまうため
vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {
      "aria-disabled": false,
      "aria-roledescription": "sortable",
    },
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));

// @dnd-kit/utilities の CSS.Transform.toString をモック
vi.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: () => "",
    },
  },
}));

// フィクスチャ Tileable
const fixtureTileable: Tileable = {
  slug: "char-count",
  displayName: "文字数カウンター",
  shortDescription: "テキストの文字数を数えるツール",
  contentKind: "tool",
  publishedAt: "2026-01-01T00:00:00+09:00",
  trustLevel: "verified",
};

describe("Tile — 基本レンダリング", () => {
  test("displayName が描画される", () => {
    render(<Tile tileable={fixtureTileable} size="medium" mode="view" />);
    expect(screen.getByText("文字数カウンター")).toBeInTheDocument();
  });

  test("shortDescription が描画される", () => {
    render(<Tile tileable={fixtureTileable} size="medium" mode="view" />);
    expect(
      screen.getByText("テキストの文字数を数えるツール"),
    ).toBeInTheDocument();
  });

  test("size='small' のとき data-size='small' を持つ", () => {
    render(<Tile tileable={fixtureTileable} size="small" mode="view" />);
    const tile = screen.getByTestId("tile-char-count");
    expect(tile).toHaveAttribute("data-size", "small");
  });

  test("size='medium' のとき data-size='medium' を持つ", () => {
    render(<Tile tileable={fixtureTileable} size="medium" mode="view" />);
    const tile = screen.getByTestId("tile-char-count");
    expect(tile).toHaveAttribute("data-size", "medium");
  });

  test("size='large' のとき data-size='large' を持つ", () => {
    render(<Tile tileable={fixtureTileable} size="large" mode="view" />);
    const tile = screen.getByTestId("tile-char-count");
    expect(tile).toHaveAttribute("data-size", "large");
  });

  test("mode='view' のとき data-mode='view' を持つ", () => {
    render(<Tile tileable={fixtureTileable} size="medium" mode="view" />);
    const tile = screen.getByTestId("tile-char-count");
    expect(tile).toHaveAttribute("data-mode", "view");
  });

  test("mode='edit' のとき data-mode='edit' を持つ", () => {
    render(<Tile tileable={fixtureTileable} size="medium" mode="edit" />);
    const tile = screen.getByTestId("tile-char-count");
    expect(tile).toHaveAttribute("data-mode", "edit");
  });
});

describe("Tile — 編集モード UI", () => {
  test("mode='edit' のときドラッグハンドルが表示される", () => {
    render(<Tile tileable={fixtureTileable} size="medium" mode="edit" />);
    expect(screen.getByLabelText("ドラッグして移動")).toBeInTheDocument();
  });

  test("mode='view' のときドラッグハンドルが表示されない", () => {
    render(<Tile tileable={fixtureTileable} size="medium" mode="view" />);
    expect(screen.queryByLabelText("ドラッグして移動")).not.toBeInTheDocument();
  });

  test("mode='edit' のとき削除ボタンが表示される", () => {
    render(
      <Tile
        tileable={fixtureTileable}
        size="medium"
        mode="edit"
        onDelete={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "削除する" }),
    ).toBeInTheDocument();
  });

  test("mode='view' のとき削除ボタンが表示されない", () => {
    render(
      <Tile
        tileable={fixtureTileable}
        size="medium"
        mode="view"
        onDelete={vi.fn()}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "削除する" }),
    ).not.toBeInTheDocument();
  });
});

describe("Tile — 削除コールバック", () => {
  test("削除ボタンをクリックすると onDelete が呼ばれる", () => {
    const handleDelete = vi.fn();
    render(
      <Tile
        tileable={fixtureTileable}
        size="medium"
        mode="edit"
        onDelete={handleDelete}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "削除する" }));
    expect(handleDelete).toHaveBeenCalledTimes(1);
  });

  test("onDelete が未指定でも削除ボタンをクリックしてもエラーにならない", () => {
    render(<Tile tileable={fixtureTileable} size="medium" mode="edit" />);
    // onDelete なしで削除ボタンをクリックしてもエラーにならない
    expect(() =>
      fireEvent.click(screen.getByRole("button", { name: "削除する" })),
    ).not.toThrow();
  });
});

describe("Tile — コンテンツエリアクリック（view モード正常系）", () => {
  /**
   * edit モード時の click ブロックは CSS pointer-events: none で実現する。
   * jsdom は pointer-events を評価しないため edit モードの click 不能は jsdom では検証できない。
   * edit モード時の click 不能の実機検証は Playwright（2.2.10）で行う（AP-I09 準拠）。
   */
  test("mode='view' のとき、タイル内コンテンツへの onClick が呼ばれる", () => {
    const handleContentClick = vi.fn();
    render(
      <Tile
        tileable={fixtureTileable}
        size="medium"
        mode="view"
        onContentClick={handleContentClick}
      />,
    );
    const contentArea = screen.getByTestId("tile-content-char-count");
    fireEvent.click(contentArea);
    expect(handleContentClick).toHaveBeenCalledTimes(1);
  });
});

describe("Tile — a11y", () => {
  test("タイル要素が article ロールを持つ", () => {
    render(<Tile tileable={fixtureTileable} size="medium" mode="view" />);
    // Tile は article 要素でラップされる
    expect(
      screen.getByRole("article", { name: "文字数カウンター" }),
    ).toBeInTheDocument();
  });

  test("削除ボタンに aria-label がある", () => {
    render(
      <Tile
        tileable={fixtureTileable}
        size="medium"
        mode="edit"
        onDelete={vi.fn()}
      />,
    );
    const deleteBtn = screen.getByRole("button", { name: "削除する" });
    expect(deleteBtn).toHaveAttribute("aria-label", "削除する");
  });
});

describe("Tile — SIZE_SPAN マッピング", () => {
  test("SIZE_SPAN が各サイズに正しい span 値を持つ", async () => {
    const { SIZE_SPAN } = await import("../constants");
    expect(SIZE_SPAN.small).toBe(1);
    expect(SIZE_SPAN.medium).toBe(2);
    expect(SIZE_SPAN.large).toBe(3);
  });
});

describe("Tile — card-link（タイトルリンク）", () => {
  const tileableWithHref: Tileable = {
    ...fixtureTileable,
    href: "/tools/char-count",
  };

  test("view モードでタイトルが <a> リンクとして描画される", () => {
    render(<Tile tileable={tileableWithHref} size="medium" mode="view" />);
    const link = screen.getByRole("link", { name: "文字数カウンター" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/tools/char-count");
  });

  test("href 未指定時は slug からデフォルト URL（/tools/{slug}）を生成", () => {
    render(<Tile tileable={fixtureTileable} size="medium" mode="view" />);
    const link = screen.getByRole("link", { name: "文字数カウンター" });
    expect(link).toHaveAttribute("href", "/tools/char-count");
  });

  test("edit モードではタイトルリンク（<a> 要素）が描画されない", () => {
    render(<Tile tileable={tileableWithHref} size="medium" mode="edit" />);
    // edit モードでは <Link>（<a> 要素）が描画されないことを明示的に検証する
    expect(
      screen.queryByRole("link", { name: "文字数カウンター" }),
    ).not.toBeInTheDocument();
    // タイトルテキスト自体は span として表示される
    expect(screen.getByText("文字数カウンター")).toBeInTheDocument();
  });
});

describe("Tile — 移動ボタン（4 種）", () => {
  const moveProps = {
    isFirst: false,
    isLast: false,
    onMoveFirst: vi.fn(),
    onMovePrev: vi.fn(),
    onMoveNext: vi.fn(),
    onMoveLast: vi.fn(),
  };

  test("edit モードで 4 種の移動ボタンが描画される（medium）", () => {
    render(
      <Tile
        tileable={fixtureTileable}
        size="medium"
        mode="edit"
        {...moveProps}
      />,
    );
    expect(
      screen.getByRole("button", { name: "先頭へ移動" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "前へ移動" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "後へ移動" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "末尾へ移動" }),
    ).toBeInTheDocument();
  });

  test("view モードでは移動ボタンが描画されない", () => {
    render(
      <Tile
        tileable={fixtureTileable}
        size="medium"
        mode="view"
        {...moveProps}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "先頭へ移動" }),
    ).not.toBeInTheDocument();
  });

  test("isFirst=true のとき「先頭へ」「前へ」が disabled", () => {
    render(
      <Tile
        tileable={fixtureTileable}
        size="medium"
        mode="edit"
        {...moveProps}
        isFirst={true}
      />,
    );
    expect(screen.getByRole("button", { name: "先頭へ移動" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "前へ移動" })).toBeDisabled();
  });

  test("isLast=true のとき「後へ」「末尾へ」が disabled", () => {
    render(
      <Tile
        tileable={fixtureTileable}
        size="medium"
        mode="edit"
        {...moveProps}
        isLast={true}
      />,
    );
    expect(screen.getByRole("button", { name: "後へ移動" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "末尾へ移動" })).toBeDisabled();
  });

  test("small サイズ edit モードで展開トリガーが表示される", () => {
    render(
      <Tile
        tileable={fixtureTileable}
        size="small"
        mode="edit"
        {...moveProps}
      />,
    );
    expect(
      screen.getByRole("button", { name: "移動操作を展開" }),
    ).toBeInTheDocument();
  });

  test("コールバックが一部未渡しのとき TileMoveButtons が描画されない", () => {
    // N5: no-op fallback がエラー検出を阻害しないよう、
    // 4 つすべてが揃っている時のみ TileMoveButtons を描画する
    render(
      <Tile
        tileable={fixtureTileable}
        size="medium"
        mode="edit"
        onMoveFirst={vi.fn()}
        // onMovePrev を意図的に未渡し
        onMoveNext={vi.fn()}
        onMoveLast={vi.fn()}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "先頭へ移動" }),
    ).not.toBeInTheDocument();
  });

  test("コールバックが全部未渡しのとき TileMoveButtons が描画されない", () => {
    render(
      <Tile
        tileable={fixtureTileable}
        size="medium"
        mode="edit"
        // 移動コールバックをすべて未渡し
      />,
    );
    expect(
      screen.queryByRole("button", { name: "先頭へ移動" }),
    ).not.toBeInTheDocument();
  });
});

describe("Tile — variant によるタイル解決ロジック", () => {
  /** タイルコンポーネントのスタブ */
  function TileCompA({ tileable }: { tileable: Tileable }) {
    return (
      <div data-testid="tile-comp-a">{tileable.displayName} - variant A</div>
    );
  }
  function TileCompB({ tileable }: { tileable: Tileable }) {
    return (
      <div data-testid="tile-comp-b">{tileable.displayName} - variant B</div>
    );
  }

  const defA: TileDefinition = {
    id: "variant-a",
    component: TileCompA,
    recommendedSize: "medium",
    tileableAs: "full",
    label: "バリアント A",
  };
  const defB: TileDefinition = {
    id: "variant-b",
    component: TileCompB,
    recommendedSize: "small",
    tileableAs: "preview-only",
    label: "バリアント B",
  };

  const tileableWithArray: Tileable = {
    ...fixtureTileable,
    slug: "char-count-multi",
    tile: [defA, defB],
  };
  const tileableWithSingle: Tileable = {
    ...fixtureTileable,
    slug: "char-count-single",
    tile: defA,
  };

  test("tile が配列 + variant 一致 → 一致した TileDefinition のコンポーネントを描画", () => {
    render(
      <Tile
        tileable={tileableWithArray}
        size="medium"
        mode="view"
        variant="variant-b"
      />,
    );
    expect(screen.getByTestId("tile-comp-b")).toBeInTheDocument();
    expect(screen.queryByTestId("tile-comp-a")).not.toBeInTheDocument();
  });

  test("tile が配列 + variant 不一致 → tile[0] にフォールバック", () => {
    render(
      <Tile
        tileable={tileableWithArray}
        size="medium"
        mode="view"
        variant="no-such-variant"
      />,
    );
    expect(screen.getByTestId("tile-comp-a")).toBeInTheDocument();
    expect(screen.queryByTestId("tile-comp-b")).not.toBeInTheDocument();
  });

  test("tile が配列 + variant 未指定 → tile[0] を描画", () => {
    render(<Tile tileable={tileableWithArray} size="medium" mode="view" />);
    expect(screen.getByTestId("tile-comp-a")).toBeInTheDocument();
    expect(screen.queryByTestId("tile-comp-b")).not.toBeInTheDocument();
  });

  test("tile が単一 TileDefinition → variant に関係なくそのコンポーネントを描画", () => {
    render(
      <Tile
        tileable={tileableWithSingle}
        size="medium"
        mode="view"
        variant="variant-a"
      />,
    );
    expect(screen.getByTestId("tile-comp-a")).toBeInTheDocument();
  });

  test("tile が未定義 → TileFallback（shortDescription）を描画", () => {
    render(<Tile tileable={fixtureTileable} size="medium" mode="view" />);
    expect(
      screen.getByText(fixtureTileable.shortDescription),
    ).toBeInTheDocument();
  });
});

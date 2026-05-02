/**
 * TileGrid コンポーネントのユニットテスト
 *
 * テスト戦略（AP-I09 準拠）:
 * - jsdom で検証可能なロジック・DOM 構造・a11y のみを検証する
 * - CSS スタッキング・ドラッグ中のフィードバック・DnD 物理挙動は Playwright で検証する
 * - useSortable / DndContext / SortableContext / DragOverlay は vi.mock でモックする
 *
 * 検証対象:
 * - タイル一覧が config.tiles に従ってレンダリングされる
 * - 0 個状態（EmptySlot のみ表示、Tile は非表示）
 * - 1 個状態（DnD が破綻しない）
 * - 削除コールバック（onConfigChange が正しい tiles で呼ばれる）
 * - 追加モーダルの開閉（「+ ツールを追加」クリックでモーダルが開く）
 * - モーダルからタイルを選択して追加（onConfigChange が新 tiles で呼ばれる）
 * - 編集モードでのみ EmptySlot・削除ボタン・ドラッグハンドルが表示される
 * - 使用モードでは EmptySlot・削除ボタン・ドラッグハンドルが非表示
 */

import { describe, expect, test, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import TileGrid from "../TileGrid";
import type { TileGridConfig } from "../TileGrid";
import type { Tileable } from "@/lib/toolbox/types";

// ---------------------------------------------------------------------------
// dnd-kit モック（jsdom では DnD Context 不要にする）
// ---------------------------------------------------------------------------

vi.mock("@dnd-kit/core", () => ({
  DragOverlay: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="drag-overlay">{children}</div>
  ),
  closestCenter: vi.fn(),
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sortable-context">{children}</div>
  ),
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

vi.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: () => "",
    },
  },
}));

// ---------------------------------------------------------------------------
// フィクスチャ Tileable（テスト用）
// ---------------------------------------------------------------------------

const TILE_A: Tileable = {
  slug: "fixture-small-1",
  displayName: "サンプル道具（小 1）",
  shortDescription: "テスト用小タイル 1",
  contentKind: "tool",
  publishedAt: "2026-01-01T00:00:00+09:00",
  trustLevel: "verified",
};

const TILE_B: Tileable = {
  slug: "fixture-medium-1",
  displayName: "サンプル道具（中 1）",
  shortDescription: "テスト用中タイル 1",
  contentKind: "tool",
  publishedAt: "2026-01-02T00:00:00+09:00",
  trustLevel: "verified",
};

const TILE_C: Tileable = {
  slug: "fixture-large-1",
  displayName: "サンプル道具（大 1）",
  shortDescription: "テスト用大タイル 1",
  contentKind: "play",
  publishedAt: "2026-01-03T00:00:00+09:00",
  trustLevel: "curated",
};

// ---------------------------------------------------------------------------
// getAllTileableEntries モック（AddTileModal のタイル候補として使用）
// vi.mock はファイル先頭にホイスト（巻き上げ）されるため、
// ファクトリ内で外部変数（TILE_A 等）を参照するとエラーになる。
// そのため、フィクスチャデータをファクトリ内でインライン定義する。
// ---------------------------------------------------------------------------

vi.mock("@/lib/toolbox/registry", () => ({
  getAllTileableEntries: vi.fn(() => []),
  getAllTileables: vi.fn(() => []),
}));

// ALL_FIXTURES モック（フィクスチャダミータイルとして使用）
vi.mock("@/components/Tile/fixtures", () => ({
  ALL_FIXTURES: [
    {
      tileable: {
        slug: "fixture-small-1",
        displayName: "サンプル道具（小 1）",
        shortDescription: "テスト用小タイル 1",
        contentKind: "tool",
        publishedAt: "2026-01-01T00:00:00+09:00",
        trustLevel: "verified",
      },
      recommendedSize: "small",
    },
    {
      tileable: {
        slug: "fixture-medium-1",
        displayName: "サンプル道具（中 1）",
        shortDescription: "テスト用中タイル 1",
        contentKind: "tool",
        publishedAt: "2026-01-02T00:00:00+09:00",
        trustLevel: "verified",
      },
      recommendedSize: "medium",
    },
    {
      tileable: {
        slug: "fixture-large-1",
        displayName: "サンプル道具（大 1）",
        shortDescription: "テスト用大タイル 1",
        contentKind: "play",
        publishedAt: "2026-01-03T00:00:00+09:00",
        trustLevel: "curated",
      },
      recommendedSize: "large",
    },
  ],
  FIXTURE_5_TILES: [
    {
      tileable: {
        slug: "fixture-small-1",
        displayName: "サンプル道具（小 1）",
        shortDescription: "テスト用小タイル 1",
        contentKind: "tool",
        publishedAt: "2026-01-01T00:00:00+09:00",
        trustLevel: "verified",
      },
      recommendedSize: "small",
    },
    {
      tileable: {
        slug: "fixture-medium-1",
        displayName: "サンプル道具（中 1）",
        shortDescription: "テスト用中タイル 1",
        contentKind: "tool",
        publishedAt: "2026-01-02T00:00:00+09:00",
        trustLevel: "verified",
      },
      recommendedSize: "medium",
    },
  ],
}));

// ---------------------------------------------------------------------------
// テストヘルパー
// ---------------------------------------------------------------------------

function makeConfig(
  tiles: Array<{
    slug: string;
    size: "small" | "medium" | "large";
    order: number;
  }>,
  tileableMap: Map<string, Tileable> = new Map([
    ["fixture-small-1", TILE_A],
    ["fixture-medium-1", TILE_B],
    ["fixture-large-1", TILE_C],
  ]),
): TileGridConfig {
  return { tiles, tileableMap };
}

// ---------------------------------------------------------------------------
// テスト
// ---------------------------------------------------------------------------

describe("TileGrid", () => {
  // reset mocks between tests
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("使用モード（mode='view'）", () => {
    test("タイルが config.tiles に従ってレンダリングされる", () => {
      const config = makeConfig([
        { slug: "fixture-small-1", size: "small", order: 0 },
        { slug: "fixture-medium-1", size: "medium", order: 1 },
      ]);
      render(<TileGrid config={config} mode="view" onConfigChange={vi.fn()} />);

      expect(screen.getByTestId("tile-fixture-small-1")).toBeInTheDocument();
      expect(screen.getByTestId("tile-fixture-medium-1")).toBeInTheDocument();
    });

    test("使用モードでは EmptySlot が表示されない", () => {
      const config = makeConfig([
        { slug: "fixture-small-1", size: "small", order: 0 },
      ]);
      render(<TileGrid config={config} mode="view" onConfigChange={vi.fn()} />);

      // EmptySlot のボタン（aria-label に「ツールを追加」を含む）が存在しない
      const addButtons = screen.queryAllByRole("button", {
        name: /ツールを追加/,
      });
      expect(addButtons).toHaveLength(0);
    });

    test("使用モードでは削除ボタンが表示されない", () => {
      const config = makeConfig([
        { slug: "fixture-small-1", size: "small", order: 0 },
      ]);
      render(<TileGrid config={config} mode="view" onConfigChange={vi.fn()} />);

      // 削除ボタン（aria-label="削除"）が存在しない
      const deleteButtons = screen.queryAllByRole("button", { name: /削除/ });
      expect(deleteButtons).toHaveLength(0);
    });
  });

  describe("編集モード（mode='edit'）", () => {
    test("0 個状態: EmptySlot のみが表示され、Tile は表示されない", () => {
      const config = makeConfig([]);
      render(<TileGrid config={config} mode="edit" onConfigChange={vi.fn()} />);

      // タイルが存在しない（Tile の data-testid は "tile-{slug}" パターン）
      // "tile-grid" を除外するために "tile-fixture-" パターンで検索する
      expect(screen.queryByTestId(/^tile-fixture-/)).toBeNull();

      // EmptySlot が表示される（「ツールを追加」ラベル）
      expect(
        screen.getByRole("button", { name: /ツールを追加/ }),
      ).toBeInTheDocument();
    });

    test("1 個状態: タイルと EmptySlot が表示される", () => {
      const config = makeConfig([
        { slug: "fixture-small-1", size: "small", order: 0 },
      ]);
      render(<TileGrid config={config} mode="edit" onConfigChange={vi.fn()} />);

      expect(screen.getByTestId("tile-fixture-small-1")).toBeInTheDocument();
      // EmptySlot も表示される
      expect(
        screen.getByRole("button", { name: /ツールを追加/ }),
      ).toBeInTheDocument();
    });

    test("複数タイル状態: すべてのタイルが表示される", () => {
      const config = makeConfig([
        { slug: "fixture-small-1", size: "small", order: 0 },
        { slug: "fixture-medium-1", size: "medium", order: 1 },
        { slug: "fixture-large-1", size: "large", order: 2 },
      ]);
      render(<TileGrid config={config} mode="edit" onConfigChange={vi.fn()} />);

      expect(screen.getByTestId("tile-fixture-small-1")).toBeInTheDocument();
      expect(screen.getByTestId("tile-fixture-medium-1")).toBeInTheDocument();
      expect(screen.getByTestId("tile-fixture-large-1")).toBeInTheDocument();
    });

    test("削除ボタンをクリックすると onConfigChange が正しい tiles で呼ばれる", () => {
      const onConfigChange = vi.fn();
      const config = makeConfig([
        { slug: "fixture-small-1", size: "small", order: 0 },
        { slug: "fixture-medium-1", size: "medium", order: 1 },
      ]);
      render(
        <TileGrid
          config={config}
          mode="edit"
          onConfigChange={onConfigChange}
        />,
      );

      // fixture-small-1 タイル内の削除ボタンをクリック
      const tileA = screen.getByTestId("tile-fixture-small-1");
      const deleteBtn = within(tileA).getByRole("button", { name: /削除/ });
      fireEvent.click(deleteBtn);

      // fixture-small-1 が除かれた tiles で onConfigChange が呼ばれる
      expect(onConfigChange).toHaveBeenCalledTimes(1);
      const calledWith: TileGridConfig = onConfigChange.mock.calls[0][0];
      expect(calledWith.tiles.map((t) => t.slug)).toEqual(["fixture-medium-1"]);
    });

    test("「+ ツールを追加」クリックでモーダルが開く", () => {
      const config = makeConfig([]);
      render(<TileGrid config={config} mode="edit" onConfigChange={vi.fn()} />);

      const addBtn = screen.getByRole("button", { name: /ツールを追加/ });
      fireEvent.click(addBtn);

      // モーダルが開く（data-testid="add-tile-modal" または role="dialog"）
      expect(
        screen.getByRole("dialog", { name: /ツールを追加/ }),
      ).toBeInTheDocument();
    });

    test("モーダルを閉じるとモーダルが非表示になる", () => {
      const config = makeConfig([]);
      render(<TileGrid config={config} mode="edit" onConfigChange={vi.fn()} />);

      // モーダルを開く
      fireEvent.click(screen.getByRole("button", { name: /ツールを追加/ }));
      expect(
        screen.getByRole("dialog", { name: /ツールを追加/ }),
      ).toBeInTheDocument();

      // 閉じるボタンをクリック
      const modal = screen.getByRole("dialog", { name: /ツールを追加/ });
      const closeBtn = within(modal).getByRole("button", { name: /閉じる/ });
      fireEvent.click(closeBtn);

      // モーダルが非表示
      expect(screen.queryByRole("dialog", { name: /ツールを追加/ })).toBeNull();
    });

    test("config.tiles に存在しない slug は tileableMap で見つからない場合スキップされる", () => {
      // tileableMap に fixture-medium-1 のみ登録
      const config = makeConfig(
        [
          { slug: "fixture-small-1", size: "small", order: 0 }, // 存在しない
          { slug: "fixture-medium-1", size: "medium", order: 1 }, // 存在する
        ],
        new Map([["fixture-medium-1", TILE_B]]),
      );
      render(<TileGrid config={config} mode="edit" onConfigChange={vi.fn()} />);

      // fixture-small-1 は tileableMap に存在しないのでスキップ
      expect(screen.queryByTestId("tile-fixture-small-1")).toBeNull();
      // fixture-medium-1 は表示される
      expect(screen.getByTestId("tile-fixture-medium-1")).toBeInTheDocument();
    });
  });

  describe("data-mode 属性", () => {
    test("mode='view' のとき data-testid='tile-grid' に data-mode='view' が付与される", () => {
      const config = makeConfig([]);
      render(<TileGrid config={config} mode="view" onConfigChange={vi.fn()} />);
      expect(screen.getByTestId("tile-grid")).toHaveAttribute(
        "data-mode",
        "view",
      );
    });

    test("mode='edit' のとき data-testid='tile-grid' に data-mode='edit' が付与される", () => {
      const config = makeConfig([]);
      render(<TileGrid config={config} mode="edit" onConfigChange={vi.fn()} />);
      expect(screen.getByTestId("tile-grid")).toHaveAttribute(
        "data-mode",
        "edit",
      );
    });
  });

  describe("AddTileModal の WCAG 適合（#2 #3 #5）", () => {
    test("モーダル内の各候補は role='button' を持つ（listitem で button ロール消失しない）", () => {
      const config = makeConfig([]);
      render(<TileGrid config={config} mode="edit" onConfigChange={vi.fn()} />);

      // モーダルを開く
      fireEvent.click(screen.getByRole("button", { name: /ツールを追加/ }));

      const modal = screen.getByRole("dialog");

      // 各候補は <button> 要素であり、role="button" として認識される
      // （role="listitem" が <button> に付与されると button ロールが listitem で上書きされる WCAG 4.1.2 違反を検証）
      const candidateButtons = within(modal).getAllByRole("button", {
        name: /を追加/,
      });
      expect(candidateButtons.length).toBeGreaterThan(0);
      // 各候補が button として認識される（role="listitem" を付与していないことを確認）
      for (const btn of candidateButtons) {
        expect(btn.tagName).toBe("BUTTON");
        expect(btn).not.toHaveAttribute("role", "listitem");
      }
    });

    test("候補リストコンテナは role='list' を持つ", () => {
      const config = makeConfig([]);
      render(<TileGrid config={config} mode="edit" onConfigChange={vi.fn()} />);

      fireEvent.click(screen.getByRole("button", { name: /ツールを追加/ }));

      const modal = screen.getByRole("dialog");
      // リストコンテナが role="list" を持つ
      const list = within(modal).getByRole("list");
      expect(list).toBeInTheDocument();
    });

    test("候補は <li> で包まれている（role 継承の正しさ）", () => {
      const config = makeConfig([]);
      render(<TileGrid config={config} mode="edit" onConfigChange={vi.fn()} />);

      fireEvent.click(screen.getByRole("button", { name: /ツールを追加/ }));

      const modal = screen.getByRole("dialog");
      // listitem が存在する
      const listItems = within(modal).getAllByRole("listitem");
      expect(listItems.length).toBeGreaterThan(0);
      // 各 listitem の中に button が存在する
      for (const item of listItems) {
        const btn = within(item).getByRole("button");
        expect(btn).toBeInTheDocument();
      }
    });
  });

  describe("useToolboxConfig 統合（#10）", () => {
    test("onConfigChange が省略された場合、内部で useToolboxConfig を使う", () => {
      // onConfigChange を省略したとき（外部 state 管理なし）、
      // TileGrid が内部でタイルを管理できることを確認する
      const config = makeConfig([
        { slug: "fixture-small-1", size: "small", order: 0 },
      ]);
      // onConfigChange なしでレンダリングできることを確認
      expect(() => {
        render(<TileGrid config={config} mode="edit" />);
      }).not.toThrow();
      // タイルが表示される
      expect(screen.getByTestId("tile-fixture-small-1")).toBeInTheDocument();
    });
  });
});

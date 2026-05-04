/**
 * TileGrid コンポーネントのユニットテスト（C-2 v10）
 *
 * カバレッジ目標:
 * - タイル描画（tiles 配列に対応した Tile が描画される）
 * - 編集モード / 使用モード切替（isEditing フラグ）
 * - ↑↓ ボタンクリックで順序が変わる（onChangeTiles が呼ばれる）
 * - 削除ボタンクリックで onRemoveTile が呼ばれる
 * - 空配列のとき何も描画しない
 * - 揺れアニメクラス（tile--wiggle）が編集モード時に Tile に付与される（v10）
 * - onLongPress props が存在する（v10）
 * - autoScroll が DndContext に渡される（v10 瞬間 43）
 *
 * テスト方針:
 * - @dnd-kit はモックして DnD 操作を単純化する
 * - Tile コンポーネントはモックして描画を簡略化する
 * - getTileComponent / getTileableBySlug はモックする
 */

import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import type { TileLayoutEntry } from "../storage";

// @dnd-kit/core をモック
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({
    children,
    onDragEnd,
    autoScroll,
  }: {
    children: React.ReactNode;
    onDragEnd?: (event: unknown) => void;
    autoScroll?: boolean;
  }) => {
    // onDragEnd / autoScroll を data-testid 経由でテストから観測できるようにしておく
    return React.createElement(
      "div",
      {
        "data-testid": "dnd-context",
        "data-on-drag-end": onDragEnd ? "true" : "false",
        "data-auto-scroll": autoScroll ? "true" : "false",
      },
      children,
    );
  },
  PointerSensor: class PointerSensor {},
  KeyboardSensor: class KeyboardSensor {},
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  closestCenter: vi.fn(),
}));

// @dnd-kit/sortable をモック
vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "sortable-context" }, children),
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
  sortableKeyboardCoordinates: vi.fn(),
  verticalListSortingStrategy: "verticalListSortingStrategy",
  arrayMove: vi.fn((arr: unknown[], from: number, to: number) => {
    const newArr = [...arr] as typeof arr;
    const [moved] = newArr.splice(from, 1);
    newArr.splice(to, 0, moved);
    return newArr;
  }),
}));

// Tile コンポーネントをモック（F-1: onChangeSize を受け取り S/M/L ボタンを描画）
vi.mock("../Tile", () => ({
  Tile: ({
    entry,
    isEditing,
    className,
    onChangeSize,
  }: {
    entry: TileLayoutEntry;
    isEditing: boolean;
    className?: string;
    onChangeSize?: (size: TileLayoutEntry["size"]) => void;
  }) => {
    // getTileableBySlug はモック済み。ここではテスト用マップで直接引く
    const nameMap: Record<string, string> = {
      "tool-a": "ツールA",
      "tool-b": "ツールB",
      "tool-c": "ツールC",
    };
    const displayName = nameMap[entry.slug] ?? entry.slug;
    return React.createElement(
      "div",
      {
        "data-testid": `tile-${entry.slug}`,
        "data-slug": entry.slug,
        "data-editing": isEditing ? "true" : "false",
        className: className ?? "",
      },
      entry.slug,
      // 編集モード時のみ S/M/L ボタンを描画（CRIT-F1-1 移行後の構造を反映）
      isEditing &&
        React.createElement(
          "div",
          { "aria-label": `${displayName}のサイズ変更` },
          (["small", "medium", "large"] as const).map((v) =>
            React.createElement(
              "button",
              {
                key: v,
                type: "button",
                "aria-label": `${displayName}を ${v === "small" ? "S" : v === "medium" ? "M" : "L"} サイズに変更`,
                "aria-pressed": entry.size === v ? "true" : "false",
                onClick: () => onChangeSize?.(v),
              },
              v === "small" ? "S" : v === "medium" ? "M" : "L",
            ),
          ),
        ),
    );
  },
}));

// CSS モジュールのモック
vi.mock("../TileGrid.module.css", () => ({
  default: {
    grid: "grid",
    sortableItem: "sortableItem",
    sortableItemDragging: "sortableItemDragging",
    controlsOverlay: "controlsOverlay",
    moveButton: "moveButton",
    removeButton: "removeButton",
    announcer: "announcer",
    wiggle: "wiggle",
  },
}));

// getTileComponent をモック
vi.mock("../tile-loader", () => ({
  getTileComponent: vi.fn(() => () => null),
}));

// getTileableBySlug をモック
vi.mock("../registry", () => ({
  getTileableBySlug: vi.fn((slug: string) => {
    const map: Record<
      string,
      { slug: string; displayName: string; shortDescription: string }
    > = {
      "tool-a": {
        slug: "tool-a",
        displayName: "ツールA",
        shortDescription: "ツールAの説明",
      },
      "tool-b": {
        slug: "tool-b",
        displayName: "ツールB",
        shortDescription: "ツールBの説明",
      },
      "tool-c": {
        slug: "tool-c",
        displayName: "ツールC",
        shortDescription: "ツールCの説明",
      },
    };
    return map[slug] ?? undefined;
  }),
}));

// モックセットアップ後にインポート
const { TileGrid } = await import("../TileGrid");

// テスト用タイルデータ
const makeTiles = (): TileLayoutEntry[] => [
  { slug: "tool-a", size: "small", order: 0 },
  { slug: "tool-b", size: "small", order: 1 },
  { slug: "tool-c", size: "small", order: 2 },
];

describe("TileGrid — タイル描画", () => {
  test("tiles 配列に対応した Tile が描画される", () => {
    const tiles = makeTiles();
    render(
      <TileGrid
        tiles={tiles}
        isEditing={false}
        onChangeTiles={vi.fn()}
        onRemoveTile={vi.fn()}
      />,
    );
    expect(screen.getByTestId("tile-tool-a")).toBeTruthy();
    expect(screen.getByTestId("tile-tool-b")).toBeTruthy();
    expect(screen.getByTestId("tile-tool-c")).toBeTruthy();
  });

  test("空配列のとき何も描画しない", () => {
    const { container } = render(
      <TileGrid
        tiles={[]}
        isEditing={false}
        onChangeTiles={vi.fn()}
        onRemoveTile={vi.fn()}
      />,
    );
    // Tile のモックが描画されないことを確認
    expect(container.querySelectorAll("[data-testid^='tile-']").length).toBe(0);
  });
});

describe("TileGrid — 編集モード / 使用モード切替", () => {
  test("isEditing=false のとき Tile に isEditing=false が渡される", () => {
    const tiles = makeTiles();
    render(
      <TileGrid
        tiles={tiles}
        isEditing={false}
        onChangeTiles={vi.fn()}
        onRemoveTile={vi.fn()}
      />,
    );
    const tileA = screen.getByTestId("tile-tool-a");
    expect(tileA.getAttribute("data-editing")).toBe("false");
  });

  test("isEditing=true のとき Tile に isEditing=true が渡される", () => {
    const tiles = makeTiles();
    render(
      <TileGrid
        tiles={tiles}
        isEditing={true}
        onChangeTiles={vi.fn()}
        onRemoveTile={vi.fn()}
      />,
    );
    const tileA = screen.getByTestId("tile-tool-a");
    expect(tileA.getAttribute("data-editing")).toBe("true");
  });

  test("isEditing=false のとき ↑↓ ボタンが表示されない", () => {
    const tiles = makeTiles();
    render(
      <TileGrid
        tiles={tiles}
        isEditing={false}
        onChangeTiles={vi.fn()}
        onRemoveTile={vi.fn()}
      />,
    );
    // ↑ボタンがないことを確認（aria-label に「上に移動」を含む）
    expect(screen.queryAllByRole("button", { name: /上に移動/ }).length).toBe(
      0,
    );
  });

  test("isEditing=true のとき ↑↓ ボタンが表示される", () => {
    const tiles = makeTiles();
    render(
      <TileGrid
        tiles={tiles}
        isEditing={true}
        onChangeTiles={vi.fn()}
        onRemoveTile={vi.fn()}
      />,
    );
    // tiles が 3 つある場合 ↑ ボタンが存在する
    const upButtons = screen.queryAllByRole("button", { name: /上に移動/ });
    expect(upButtons.length).toBeGreaterThan(0);
  });

  test("isEditing=false のとき 削除ボタンが表示されない", () => {
    const tiles = makeTiles();
    render(
      <TileGrid
        tiles={tiles}
        isEditing={false}
        onChangeTiles={vi.fn()}
        onRemoveTile={vi.fn()}
      />,
    );
    expect(screen.queryAllByRole("button", { name: /削除/ }).length).toBe(0);
  });

  test("isEditing=true のとき 削除ボタンが表示される", () => {
    const tiles = makeTiles();
    render(
      <TileGrid
        tiles={tiles}
        isEditing={true}
        onChangeTiles={vi.fn()}
        onRemoveTile={vi.fn()}
      />,
    );
    const removeButtons = screen.queryAllByRole("button", { name: /削除/ });
    expect(removeButtons.length).toBe(tiles.length);
  });
});

describe("TileGrid — ↑↓ ボタンクリック", () => {
  test("2 番目のタイルの ↑ ボタンをクリックすると onChangeTiles が呼ばれる", () => {
    const tiles = makeTiles();
    const onChangeTiles = vi.fn();
    render(
      <TileGrid
        tiles={tiles}
        isEditing={true}
        onChangeTiles={onChangeTiles}
        onRemoveTile={vi.fn()}
      />,
    );
    // ツールBの「↑ ボタン」を探す（aria-label: "ツールBを上に移動"）
    const upButton = screen.getByRole("button", { name: "ツールBを上に移動" });
    fireEvent.click(upButton);
    expect(onChangeTiles).toHaveBeenCalledTimes(1);
    // 呼ばれた引数を確認: tool-a と tool-b が入れ替わっている
    const newTiles = onChangeTiles.mock.calls[0][0] as TileLayoutEntry[];
    expect(newTiles[0].slug).toBe("tool-b");
    expect(newTiles[1].slug).toBe("tool-a");
  });

  test("先頭タイルには ↑ ボタンがない（境界条件）", () => {
    const tiles = makeTiles();
    render(
      <TileGrid
        tiles={tiles}
        isEditing={true}
        onChangeTiles={vi.fn()}
        onRemoveTile={vi.fn()}
      />,
    );
    // ツールA（先頭）には ↑ ボタンがない
    const upButtonA = screen.queryByRole("button", {
      name: "ツールAを上に移動",
    });
    expect(upButtonA).toBeNull();
  });

  test("末尾タイルには ↓ ボタンがない（境界条件）", () => {
    const tiles = makeTiles();
    render(
      <TileGrid
        tiles={tiles}
        isEditing={true}
        onChangeTiles={vi.fn()}
        onRemoveTile={vi.fn()}
      />,
    );
    // ツールC（末尾）には ↓ ボタンがない
    const downButtonC = screen.queryByRole("button", {
      name: "ツールCを下に移動",
    });
    expect(downButtonC).toBeNull();
  });

  test("2 番目のタイルの ↓ ボタンをクリックすると onChangeTiles が呼ばれる", () => {
    const tiles = makeTiles();
    const onChangeTiles = vi.fn();
    render(
      <TileGrid
        tiles={tiles}
        isEditing={true}
        onChangeTiles={onChangeTiles}
        onRemoveTile={vi.fn()}
      />,
    );
    // ツールBの「↓ ボタン」を探す（aria-label: "ツールBを下に移動"）
    const downButton = screen.getByRole("button", {
      name: "ツールBを下に移動",
    });
    fireEvent.click(downButton);
    expect(onChangeTiles).toHaveBeenCalledTimes(1);
    // tool-b と tool-c が入れ替わっている
    const newTiles = onChangeTiles.mock.calls[0][0] as TileLayoutEntry[];
    expect(newTiles[1].slug).toBe("tool-c");
    expect(newTiles[2].slug).toBe("tool-b");
  });
});

describe("TileGrid — 削除ボタンクリック", () => {
  test("ツールAの削除ボタンをクリックすると onRemoveTile('tool-a') が呼ばれる", () => {
    const tiles = makeTiles();
    const onRemoveTile = vi.fn();
    render(
      <TileGrid
        tiles={tiles}
        isEditing={true}
        onChangeTiles={vi.fn()}
        onRemoveTile={onRemoveTile}
      />,
    );
    const removeButton = screen.getByRole("button", { name: "ツールAを削除" });
    fireEvent.click(removeButton);
    expect(onRemoveTile).toHaveBeenCalledWith("tool-a");
  });

  test("削除ボタンのクリックで onChangeTiles は呼ばれない", () => {
    const tiles = makeTiles();
    const onChangeTiles = vi.fn();
    const onRemoveTile = vi.fn();
    render(
      <TileGrid
        tiles={tiles}
        isEditing={true}
        onChangeTiles={onChangeTiles}
        onRemoveTile={onRemoveTile}
      />,
    );
    const removeButton = screen.getByRole("button", { name: "ツールAを削除" });
    fireEvent.click(removeButton);
    expect(onChangeTiles).not.toHaveBeenCalled();
  });
});

describe("TileGrid — aria-live 通知", () => {
  test("aria-live='polite' 領域が存在する", () => {
    const tiles = makeTiles();
    const { container } = render(
      <TileGrid
        tiles={tiles}
        isEditing={true}
        onChangeTiles={vi.fn()}
        onRemoveTile={vi.fn()}
      />,
    );
    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeTruthy();
  });
});

describe("TileGrid — v10 仕様: onLongPress props", () => {
  test("onLongPress props を受け付ける（型確認）", () => {
    const tiles = makeTiles();
    const onLongPress = vi.fn();
    // onLongPress を渡してもエラーなく描画できる
    render(
      <TileGrid
        tiles={tiles}
        isEditing={false}
        onChangeTiles={vi.fn()}
        onRemoveTile={vi.fn()}
        onLongPress={onLongPress}
      />,
    );
    expect(screen.getByTestId("tile-tool-a")).toBeTruthy();
  });

  test("onLongPress を渡さなくても正常に描画される（optional）", () => {
    const tiles = makeTiles();
    render(
      <TileGrid
        tiles={tiles}
        isEditing={false}
        onChangeTiles={vi.fn()}
        onRemoveTile={vi.fn()}
      />,
    );
    expect(screen.getByTestId("tile-tool-a")).toBeTruthy();
  });
});

describe("TileGrid — v10 仕様: 揺れアニメクラス（瞬間 9）", () => {
  test("編集モード時に各 Tile に wiggle クラスが付与される", () => {
    const tiles = makeTiles();
    render(
      <TileGrid
        tiles={tiles}
        isEditing={true}
        onChangeTiles={vi.fn()}
        onRemoveTile={vi.fn()}
      />,
    );
    // モックの Tile は className を受け取って data-editing に関係なく className 属性に設定する
    const tileA = screen.getByTestId("tile-tool-a");
    expect(tileA.className).toContain("wiggle");
  });

  test("使用モード時は Tile に wiggle クラスが付与されない", () => {
    const tiles = makeTiles();
    render(
      <TileGrid
        tiles={tiles}
        isEditing={false}
        onChangeTiles={vi.fn()}
        onRemoveTile={vi.fn()}
      />,
    );
    const tileA = screen.getByTestId("tile-tool-a");
    expect(tileA.className).not.toContain("wiggle");
  });
});

describe("TileGrid — v10 仕様: autoScroll（瞬間 43）", () => {
  test("編集モード時の DndContext に autoScroll が渡される", () => {
    const tiles = makeTiles();
    const { container } = render(
      <TileGrid
        tiles={tiles}
        isEditing={true}
        onChangeTiles={vi.fn()}
        onRemoveTile={vi.fn()}
      />,
    );
    const dndContext = container.querySelector('[data-testid="dnd-context"]');
    expect(dndContext).toBeTruthy();
    expect(dndContext?.getAttribute("data-auto-scroll")).toBe("true");
  });
});

// ---------------------------------------------------------------------------
// F-1: タイルサイズ変更 UI
// ---------------------------------------------------------------------------

describe("TileGrid — F-1: サイズ変更ボタン", () => {
  test("isEditing=false のとき S/M/L ボタンが表示されない", () => {
    const tiles = makeTiles();
    render(
      <TileGrid
        tiles={tiles}
        isEditing={false}
        onChangeTiles={vi.fn()}
        onRemoveTile={vi.fn()}
      />,
    );
    // S/M/L サイズ変更ボタンが存在しない（aria-label にサイズ変更が含まれる）
    expect(
      screen.queryAllByRole("button", { name: /サイズに変更/ }).length,
    ).toBe(0);
  });

  test("isEditing=true のとき 各タイルに S/M/L サイズ変更ボタンが表示される", () => {
    const tiles = makeTiles();
    render(
      <TileGrid
        tiles={tiles}
        isEditing={true}
        onChangeTiles={vi.fn()}
        onRemoveTile={vi.fn()}
      />,
    );
    // tool-a（small）の S/M/L ボタンが存在する
    expect(
      screen.getByRole("button", { name: "ツールAを S サイズに変更" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "ツールAを M サイズに変更" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "ツールAを L サイズに変更" }),
    ).toBeTruthy();
  });

  test("現在の size のボタンに aria-pressed='true' が設定される", () => {
    const tiles: TileLayoutEntry[] = [
      { slug: "tool-a", size: "medium", order: 0 },
    ];
    render(
      <TileGrid
        tiles={tiles}
        isEditing={true}
        onChangeTiles={vi.fn()}
        onRemoveTile={vi.fn()}
      />,
    );
    // medium が現在 size: aria-pressed="true"
    const mButton = screen.getByRole("button", {
      name: "ツールAを M サイズに変更",
    });
    expect(mButton.getAttribute("aria-pressed")).toBe("true");
    // small / large は aria-pressed="false"
    const sButton = screen.getByRole("button", {
      name: "ツールAを S サイズに変更",
    });
    expect(sButton.getAttribute("aria-pressed")).toBe("false");
    const lButton = screen.getByRole("button", {
      name: "ツールAを L サイズに変更",
    });
    expect(lButton.getAttribute("aria-pressed")).toBe("false");
  });

  test("S ボタンをクリックすると onChangeTiles が呼ばれ size が 'small' になる", () => {
    const tiles: TileLayoutEntry[] = [
      { slug: "tool-a", size: "medium", order: 0 },
      { slug: "tool-b", size: "small", order: 1 },
    ];
    const onChangeTiles = vi.fn();
    render(
      <TileGrid
        tiles={tiles}
        isEditing={true}
        onChangeTiles={onChangeTiles}
        onRemoveTile={vi.fn()}
      />,
    );
    const sButton = screen.getByRole("button", {
      name: "ツールAを S サイズに変更",
    });
    fireEvent.click(sButton);
    expect(onChangeTiles).toHaveBeenCalledTimes(1);
    const newTiles = onChangeTiles.mock.calls[0][0] as TileLayoutEntry[];
    const updatedTileA = newTiles.find((t) => t.slug === "tool-a");
    expect(updatedTileA?.size).toBe("small");
  });

  test("L ボタンをクリックすると onChangeTiles が呼ばれ size が 'large' になる", () => {
    const tiles: TileLayoutEntry[] = [
      { slug: "tool-a", size: "small", order: 0 },
    ];
    const onChangeTiles = vi.fn();
    render(
      <TileGrid
        tiles={tiles}
        isEditing={true}
        onChangeTiles={onChangeTiles}
        onRemoveTile={vi.fn()}
      />,
    );
    const lButton = screen.getByRole("button", {
      name: "ツールAを L サイズに変更",
    });
    fireEvent.click(lButton);
    expect(onChangeTiles).toHaveBeenCalledTimes(1);
    const newTiles = onChangeTiles.mock.calls[0][0] as TileLayoutEntry[];
    const updatedTileA = newTiles.find((t) => t.slug === "tool-a");
    expect(updatedTileA?.size).toBe("large");
  });

  test("現在と同じ size のボタンをクリックしても onChangeTiles が呼ばれない（no-op / MIN-F1-3）", () => {
    const tiles: TileLayoutEntry[] = [
      { slug: "tool-a", size: "small", order: 0 },
    ];
    const onChangeTiles = vi.fn();
    render(
      <TileGrid
        tiles={tiles}
        isEditing={true}
        onChangeTiles={onChangeTiles}
        onRemoveTile={vi.fn()}
      />,
    );
    // small が現在の size なので S ボタン（aria-pressed=true）をクリック
    const sButton = screen.getByRole("button", {
      name: "ツールAを S サイズに変更",
    });
    fireEvent.click(sButton);
    // 同 size 再選択は no-op: onChangeTiles は呼ばれない（localStorage 無駄書き込み防止）
    expect(onChangeTiles).not.toHaveBeenCalled();
  });

  test("onChangeSize が onChangeTiles（F-1 コールバック）経由で他タイルの size を変更しない", () => {
    const tiles: TileLayoutEntry[] = [
      { slug: "tool-a", size: "small", order: 0 },
      { slug: "tool-b", size: "medium", order: 1 },
    ];
    const onChangeTiles = vi.fn();
    render(
      <TileGrid
        tiles={tiles}
        isEditing={true}
        onChangeTiles={onChangeTiles}
        onRemoveTile={vi.fn()}
      />,
    );
    const lButton = screen.getByRole("button", {
      name: "ツールAを L サイズに変更",
    });
    fireEvent.click(lButton);
    const newTiles = onChangeTiles.mock.calls[0][0] as TileLayoutEntry[];
    // tool-b は medium のまま
    expect(newTiles.find((t) => t.slug === "tool-b")?.size).toBe("medium");
  });
});

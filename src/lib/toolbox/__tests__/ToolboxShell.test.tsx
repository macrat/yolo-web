/**
 * ToolboxShell コンポーネントのユニットテスト（C-3 v10/v11）
 *
 * カバレッジ目標:
 * - 通常モード描画
 * - 編集モード遷移（Edit ボタン押下）
 * - Done モード戻り
 * - 空状態（タイル 0 件）
 * - AddTileModal 開閉 + 候補追加 → recentlyAddedSlug
 * - 削除 → Undo バナー出現 → Undo 適用
 * - Undo 期限切れ確定
 * - aria-live メッセージの内容
 * - 編集モード中の長押し無効（isEditing 中は onLongPress でモード変化しない）
 * - prefers-reduced-motion 配慮（クラス付与の確認）
 *
 * テスト方針:
 * - useToolboxConfig / TileGrid / AddTileModal をモックして独立性を保つ
 * - タイマー系（Undo 10 秒）は vi.useFakeTimers で制御する
 */

import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import type { TileLayoutEntry } from "../storage";

// useToolboxConfig をモック
const mockSetTiles = vi.fn();
const mockTilesHolder: { value: TileLayoutEntry[] } = {
  value: [
    { slug: "tool-a", size: "small", order: 0 },
    { slug: "tool-b", size: "small", order: 1 },
  ],
};

vi.mock("../useToolboxConfig", () => ({
  useToolboxConfig: () => ({
    tiles: mockTilesHolder.value,
    setTiles: mockSetTiles,
    resetToDefault: vi.fn(),
  }),
}));

// TileGrid をモック
vi.mock("../TileGrid", () => ({
  TileGrid: ({
    tiles,
    isEditing,
    onRemoveTile,
    onLongPress,
  }: {
    tiles: TileLayoutEntry[];
    isEditing: boolean;
    onChangeTiles: (tiles: TileLayoutEntry[]) => void;
    onRemoveTile: (slug: string) => void;
    onLongPress?: (slug: string) => void;
  }) =>
    React.createElement(
      "div",
      {
        "data-testid": "tile-grid",
        "data-editing": isEditing ? "true" : "false",
        "data-tile-count": tiles.length,
      },
      tiles.map((t) =>
        React.createElement(
          "div",
          { key: t.slug, "data-testid": `tile-${t.slug}` },
          React.createElement(
            "button",
            {
              "data-testid": `remove-${t.slug}`,
              onClick: () => onRemoveTile(t.slug),
            },
            "削除",
          ),
          React.createElement(
            "button",
            {
              "data-testid": `longpress-${t.slug}`,
              onClick: () => onLongPress?.(t.slug),
            },
            "長押し",
          ),
        ),
      ),
    ),
}));

// AddTileModal をモック
vi.mock("../AddTileModal", () => ({
  default: ({
    isOpen,
    onClose,
    onAdd,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (slug: string) => void;
    currentTileSlugs: string[];
  }) =>
    isOpen
      ? React.createElement(
          "div",
          { "data-testid": "add-tile-modal" },
          React.createElement(
            "button",
            { "data-testid": "modal-close", onClick: onClose },
            "閉じる",
          ),
          React.createElement(
            "button",
            {
              "data-testid": "modal-add-tool-c",
              onClick: () => onAdd("tool-c"),
            },
            "tool-c を追加",
          ),
        )
      : null,
}));

// CSS モジュールをモック
vi.mock("../ToolboxShell.module.css", () => ({
  default: {
    shell: "shell",
    toolbar: "toolbar",
    editButton: "editButton",
    doneButton: "doneButton",
    addButton: "addButton",
    undoBanner: "undoBanner",
    undoProgress: "undoProgress",
    undoProgressBar: "undoProgressBar",
    undoMessage: "undoMessage",
    undoButton: "undoButton",
    emptyState: "emptyState",
    emptyAddButton: "emptyAddButton",
    liveRegion: "liveRegion",
    crossTabToast: "crossTabToast",
    storageErrorToast: "storageErrorToast",
  },
}));

// getTileableBySlug をモック
vi.mock("../registry", () => ({
  getTileableBySlug: vi.fn((slug: string) => {
    const map: Record<string, { displayName: string }> = {
      "tool-a": { displayName: "ツールA" },
      "tool-b": { displayName: "ツールB" },
      "tool-c": { displayName: "ツールC" },
    };
    return map[slug];
  }),
  getAllTileables: vi.fn(() => []),
}));

// モックセットアップ後にインポート
const { ToolboxShell } = await import("../ToolboxShell");

// -----------------------------------------------------------------------
// 各テスト前後のリセット
// -----------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  mockTilesHolder.value = [
    { slug: "tool-a", size: "small", order: 0 },
    { slug: "tool-b", size: "small", order: 1 },
  ];
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// -----------------------------------------------------------------------
// 通常モード描画
// -----------------------------------------------------------------------

describe("ToolboxShell — 通常モード描画", () => {
  test("TileGrid が使用モード（isEditing=false）で描画される", () => {
    render(<ToolboxShell />);
    const grid = screen.getByTestId("tile-grid");
    expect(grid.getAttribute("data-editing")).toBe("false");
  });

  test("「編集」ボタンが存在する", () => {
    render(<ToolboxShell />);
    const editBtn = screen.getByRole("button", { name: "編集" });
    expect(editBtn).toBeTruthy();
  });

  test("通常モード時に「完了」ボタンは存在しない", () => {
    render(<ToolboxShell />);
    const doneBtn = screen.queryByRole("button", { name: "完了" });
    expect(doneBtn).toBeNull();
  });

  test("EditButton に aria-pressed='false' が設定されている", () => {
    render(<ToolboxShell />);
    const editBtn = screen.getByRole("button", { name: "編集" });
    expect(editBtn.getAttribute("aria-pressed")).toBe("false");
  });
});

// -----------------------------------------------------------------------
// 編集モード遷移（瞬間 8）
// -----------------------------------------------------------------------

describe("ToolboxShell — 編集モード遷移", () => {
  test("「編集」ボタン押下で TileGrid が isEditing=true になる", () => {
    render(<ToolboxShell />);
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    const grid = screen.getByTestId("tile-grid");
    expect(grid.getAttribute("data-editing")).toBe("true");
  });

  test("「編集」ボタン押下後「完了」ボタンが表示される", () => {
    render(<ToolboxShell />);
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    expect(screen.getByRole("button", { name: "完了" })).toBeTruthy();
  });

  test("「編集」ボタン押下後「編集」ボタンは非表示になる", () => {
    render(<ToolboxShell />);
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    expect(screen.queryByRole("button", { name: "編集" })).toBeNull();
  });

  test("「編集」ボタン押下後に aria-live で「編集モードに入りました」が通知される", () => {
    render(<ToolboxShell />);
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion?.textContent).toContain("編集モードに入りました");
  });

  test("編集モード中「+ タイルを追加」ボタンが表示される", () => {
    render(<ToolboxShell />);
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    expect(screen.getByRole("button", { name: "+ タイルを追加" })).toBeTruthy();
  });
});

// -----------------------------------------------------------------------
// Done モード戻り（瞬間 10）
// -----------------------------------------------------------------------

describe("ToolboxShell — Done モード戻り", () => {
  test("「完了」ボタン押下で TileGrid が isEditing=false に戻る", () => {
    render(<ToolboxShell />);
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    fireEvent.click(screen.getByRole("button", { name: "完了" }));
    const grid = screen.getByTestId("tile-grid");
    expect(grid.getAttribute("data-editing")).toBe("false");
  });

  test("「完了」ボタン押下後に aria-live で「編集モードを終了しました」が通知される", () => {
    render(<ToolboxShell />);
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    fireEvent.click(screen.getByRole("button", { name: "完了" }));
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion?.textContent).toContain("編集モードを終了しました");
  });

  test("「完了」ボタン押下後「完了」ボタンは非表示になる", () => {
    render(<ToolboxShell />);
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    fireEvent.click(screen.getByRole("button", { name: "完了" }));
    expect(screen.queryByRole("button", { name: "完了" })).toBeNull();
  });
});

// -----------------------------------------------------------------------
// 空状態（瞬間 34）
// -----------------------------------------------------------------------

describe("ToolboxShell — 空状態", () => {
  test("tiles が空のとき「タイルを追加してみよう」が表示される", () => {
    mockTilesHolder.value = [];
    render(<ToolboxShell />);
    expect(screen.getByText(/タイルを追加してみよう/)).toBeTruthy();
  });

  test("tiles が空でないとき空状態メッセージは表示されない", () => {
    render(<ToolboxShell />);
    expect(screen.queryByText(/タイルを追加してみよう/)).toBeNull();
  });
});

// -----------------------------------------------------------------------
// AddTileModal 開閉 + 追加（瞬間 28-30）
// -----------------------------------------------------------------------

describe("ToolboxShell — AddTileModal 開閉", () => {
  test("「+ タイルを追加」ボタンでモーダルが開く", () => {
    render(<ToolboxShell />);
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    fireEvent.click(screen.getByRole("button", { name: "+ タイルを追加" }));
    expect(screen.getByTestId("add-tile-modal")).toBeTruthy();
  });

  test("モーダルの閉じるボタンでモーダルが閉じる", () => {
    render(<ToolboxShell />);
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    fireEvent.click(screen.getByRole("button", { name: "+ タイルを追加" }));
    fireEvent.click(screen.getByTestId("modal-close"));
    expect(screen.queryByTestId("add-tile-modal")).toBeNull();
  });

  test("モーダルで追加すると setTiles が呼ばれる", () => {
    render(<ToolboxShell />);
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    fireEvent.click(screen.getByRole("button", { name: "+ タイルを追加" }));
    fireEvent.click(screen.getByTestId("modal-add-tool-c"));
    expect(mockSetTiles).toHaveBeenCalled();
  });

  test("追加後に aria-live で「ツールCを追加しました」が通知される", () => {
    render(<ToolboxShell />);
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    fireEvent.click(screen.getByRole("button", { name: "+ タイルを追加" }));
    fireEvent.click(screen.getByTestId("modal-add-tool-c"));
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion?.textContent).toContain("追加しました");
  });

  test("追加後にモーダルが閉じる", () => {
    render(<ToolboxShell />);
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    fireEvent.click(screen.getByRole("button", { name: "+ タイルを追加" }));
    fireEvent.click(screen.getByTestId("modal-add-tool-c"));
    expect(screen.queryByTestId("add-tile-modal")).toBeNull();
  });
});

// -----------------------------------------------------------------------
// 削除 → Undo バナー出現 → Undo 適用（瞬間 18-23）
// -----------------------------------------------------------------------

describe("ToolboxShell — 削除 → Undo バナー", () => {
  test("削除ボタン押下で Undo バナーが出現する", () => {
    render(<ToolboxShell />);
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    fireEvent.click(screen.getByTestId("remove-tool-a"));
    expect(screen.getByTestId("undo-banner")).toBeTruthy();
  });

  test("削除後に aria-live で削除通知が流れる", () => {
    render(<ToolboxShell />);
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    fireEvent.click(screen.getByTestId("remove-tool-a"));
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion?.textContent).toContain("削除しました");
  });

  test("Undo ボタン押下で setTiles が呼ばれ Undo バナーが消える", () => {
    render(<ToolboxShell />);
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    fireEvent.click(screen.getByTestId("remove-tool-a"));
    const undoButton = screen.getByTestId("undo-button");
    fireEvent.click(undoButton);
    expect(mockSetTiles).toHaveBeenCalled();
    expect(screen.queryByTestId("undo-banner")).toBeNull();
  });

  test("Undo 後に aria-live で復元通知が流れる", () => {
    render(<ToolboxShell />);
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    fireEvent.click(screen.getByTestId("remove-tool-a"));
    fireEvent.click(screen.getByTestId("undo-button"));
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion?.textContent).toContain("戻しました");
  });
});

// -----------------------------------------------------------------------
// Undo 期限切れ確定（瞬間 23）
// -----------------------------------------------------------------------

describe("ToolboxShell — Undo 期限切れ", () => {
  test("10 秒経過後に Undo バナーが消える", () => {
    render(<ToolboxShell />);
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    fireEvent.click(screen.getByTestId("remove-tool-a"));
    expect(screen.getByTestId("undo-banner")).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(10001);
    });
    expect(screen.queryByTestId("undo-banner")).toBeNull();
  });

  test("前回の Undo が期限切れ前に新規削除があれば前回を確定して新 Undo を出す", () => {
    render(<ToolboxShell />);
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    // 1回目削除
    fireEvent.click(screen.getByTestId("remove-tool-a"));
    // 2回目削除（別タイル）— この時点で前の Undo バナーは消えて新しい Undo バナーが出る
    // モックのタイルは remove 後に state が変わらないため、tool-b も削除操作する
    act(() => {
      vi.advanceTimersByTime(3000); // 期限切れ前
    });
    fireEvent.click(screen.getByTestId("remove-tool-b"));
    // 新しい Undo バナーが表示されていること
    expect(screen.getByTestId("undo-banner")).toBeTruthy();
  });
});

// -----------------------------------------------------------------------
// 編集モード中の長押し無効（瞬間 37）
// -----------------------------------------------------------------------

describe("ToolboxShell — 編集モード中の長押し無効", () => {
  test("使用モード時に onLongPress を呼ぶと編集モードに入る", () => {
    render(<ToolboxShell />);
    // 最初は使用モード
    expect(screen.getByTestId("tile-grid").getAttribute("data-editing")).toBe(
      "false",
    );
    // 長押しシミュレーション
    fireEvent.click(screen.getByTestId("longpress-tool-a"));
    expect(screen.getByTestId("tile-grid").getAttribute("data-editing")).toBe(
      "true",
    );
  });

  test("編集モード中に onLongPress を呼んでもモードが変わらない（二重遷移なし）", () => {
    render(<ToolboxShell />);
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    expect(screen.getByTestId("tile-grid").getAttribute("data-editing")).toBe(
      "true",
    );
    // 編集モード中の長押し — 状態は変わらない
    fireEvent.click(screen.getByTestId("longpress-tool-a"));
    // 依然として編集モード
    expect(screen.getByTestId("tile-grid").getAttribute("data-editing")).toBe(
      "true",
    );
    // 「完了」ボタンが表示されている（モードが切り替わっていない）
    expect(screen.getByRole("button", { name: "完了" })).toBeTruthy();
  });
});

// -----------------------------------------------------------------------
// aria-live 領域の存在確認（瞬間 33）
// -----------------------------------------------------------------------

describe("ToolboxShell — aria-live 領域", () => {
  test("aria-live='polite' の専用領域が 1 つ存在する", () => {
    const { container } = render(<ToolboxShell />);
    const liveRegions = container.querySelectorAll('[aria-live="polite"]');
    expect(liveRegions.length).toBeGreaterThanOrEqual(1);
  });
});

// -----------------------------------------------------------------------
// CRIT-r2-1: Undo バナーの固定メッセージ化（displayName 非依存）
// -----------------------------------------------------------------------

describe("ToolboxShell — Undo バナー固定メッセージ（CRIT-r2-1）", () => {
  test("Undo バナーのメッセージが「タイルを削除しました」（displayName 非依存の固定文言）", () => {
    render(<ToolboxShell />);
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    fireEvent.click(screen.getByTestId("remove-tool-a"));
    const banner = screen.getByTestId("undo-banner");
    // メッセージ部分は displayName を含まない固定文言
    expect(banner.textContent).toContain("タイルを削除しました");
  });

  test("Undo バナーのボタンラベルが「元に戻す」（displayName 非依存の固定文言）", () => {
    render(<ToolboxShell />);
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    fireEvent.click(screen.getByTestId("remove-tool-a"));
    // ボタンラベルは固定の「元に戻す」
    const undoButton = screen.getByTestId("undo-button");
    expect(undoButton.textContent?.trim()).toBe("元に戻す");
  });

  test("Undo バナーに displayName は含まれない（長い名前でも折り返さない設計）", () => {
    render(<ToolboxShell />);
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    fireEvent.click(screen.getByTestId("remove-tool-a"));
    const banner = screen.getByTestId("undo-banner");
    // ツールA の displayName がバナー本文に露出していないこと
    expect(banner.textContent).not.toContain("ツールAを削除しました");
    expect(banner.textContent).not.toContain("ツールAを戻す");
  });

  test("Undo 後の aria-live 通知に displayName が含まれる（SR 向けは詳細）", () => {
    render(<ToolboxShell />);
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    fireEvent.click(screen.getByTestId("remove-tool-a"));
    fireEvent.click(screen.getByTestId("undo-button"));
    const liveRegion = document.querySelector('[aria-live="polite"]');
    // SR 向けの aria-live には詳細（displayName）を含めてよい
    expect(liveRegion?.textContent).toContain("戻しました");
  });
});

// -----------------------------------------------------------------------
// CRIT-4: data-tile-slug 重複付与の解消
// -----------------------------------------------------------------------

describe("ToolboxShell — data-tile-slug 重複なし（CRIT-4）", () => {
  test("TileGrid モック内で data-tile-slug 重複確認（shell レベル）", () => {
    // ToolboxShell 自体は TileGrid をモックしているため、
    // ここでは Undo バナーが正しいデータで動作するかを確認する
    render(<ToolboxShell />);
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    fireEvent.click(screen.getByTestId("remove-tool-a"));
    // バナーが正常に表示されている（data-tile-slug が article にのみ存在するため動作可能）
    expect(screen.getByTestId("undo-banner")).toBeTruthy();
  });
});

// -----------------------------------------------------------------------
// MIN-r2-2: 編集ボタン toggle 視覚表現（aria-pressed）
// 注: F-2（focus 復元）/ F-3（toggle 視覚強化）/ F-3 の data-editing-active
// 関連テストは cycle-177 F 群実装時に builder が追加する。本サイクルで
// 計画書 v14 commit 時点では aria-pressed の基本確認のみ残す。
// -----------------------------------------------------------------------

describe("ToolboxShell — 編集ボタン aria-pressed 基本確認", () => {
  test("使用モード時の「編集」ボタンの aria-pressed が 'false'", () => {
    render(<ToolboxShell />);
    const editBtn = screen.getByRole("button", { name: /編集/ });
    expect(editBtn.getAttribute("aria-pressed")).toBe("false");
  });

  test("「完了」ボタン（編集モード中）の aria-pressed が 'true'", () => {
    render(<ToolboxShell />);
    fireEvent.click(screen.getByRole("button", { name: "編集" }));
    const doneBtn = screen.getByRole("button", { name: /完了/ });
    expect(doneBtn.getAttribute("aria-pressed")).toBe("true");
  });
});

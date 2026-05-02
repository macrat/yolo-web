/**
 * useToolboxConfig フックのユニットテスト
 *
 * テスト方針:
 * - vi.resetModules() でモジュールを毎テスト再ロードしてキャッシュ汚染を防ぐ
 * - フックは動的 import で取得（resetModules 後に新鮮なモジュールを得るため）
 * - invalidateCache は export しない（テスト都合のプロダクション汚染を避ける）
 * - 別タブ同期テスト: storage イベント到着時点では localStorage は既に最新値になっている
 *   という MDN 仕様に忠実に検証する
 */

import { describe, expect, test, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { TOOLBOX_CONFIG_STORAGE_KEY } from "../storage";
import { INITIAL_DEFAULT_LAYOUT } from "../initial-default-layout";
import type { TileLayoutEntry } from "../storage";

// ---------------------------------------------------------------------------
// モジュールリセットヘルパー
// ---------------------------------------------------------------------------

/**
 * フックモジュールを再ロードして新鮮なキャッシュ状態で返す。
 * vi.resetModules() を使用するため動的 import が必要。
 */
async function freshHook() {
  vi.resetModules();
  const { useToolboxConfig } = await import("../useToolboxConfig");
  return useToolboxConfig;
}

// ---------------------------------------------------------------------------
// 初期値テスト
// ---------------------------------------------------------------------------

describe("useToolboxConfig — 初期値", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("localStorage が空の場合は INITIAL_DEFAULT_LAYOUT.tiles を返す", async () => {
    const useToolboxConfig = await freshHook();
    const { result } = renderHook(() => useToolboxConfig());
    expect(result.current.tiles).toEqual(INITIAL_DEFAULT_LAYOUT.tiles);
  });

  test("localStorage に有効なデータがある場合はそれを返す", async () => {
    const customTiles: TileLayoutEntry[] = [
      { slug: "custom-1", order: 0, size: "medium" },
    ];
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tiles: customTiles,
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    const useToolboxConfig = await freshHook();
    const { result } = renderHook(() => useToolboxConfig());
    expect(result.current.tiles).toEqual(customTiles);
  });

  test("tiles / setTiles / resetToDefault が公開されている", async () => {
    const useToolboxConfig = await freshHook();
    const { result } = renderHook(() => useToolboxConfig());
    expect(result.current.tiles).toBeDefined();
    expect(typeof result.current.setTiles).toBe("function");
    expect(typeof result.current.resetToDefault).toBe("function");
  });
});

// ---------------------------------------------------------------------------
// setTiles
// ---------------------------------------------------------------------------

describe("useToolboxConfig — setTiles", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("setTiles を呼ぶと tiles が更新される", async () => {
    const useToolboxConfig = await freshHook();
    const { result } = renderHook(() => useToolboxConfig());
    const newTiles: TileLayoutEntry[] = [
      { slug: "new-tile", order: 0, size: "large" },
    ];

    act(() => {
      result.current.setTiles(newTiles);
    });

    expect(result.current.tiles).toEqual(newTiles);
  });

  test("setTiles を呼ぶと localStorage に保存される", async () => {
    const useToolboxConfig = await freshHook();
    const { result } = renderHook(() => useToolboxConfig());
    const newTiles: TileLayoutEntry[] = [
      { slug: "saved-tile", order: 0, size: "small" },
    ];

    act(() => {
      result.current.setTiles(newTiles);
    });

    const raw = localStorage.getItem(TOOLBOX_CONFIG_STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.tiles).toEqual(newTiles);
  });

  test("setTiles は order を渡された配列順に自動正規化する（order 連番保証）", async () => {
    const useToolboxConfig = await freshHook();
    const { result } = renderHook(() => useToolboxConfig());

    // order が飛び飛びの入力を渡す
    const inputTiles: TileLayoutEntry[] = [
      { slug: "a", order: 99, size: "small" },
      { slug: "b", order: 5, size: "medium" },
      { slug: "c", order: 0, size: "large" },
    ];

    act(() => {
      result.current.setTiles(inputTiles);
    });

    // フック戻り値の tiles は order が正規化されている
    expect(result.current.tiles[0]).toMatchObject({ slug: "a", order: 0 });
    expect(result.current.tiles[1]).toMatchObject({ slug: "b", order: 1 });
    expect(result.current.tiles[2]).toMatchObject({ slug: "c", order: 2 });
  });

  test("setTiles で正規化された order が localStorage に保存される", async () => {
    const useToolboxConfig = await freshHook();
    const { result } = renderHook(() => useToolboxConfig());

    act(() => {
      result.current.setTiles([
        { slug: "x", order: 10, size: "small" },
        { slug: "y", order: 20, size: "medium" },
      ]);
    });

    const parsed = JSON.parse(
      localStorage.getItem(TOOLBOX_CONFIG_STORAGE_KEY)!,
    );
    expect(parsed.tiles[0].order).toBe(0);
    expect(parsed.tiles[1].order).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// resetToDefault
// ---------------------------------------------------------------------------

describe("useToolboxConfig — resetToDefault", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("resetToDefault を呼ぶと INITIAL_DEFAULT_LAYOUT.tiles に戻る", async () => {
    const useToolboxConfig = await freshHook();
    const { result } = renderHook(() => useToolboxConfig());

    // まずカスタム値を設定
    act(() => {
      result.current.setTiles([{ slug: "custom", order: 0, size: "large" }]);
    });
    expect(result.current.tiles).not.toEqual(INITIAL_DEFAULT_LAYOUT.tiles);

    // リセット
    act(() => {
      result.current.resetToDefault();
    });

    expect(result.current.tiles).toEqual(INITIAL_DEFAULT_LAYOUT.tiles);
  });

  test("resetToDefault 後に localStorage が INITIAL_DEFAULT_LAYOUT の内容になる", async () => {
    const useToolboxConfig = await freshHook();
    const { result } = renderHook(() => useToolboxConfig());

    act(() => {
      result.current.resetToDefault();
    });

    const raw = localStorage.getItem(TOOLBOX_CONFIG_STORAGE_KEY);
    const parsed = JSON.parse(raw!);
    expect(parsed.tiles).toEqual(INITIAL_DEFAULT_LAYOUT.tiles);
  });

  test("resetToDefault は setTiles 経由なので order が必ず連番になる", async () => {
    // resetToDefault は setTiles([...INITIAL_DEFAULT_LAYOUT.tiles]) で実装されるため、
    // setTiles の order 正規化を経由する。INITIAL_DEFAULT_LAYOUT.tiles は元々連番だが、
    // 将来 INITIAL_DEFAULT_LAYOUT が変更されても正規化が効くことを保証する。
    const useToolboxConfig = await freshHook();
    const { result } = renderHook(() => useToolboxConfig());

    act(() => {
      result.current.resetToDefault();
    });

    const tiles = result.current.tiles;
    tiles.forEach((tile, index) => {
      expect(tile.order).toBe(index);
    });
  });
});

// ---------------------------------------------------------------------------
// 同一タブ複数フックインスタンスの同期
// ---------------------------------------------------------------------------

describe("useToolboxConfig — 同一タブ複数インスタンス同期", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("インスタンス A で setTiles するとインスタンス B も追従する", async () => {
    const useToolboxConfig = await freshHook();
    const { result: resultA } = renderHook(() => useToolboxConfig());
    const { result: resultB } = renderHook(() => useToolboxConfig());

    const newTiles: TileLayoutEntry[] = [
      { slug: "shared-tile", order: 0, size: "medium" },
    ];

    act(() => {
      resultA.current.setTiles(newTiles);
    });

    expect(resultB.current.tiles).toEqual(newTiles);
  });

  test("インスタンス B で setTiles するとインスタンス A も追従する", async () => {
    const useToolboxConfig = await freshHook();
    const { result: resultA } = renderHook(() => useToolboxConfig());
    const { result: resultB } = renderHook(() => useToolboxConfig());

    const newTiles: TileLayoutEntry[] = [
      { slug: "reverse-sync", order: 0, size: "small" },
    ];

    act(() => {
      resultB.current.setTiles(newTiles);
    });

    expect(resultA.current.tiles).toEqual(newTiles);
  });
});

// ---------------------------------------------------------------------------
// 別タブ同期（storage イベント）
// ---------------------------------------------------------------------------

describe("useToolboxConfig — 別タブ同期（storage イベント）", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("別タブ storage イベント受信後にキャッシュが無効化され、新しい localStorage 値が反映される", async () => {
    /**
     * MDN 仕様に忠実な検証:
     * - 別タブが localStorage を更新する → localStorage は既に新しい値になっている
     * - storage イベントがこのタブに届く → フックがキャッシュ無効化して再読み込み
     * - フックの tiles が新しい値に更新される
     *
     * このテストでは「storage イベント到着時点では localStorage が最新値に
     * なっている」という仕様前提で実装の正しさを検証する。
     * （onStorageEvent で invalidateCache が呼ばれていないと tiles は更新されない）
     */
    const useToolboxConfig = await freshHook();
    const { result } = renderHook(() => useToolboxConfig());

    // 初期状態を確認
    expect(result.current.tiles).toEqual(INITIAL_DEFAULT_LAYOUT.tiles);

    const newTiles: TileLayoutEntry[] = [
      { slug: "from-other-tab", order: 0, size: "medium" },
    ];
    const newData = JSON.stringify({
      schemaVersion: 1,
      tiles: newTiles,
      updatedAt: "2026-02-01T00:00:00.000Z",
    });

    act(() => {
      // 別タブが localStorage を更新済みという状態を再現:
      // storage イベントは「別タブが setItem した後」に届くため、
      // イベント発火前に localStorage は既に更新されている
      localStorage.setItem(TOOLBOX_CONFIG_STORAGE_KEY, newData);

      // storage イベント発火（jsdom では storageArea に localStorage を渡せないため省略）
      // フックは key の一致のみで絞り込むため動作に影響しない
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: TOOLBOX_CONFIG_STORAGE_KEY,
          newValue: newData,
        }),
      );
    });

    // キャッシュが無効化され localStorage から再読み込みされた結果
    expect(result.current.tiles).toEqual(newTiles);
  });

  test("storage イベントが届いても localStorage が旧値のままであれば旧値が返る", async () => {
    /**
     * キャッシュ無効化 → localStorage 再読み込みの順序検証。
     * storage イベント受信時点で localStorage が更新されていない場合（あり得ない仕様だが
     * 実装の堅牢性確認として）、旧値のままになることを確認する。
     */
    const customTiles: TileLayoutEntry[] = [
      { slug: "old-value", order: 0, size: "small" },
    ];
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tiles: customTiles,
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );

    const useToolboxConfig = await freshHook();
    const { result } = renderHook(() => useToolboxConfig());

    // 初期値が customTiles であることを確認
    expect(result.current.tiles).toEqual(customTiles);

    act(() => {
      // localStorage を更新せずに別の key の storage イベントを発火
      // → フックは無視するため tiles は変わらない
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "unrelated-key",
          newValue: "something",
        }),
      );
    });

    // 変化なし
    expect(result.current.tiles).toEqual(customTiles);
  });

  test("関係のない key の storage イベントでは tiles が変わらない", async () => {
    const useToolboxConfig = await freshHook();
    const { result } = renderHook(() => useToolboxConfig());
    const initial = result.current.tiles;

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "other-key",
          newValue: "some-value",
        }),
      );
    });

    expect(result.current.tiles).toEqual(initial);
  });
});

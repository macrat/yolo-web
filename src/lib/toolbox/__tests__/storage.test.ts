/**
 * storage.ts のユニットテスト
 *
 * テスト方針:
 * - localStorage はすべてモック（jsdom の localStorage を直接利用または vi.stubGlobal）
 * - SSR 環境（window === undefined）はグローバル退避で再現
 */

import { describe, expect, test, beforeEach, afterEach, vi } from "vitest";
import {
  TOOLBOX_CONFIG_STORAGE_KEY,
  loadConfig,
  saveConfig,
  type ToolboxConfigSchemaV1,
} from "../storage";
import { INITIAL_DEFAULT_LAYOUT } from "../initial-default-layout";

// ---------------------------------------------------------------------------
// ヘルパー
// ---------------------------------------------------------------------------

/**
 * localStorage を有効なスキーマ v1 データで初期化する。
 */
function setValidV1(
  overrides: Partial<ToolboxConfigSchemaV1> = {},
): ToolboxConfigSchemaV1 {
  const data: ToolboxConfigSchemaV1 = {
    schemaVersion: 1,
    tiles: [
      { slug: "foo", order: 0, size: "small" },
      { slug: "bar", order: 1, size: "medium" },
    ],
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
  localStorage.setItem(TOOLBOX_CONFIG_STORAGE_KEY, JSON.stringify(data));
  return data;
}

// ---------------------------------------------------------------------------
// ストレージキー
// ---------------------------------------------------------------------------

describe("TOOLBOX_CONFIG_STORAGE_KEY", () => {
  test("命名規則 yolos-* に従う", () => {
    expect(TOOLBOX_CONFIG_STORAGE_KEY).toMatch(/^yolos-/);
  });
});

// ---------------------------------------------------------------------------
// loadConfig
// ---------------------------------------------------------------------------

describe("loadConfig", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("ストレージが空の場合は INITIAL_DEFAULT_LAYOUT を返す", () => {
    const result = loadConfig();
    expect(result).toEqual(INITIAL_DEFAULT_LAYOUT.tiles);
  });

  test("有効な v1 データが存在する場合はそれを返す", () => {
    const data = setValidV1();
    const result = loadConfig();
    expect(result).toEqual(data.tiles);
  });

  test("不正 JSON の場合は INITIAL_DEFAULT_LAYOUT にフォールバックする", () => {
    localStorage.setItem(TOOLBOX_CONFIG_STORAGE_KEY, "THIS IS NOT JSON");
    const result = loadConfig();
    expect(result).toEqual(INITIAL_DEFAULT_LAYOUT.tiles);
  });

  test("schemaVersion が異なる（未知バージョン）場合は INITIAL_DEFAULT_LAYOUT にフォールバックする", () => {
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({ schemaVersion: 999, tiles: [], updatedAt: "" }),
    );
    const result = loadConfig();
    expect(result).toEqual(INITIAL_DEFAULT_LAYOUT.tiles);
  });

  test("schemaVersion フィールドがない場合は INITIAL_DEFAULT_LAYOUT にフォールバックする", () => {
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({ tiles: [] }),
    );
    const result = loadConfig();
    expect(result).toEqual(INITIAL_DEFAULT_LAYOUT.tiles);
  });

  test("tiles フィールドが配列でない場合は INITIAL_DEFAULT_LAYOUT にフォールバックする", () => {
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({ schemaVersion: 1, tiles: "not-array", updatedAt: "" }),
    );
    const result = loadConfig();
    expect(result).toEqual(INITIAL_DEFAULT_LAYOUT.tiles);
  });

  test("tiles の要素が必須フィールド欠落の場合は INITIAL_DEFAULT_LAYOUT にフォールバックする", () => {
    // order フィールドが欠落
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tiles: [{ slug: "foo", size: "small" /* order 欠落 */ }],
        updatedAt: "",
      }),
    );
    const result = loadConfig();
    expect(result).toEqual(INITIAL_DEFAULT_LAYOUT.tiles);
  });

  test("null が保存されている場合は INITIAL_DEFAULT_LAYOUT にフォールバックする", () => {
    localStorage.setItem(TOOLBOX_CONFIG_STORAGE_KEY, "null");
    const result = loadConfig();
    expect(result).toEqual(INITIAL_DEFAULT_LAYOUT.tiles);
  });

  describe("SSR 環境（window === undefined）", () => {
    let savedWindow: Window & typeof globalThis;

    beforeEach(() => {
      savedWindow = globalThis.window;
      // @ts-expect-error -- SSR を再現するため window を一時的に undefined にする
      delete globalThis.window;
    });

    afterEach(() => {
      globalThis.window = savedWindow;
    });

    test("SSR 環境では INITIAL_DEFAULT_LAYOUT を返す", () => {
      const result = loadConfig();
      expect(result).toEqual(INITIAL_DEFAULT_LAYOUT.tiles);
    });
  });
});

// ---------------------------------------------------------------------------
// saveConfig
// ---------------------------------------------------------------------------

describe("saveConfig", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("tiles 配列を渡すと localStorage に保存される", () => {
    const tiles: ToolboxConfigSchemaV1["tiles"] = [
      { slug: "test", order: 0, size: "large" },
    ];
    saveConfig(tiles);

    const raw = localStorage.getItem(TOOLBOX_CONFIG_STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.tiles).toEqual(tiles);
    expect(typeof parsed.updatedAt).toBe("string");
  });

  test("updatedAt に ISO 8601 文字列が設定される", () => {
    saveConfig([]);
    const raw = localStorage.getItem(TOOLBOX_CONFIG_STORAGE_KEY)!;
    const parsed = JSON.parse(raw);
    expect(() => new Date(parsed.updatedAt)).not.toThrow();
    expect(new Date(parsed.updatedAt).toISOString()).toBe(parsed.updatedAt);
  });

  test("variantId が undefined の場合はシリアライズ後に含まれない", () => {
    const tiles: ToolboxConfigSchemaV1["tiles"] = [
      { slug: "no-variant", order: 0, size: "small" },
    ];
    saveConfig(tiles);
    const raw = localStorage.getItem(TOOLBOX_CONFIG_STORAGE_KEY)!;
    // JSON.stringify は undefined フィールドを省略する
    const parsed = JSON.parse(raw);
    expect(parsed.tiles[0].variantId).toBeUndefined();
  });

  test("variantId が指定されている場合は保存される", () => {
    const tiles: ToolboxConfigSchemaV1["tiles"] = [
      { slug: "with-variant", variantId: "compact", order: 0, size: "small" },
    ];
    saveConfig(tiles);
    const raw = localStorage.getItem(TOOLBOX_CONFIG_STORAGE_KEY)!;
    const parsed = JSON.parse(raw);
    expect(parsed.tiles[0].variantId).toBe("compact");
  });

  describe("SSR 環境（window === undefined）", () => {
    let savedWindow: Window & typeof globalThis;

    beforeEach(() => {
      savedWindow = globalThis.window;
      // @ts-expect-error -- SSR を再現するため window を一時的に undefined にする
      delete globalThis.window;
    });

    afterEach(() => {
      globalThis.window = savedWindow;
    });

    test("SSR 環境では何もせずに終了する（エラーを throw しない）", () => {
      expect(() => saveConfig([])).not.toThrow();
    });
  });

  describe("QuotaExceededError などのストレージエラー", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    test("setItem が例外を throw しても呼び出し元にエラーが伝播しない", () => {
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new DOMException("QuotaExceededError");
      });
      expect(() => saveConfig([])).not.toThrow();
    });
  });
});

// ---------------------------------------------------------------------------
// isStorageAvailable（内部ヘルパーの間接テスト）
// ---------------------------------------------------------------------------

describe("isStorageAvailable の間接テスト", () => {
  test("localStorage が利用可能な環境では loadConfig/saveConfig が正常動作する", () => {
    localStorage.clear();
    // 正常系が通れば isStorageAvailable === true と見なせる
    expect(() => saveConfig([])).not.toThrow();
    expect(() => loadConfig()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// マイグレーションフレームワーク（v1 → v2 を仮定した構造テスト）
// ---------------------------------------------------------------------------

describe("マイグレーションフレームワーク（将来の v2 への備え）", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("v1 データは正常に読み込める（マイグレーション不要）", () => {
    const v1Data = setValidV1();
    const result = loadConfig();
    expect(result).toEqual(v1Data.tiles);
  });

  test("未知バージョン（v99）はフォールバックする（マイグレーション対象外）", () => {
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 99,
        tiles: [{ slug: "x", order: 0, size: "small" }],
        updatedAt: "",
      }),
    );
    const result = loadConfig();
    // 未知バージョンはフォールバック（マイグレーション関数が存在しないため）
    expect(result).toEqual(INITIAL_DEFAULT_LAYOUT.tiles);
  });
});

// ---------------------------------------------------------------------------
// Tileable 型ガード（isTileLayoutEntry — 間接テスト）
// ---------------------------------------------------------------------------

describe("型ガードの間接テスト（保存 → 読込 ラウンドトリップ）", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("size が不正値の場合はフォールバックする", () => {
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tiles: [{ slug: "bad", order: 0, size: "xlarge" /* 不正値 */ }],
        updatedAt: "",
      }),
    );
    const result = loadConfig();
    expect(result).toEqual(INITIAL_DEFAULT_LAYOUT.tiles);
  });

  test("slug が空文字の場合はフォールバックする", () => {
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tiles: [{ slug: "", order: 0, size: "small" }],
        updatedAt: "",
      }),
    );
    const result = loadConfig();
    expect(result).toEqual(INITIAL_DEFAULT_LAYOUT.tiles);
  });

  test("order が数値でない場合はフォールバックする", () => {
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tiles: [{ slug: "foo", order: "zero" /* 不正値 */, size: "small" }],
        updatedAt: "",
      }),
    );
    const result = loadConfig();
    expect(result).toEqual(INITIAL_DEFAULT_LAYOUT.tiles);
  });
});

// ---------------------------------------------------------------------------
// isSchemaV1 の整合性検証（slug 重複 / order 連番 — 整合性 NG 時の console.warn）
// ---------------------------------------------------------------------------

describe("tiles 配列の整合性検証", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("slug が重複しているデータはフォールバックし、console.warn を出力する", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tiles: [
          { slug: "dup", order: 0, size: "small" },
          { slug: "dup", order: 1, size: "medium" },
        ],
        updatedAt: "",
      }),
    );
    loadConfig();
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy.mock.calls[0][0]).toMatch(/corrupt/);
    warnSpy.mockRestore();
  });

  test("order が連番でないデータはフォールバックし、console.warn を出力する", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tiles: [
          { slug: "a", order: 0, size: "small" },
          { slug: "b", order: 2, size: "medium" },
        ],
        updatedAt: "",
      }),
    );
    loadConfig();
    expect(warnSpy).toHaveBeenCalledOnce();
    warnSpy.mockRestore();
  });

  test("型エラー（order 欠落など）はフォールバックするが console.warn は出力しない", () => {
    // 型レベルのエラーは warn なし（データ破損ではなく形式不正）
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tiles: [{ slug: "foo", size: "small" }], // order 欠落
        updatedAt: "",
      }),
    );
    loadConfig();
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  test("slug が重複しているデータはフォールバックする（React key 重複防止）", () => {
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tiles: [
          { slug: "dup", order: 0, size: "small" },
          { slug: "dup", order: 1, size: "medium" }, // slug 重複
        ],
        updatedAt: "",
      }),
    );
    const result = loadConfig();
    expect(result).toEqual(INITIAL_DEFAULT_LAYOUT.tiles);
  });

  test("order が連番でないデータはフォールバックする（0,2 → フォールバック）", () => {
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tiles: [
          { slug: "a", order: 0, size: "small" },
          { slug: "b", order: 2, size: "medium" }, // order=1 が抜けている
        ],
        updatedAt: "",
      }),
    );
    const result = loadConfig();
    expect(result).toEqual(INITIAL_DEFAULT_LAYOUT.tiles);
  });

  test("order が重複しているデータはフォールバックする", () => {
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tiles: [
          { slug: "a", order: 0, size: "small" },
          { slug: "b", order: 0, size: "medium" }, // order 重複
        ],
        updatedAt: "",
      }),
    );
    const result = loadConfig();
    expect(result).toEqual(INITIAL_DEFAULT_LAYOUT.tiles);
  });

  test("order が 0 始まりでないデータはフォールバックする（1,2 → フォールバック）", () => {
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tiles: [
          { slug: "a", order: 1, size: "small" },
          { slug: "b", order: 2, size: "medium" }, // 0 始まりでない
        ],
        updatedAt: "",
      }),
    );
    const result = loadConfig();
    expect(result).toEqual(INITIAL_DEFAULT_LAYOUT.tiles);
  });

  test("空配列は有効なデータとして読み込む（タイル 0 件）", () => {
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tiles: [],
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    const result = loadConfig();
    expect(result).toEqual([]);
  });

  test("slug 重複なし・order 連番 の正常データは読み込める", () => {
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tiles: [
          { slug: "a", order: 0, size: "small" },
          { slug: "b", order: 1, size: "medium" },
          { slug: "c", order: 2, size: "large" },
        ],
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    const result = loadConfig();
    expect(result).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// INITIAL_DEFAULT_LAYOUT 整合テスト
// ---------------------------------------------------------------------------

describe("INITIAL_DEFAULT_LAYOUT との整合", () => {
  test("ラウンドトリップ: INITIAL_DEFAULT_LAYOUT.tiles を saveConfig → loadConfig すると元に戻る", () => {
    localStorage.clear();
    saveConfig(INITIAL_DEFAULT_LAYOUT.tiles);
    const result = loadConfig();
    expect(result).toEqual(INITIAL_DEFAULT_LAYOUT.tiles);
  });
});

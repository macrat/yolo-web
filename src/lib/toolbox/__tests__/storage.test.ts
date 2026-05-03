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

  test("slug が重複しているデータは救済（dedupe）され、console.warn を出力する", () => {
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
    const result = loadConfig();
    // 救済後は INITIAL_DEFAULT_LAYOUT にフォールバックせず、修復データを返す
    expect(result).not.toEqual(INITIAL_DEFAULT_LAYOUT.tiles);
    // console.warn は出力される
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  test("order が連番でないデータは救済（order 振り直し）され、console.warn を出力する", () => {
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
    const result = loadConfig();
    // 救済後は INITIAL_DEFAULT_LAYOUT にフォールバックせず、修復データを返す
    expect(result).not.toEqual(INITIAL_DEFAULT_LAYOUT.tiles);
    expect(warnSpy).toHaveBeenCalled();
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

  test("slug が重複しているデータは救済される（INITIAL_DEFAULT_LAYOUT にフォールバックしない）", () => {
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
    // 救済ロジックにより 1 要素に縮退して返される
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("dup");
    expect(result[0].size).toBe("small"); // 最初の出現を採用
  });

  test("order が連番でないデータは救済される（0,2 → 0,1 に振り直す）", () => {
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
    // 救済ロジックにより 0,1 に振り直される
    expect(result).toHaveLength(2);
    expect(result[0].order).toBe(0);
    expect(result[1].order).toBe(1);
  });

  test("order が重複しているデータは救済される（order 振り直し）", () => {
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
    // 救済ロジックにより order が一意の連番になる
    expect(result).toHaveLength(2);
    const orders = result.map((t) => t.order).sort((a, b) => a - b);
    expect(orders).toEqual([0, 1]);
  });

  test("order が 0 始まりでないデータは救済される（1,2 → 0,1 に振り直す）", () => {
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
    // 救済ロジックにより 0 始まりに振り直される
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.order)).toEqual([0, 1]);
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

// ---------------------------------------------------------------------------
// 救済ロジック（repairTiles）の単体テスト
// ---------------------------------------------------------------------------

describe("救済ロジック（repairTiles 相当）", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ---- slug 重複 dedupe ----

  test("slug が重複している場合、最初の出現を採用して後続を除去し、order を振り直す", () => {
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tiles: [
          { slug: "dup", order: 0, size: "small" },
          { slug: "dup", order: 1, size: "medium" }, // 重複 slug → 除去される
          { slug: "other", order: 2, size: "large" },
        ],
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    const result = loadConfig();
    // INITIAL_DEFAULT_LAYOUT にフォールバックせず、救済後のデータを返す
    expect(result).not.toEqual(INITIAL_DEFAULT_LAYOUT.tiles);
    // 重複は除去されて 2 要素になる
    expect(result).toHaveLength(2);
    // 最初の "dup" が採用される（size: "small"）
    expect(result[0].slug).toBe("dup");
    expect(result[0].size).toBe("small");
    // "other" も含まれる
    expect(result[1].slug).toBe("other");
    // order は 0 始まり連番で振り直されている
    expect(result[0].order).toBe(0);
    expect(result[1].order).toBe(1);
  });

  test("slug 重複が複数パターンある場合も各 slug の最初の出現のみ採用する", () => {
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tiles: [
          { slug: "a", order: 0, size: "small" },
          { slug: "b", order: 1, size: "small" },
          { slug: "a", order: 2, size: "large" }, // a の重複
          { slug: "b", order: 3, size: "medium" }, // b の重複
          { slug: "c", order: 4, size: "small" },
        ],
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    const result = loadConfig();
    expect(result).toHaveLength(3);
    const slugs = result.map((t) => t.slug);
    expect(slugs).toEqual(["a", "b", "c"]);
    // order は 0 始まり連番
    expect(result.map((t) => t.order)).toEqual([0, 1, 2]);
  });

  // ---- order 連番振り直し ----

  test("order が飛び番号の場合、0 始まり連番に振り直す（slugは維持）", () => {
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tiles: [
          { slug: "a", order: 0, size: "small" },
          { slug: "b", order: 5, size: "medium" }, // 飛び番
          { slug: "c", order: 10, size: "large" }, // 飛び番
        ],
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    const result = loadConfig();
    // デフォルトにフォールバックしない
    expect(result).not.toEqual(INITIAL_DEFAULT_LAYOUT.tiles);
    expect(result).toHaveLength(3);
    // order は order の元の値でソートされたまま 0,1,2 に振り直される
    expect(result.map((t) => t.order)).toEqual([0, 1, 2]);
    expect(result.map((t) => t.slug)).toEqual(["a", "b", "c"]);
  });

  test("order が重複している場合、order でソートして 0 始まり連番に振り直す", () => {
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tiles: [
          { slug: "a", order: 0, size: "small" },
          { slug: "b", order: 0, size: "medium" }, // order 重複
        ],
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    const result = loadConfig();
    expect(result).not.toEqual(INITIAL_DEFAULT_LAYOUT.tiles);
    expect(result).toHaveLength(2);
    // order は一意で 0 始まり連番になっている
    const orders = result.map((t) => t.order).sort((a, b) => a - b);
    expect(orders).toEqual([0, 1]);
  });

  test("order が 0 始まりでない場合（1,2）、0 始まり連番に振り直す", () => {
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tiles: [
          { slug: "a", order: 1, size: "small" },
          { slug: "b", order: 2, size: "medium" },
        ],
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    const result = loadConfig();
    expect(result).not.toEqual(INITIAL_DEFAULT_LAYOUT.tiles);
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.order)).toEqual([0, 1]);
    expect(result.map((t) => t.slug)).toEqual(["a", "b"]);
  });

  // ---- slug 重複 + order 非連番の複合ケース ----

  test("slug 重複と order 非連番が同時に発生した場合も救済できる", () => {
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tiles: [
          { slug: "dup", order: 5, size: "small" }, // 重複1、かつ飛び番
          { slug: "dup", order: 10, size: "medium" }, // 重複2（除去される）
          { slug: "unique", order: 20, size: "large" }, // 飛び番
        ],
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    const result = loadConfig();
    expect(result).not.toEqual(INITIAL_DEFAULT_LAYOUT.tiles);
    expect(result).toHaveLength(2);
    expect(result[0].slug).toBe("dup");
    expect(result[0].size).toBe("small"); // 最初の出現を採用
    expect(result[1].slug).toBe("unique");
    // order は 0 始まり連番
    expect(result.map((t) => t.order)).toEqual([0, 1]);
  });

  // ---- 救済後の console.warn 出力 ----

  test("救済が実行された場合（slug 重複）は console.warn を出力する", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tiles: [
          { slug: "dup", order: 0, size: "small" },
          { slug: "dup", order: 1, size: "medium" },
        ],
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    loadConfig();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  test("救済が実行された場合（order 非連番）は console.warn を出力する", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tiles: [
          { slug: "a", order: 0, size: "small" },
          { slug: "b", order: 5, size: "medium" }, // 飛び番
        ],
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    loadConfig();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  // ---- 単一要素・空配列 ----

  test("タイルが 1 件の場合、order=0 であれば救済不要", () => {
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tiles: [{ slug: "solo", order: 0, size: "small" }],
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    const result = loadConfig();
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("solo");
    expect(result[0].order).toBe(0);
  });

  test("タイルが 1 件で order が 0 以外の場合、0 に振り直す", () => {
    localStorage.setItem(
      TOOLBOX_CONFIG_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tiles: [{ slug: "solo", order: 99, size: "small" }],
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    const result = loadConfig();
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("solo");
    expect(result[0].order).toBe(0);
  });
});

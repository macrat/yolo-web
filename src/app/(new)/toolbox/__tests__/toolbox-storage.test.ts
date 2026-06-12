/**
 * toolbox-storage のユニットテスト（cycle-230 T-6）
 *
 * 検証観点:
 * - 保存 → 復元のラウンドトリップ（順序・部分集合・空配列の尊重）
 * - 破損 JSON / スキーマ不一致 / 未知バージョン → デフォルト構成へフォールバック
 * - 未知 id の黙過除去・重複 id の排除
 * - localStorage 例外時（読めない・書けない環境）でも throw せず通常動作
 * - clearToolboxItems でキーが削除される
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  TOOLBOX_SCHEMA_VERSION,
  TOOLBOX_STORAGE_KEY,
  clearToolboxItems,
  loadToolboxItems,
  saveToolboxItems,
} from "../toolbox-storage";

/** テスト用の小さなカタログ（実カタログに依存しない単体テスト） */
const DEFAULT_ITEMS: readonly string[] = [
  "alpha:full",
  "beta:full",
  "gamma:full",
];
const VALID_IDS: ReadonlySet<string> = new Set([
  ...DEFAULT_ITEMS,
  "delta:encode",
]);

function setStored(value: unknown): void {
  window.localStorage.setItem(TOOLBOX_STORAGE_KEY, JSON.stringify(value));
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("loadToolboxItems: 復元", () => {
  it("未保存ならデフォルト構成のコピーを返す", () => {
    const result = loadToolboxItems(DEFAULT_ITEMS, VALID_IDS);
    expect(result).toEqual([...DEFAULT_ITEMS]);
    // 呼び出し元が破壊的に変更してもデフォルト定義が汚れないようコピーであること
    expect(result).not.toBe(DEFAULT_ITEMS);
  });

  it("保存した構成を順序ごと復元する（save → load ラウンドトリップ）", () => {
    saveToolboxItems(["gamma:full", "alpha:full", "delta:encode"]);
    expect(loadToolboxItems(DEFAULT_ITEMS, VALID_IDS)).toEqual([
      "gamma:full",
      "alpha:full",
      "delta:encode",
    ]);
  });

  it("空配列（全タイルを外した構成）は有効な構成として尊重する", () => {
    saveToolboxItems([]);
    expect(loadToolboxItems(DEFAULT_ITEMS, VALID_IDS)).toEqual([]);
  });

  it("保存済み構成はデフォルト構成の定義変更に影響されない（保存があればデフォルトを使わない）", () => {
    // cycle-232（Phase 10.3）でデフォルトが全39枚 → daily-life 6枚に変わった。
    // デフォルト変更が影響してよいのは「保存がない人」だけであることを、
    // 異なる defaultItems を渡しても保存構成がそのまま返ることで検証する
    saveToolboxItems(["delta:encode", "alpha:full"]);
    const beforeChange = loadToolboxItems(DEFAULT_ITEMS, VALID_IDS);
    const afterChange = loadToolboxItems(["beta:full"], VALID_IDS);
    expect(beforeChange).toEqual(["delta:encode", "alpha:full"]);
    expect(afterChange).toEqual(beforeChange);
  });

  it("破損 JSON はデフォルト構成にフォールバックする", () => {
    window.localStorage.setItem(TOOLBOX_STORAGE_KEY, "{not-json!!");
    expect(loadToolboxItems(DEFAULT_ITEMS, VALID_IDS)).toEqual([
      ...DEFAULT_ITEMS,
    ]);
  });

  it("未知バージョンはデフォルト構成にフォールバックする", () => {
    setStored({ version: TOOLBOX_SCHEMA_VERSION + 1, items: ["alpha:full"] });
    expect(loadToolboxItems(DEFAULT_ITEMS, VALID_IDS)).toEqual([
      ...DEFAULT_ITEMS,
    ]);
  });

  it.each([
    ["オブジェクトでない値", 42],
    ["null", null],
    ["items が配列でない", { version: TOOLBOX_SCHEMA_VERSION, items: "alpha" }],
    ["version が数値でない", { version: "1", items: ["alpha:full"] }],
    [
      "items に文字列以外が混入",
      { version: TOOLBOX_SCHEMA_VERSION, items: ["alpha:full", 7] },
    ],
    ["items 欠落", { version: TOOLBOX_SCHEMA_VERSION }],
  ])(
    "スキーマ不一致（%s）はデフォルト構成にフォールバックする",
    (_label, stored) => {
      setStored(stored);
      expect(loadToolboxItems(DEFAULT_ITEMS, VALID_IDS)).toEqual([
        ...DEFAULT_ITEMS,
      ]);
    },
  );

  it("未知 id は黙って除去し、残りの並びは維持する", () => {
    setStored({
      version: TOOLBOX_SCHEMA_VERSION,
      items: ["beta:full", "ghost:full", "delta:encode", "unknown:x"],
    });
    expect(loadToolboxItems(DEFAULT_ITEMS, VALID_IDS)).toEqual([
      "beta:full",
      "delta:encode",
    ]);
  });

  it("重複 id は最初の1件のみ採用する（同一エントリは1枚まで）", () => {
    setStored({
      version: TOOLBOX_SCHEMA_VERSION,
      items: ["alpha:full", "beta:full", "alpha:full"],
    });
    expect(loadToolboxItems(DEFAULT_ITEMS, VALID_IDS)).toEqual([
      "alpha:full",
      "beta:full",
    ]);
  });

  it("localStorage が読めない環境では throw せずデフォルト構成を返す", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });
    expect(loadToolboxItems(DEFAULT_ITEMS, VALID_IDS)).toEqual([
      ...DEFAULT_ITEMS,
    ]);
  });
});

describe("saveToolboxItems: 保存", () => {
  it("バージョン付きスキーマで保存する", () => {
    saveToolboxItems(["alpha:full", "delta:encode"]);
    const raw = window.localStorage.getItem(TOOLBOX_STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string)).toEqual({
      version: TOOLBOX_SCHEMA_VERSION,
      items: ["alpha:full", "delta:encode"],
    });
  });

  it("localStorage に書けない環境（プライベートモード等）でも throw しない", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });
    expect(() => saveToolboxItems(["alpha:full"])).not.toThrow();
  });
});

describe("clearToolboxItems: リセット用の削除", () => {
  it("保存済みキーを削除する", () => {
    saveToolboxItems(["alpha:full"]);
    expect(window.localStorage.getItem(TOOLBOX_STORAGE_KEY)).not.toBeNull();
    clearToolboxItems();
    expect(window.localStorage.getItem(TOOLBOX_STORAGE_KEY)).toBeNull();
  });

  it("localStorage を操作できない環境でも throw しない", () => {
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });
    expect(() => clearToolboxItems()).not.toThrow();
  });
});

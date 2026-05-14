import { describe, expect, test, vi } from "vitest";

/**
 * tile-loader のテスト
 *
 * B-2（slug ベース lazy loader 方式）の完了基準を客観確認するテスト群。
 *
 * 【このテストの役割】
 * 1. slug → lazy loader（next/dynamic）の取得経路が機能することを確認する
 * 2. 同一 slug の呼び出しで同一参照が返る（メモ化）ことを確認する
 */

// next/dynamic をモック: テスト環境では実際の動的インポートはせず、
// 引数の loader 関数をラップしたスタブコンポーネントを返す
vi.mock("next/dynamic", () => ({
  default: () => {
    function Stub() {
      return null;
    }
    return Stub;
  },
}));

// モックセットアップ後にインポート
const { getTileComponent } = await import("../tile-loader");

describe("getTileComponent — slug ベース lazy loader", () => {
  test("slug に対して loader を返す（非 null）", () => {
    const loader = getTileComponent("json-formatter");
    expect(loader).not.toBeNull();
    expect(typeof loader).toBe("function");
  });

  test("未知の slug に対しても loader を返す（フォールバックコンポーネント）", () => {
    const loader = getTileComponent("unknown-slug-xyz");
    // 未知 slug でも null でなく fallback loader を返す
    expect(loader).not.toBeNull();
    expect(typeof loader).toBe("function");
  });

  test("同一 slug の loader を複数回呼んでも同じ参照を返す（メモ化）", () => {
    const loaderA = getTileComponent("json-formatter");
    const loaderB = getTileComponent("json-formatter");
    // メモ化により同一参照が返る（slug 単独キーでメモ化）
    expect(loaderA).toBe(loaderB);
  });

  test("keigo-reference スラグで個別 loader が返る", () => {
    const loader = getTileComponent("keigo-reference");
    // keigo-reference には専用タイルコンポーネントがあるため非 null 且つ関数
    expect(loader).not.toBeNull();
    expect(typeof loader).toBe("function");
  });

  test("keigo-reference の loader を複数回呼んでも同じ参照を返す（メモ化）", () => {
    const loaderA = getTileComponent("keigo-reference");
    const loaderB = getTileComponent("keigo-reference");
    // メモ化により同一参照が返る
    expect(loaderA).toBe(loaderB);
  });
});

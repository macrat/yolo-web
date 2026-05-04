import { describe, expect, test } from "vitest";
import {
  INITIAL_DEFAULT_LAYOUT,
  type InitialDefaultLayout,
} from "../initial-default-layout";

describe("InitialDefaultLayout 型", () => {
  test("INITIAL_DEFAULT_LAYOUT は InitialDefaultLayout 型に適合する", () => {
    // 型アサーション: TypeScript コンパイル時に型チェックが行われる
    const layout: InitialDefaultLayout = INITIAL_DEFAULT_LAYOUT;
    expect(layout).toBeDefined();
  });
});

describe("INITIAL_DEFAULT_LAYOUT 定数", () => {
  test("tiles 配列が存在する", () => {
    expect(Array.isArray(INITIAL_DEFAULT_LAYOUT.tiles)).toBe(true);
  });

  test("各タイルに必須フィールド (slug, size, order) がある", () => {
    for (const tile of INITIAL_DEFAULT_LAYOUT.tiles) {
      expect(tile.slug).toBeDefined();
      expect(typeof tile.slug).toBe("string");
      expect(tile.slug.length).toBeGreaterThan(0);

      expect(tile.size).toBeDefined();
      expect(["small", "medium", "large"]).toContain(tile.size);

      expect(tile.order).toBeDefined();
      expect(typeof tile.order).toBe("number");
    }
  });

  // 配列順そのままで order === index を検証し、配置順も保護する。
  // 重複検出は別途 Set で行う。
  test("order が配列インデックスと一致する 0 始まりの連番である", () => {
    INITIAL_DEFAULT_LAYOUT.tiles.forEach((tile, index) => {
      expect(tile.order).toBe(index);
    });
  });

  test("order に重複がない", () => {
    const orders = INITIAL_DEFAULT_LAYOUT.tiles.map((t) => t.order);
    const uniqueOrders = new Set(orders);
    expect(uniqueOrders.size).toBe(orders.length);
  });

  test("slug の重複がない", () => {
    const slugs = INITIAL_DEFAULT_LAYOUT.tiles.map((t) => t.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  // variantId: 現サイクルでは全タイルで variantId 未指定。
  // Phase 7 で variantId を使う際にテストデータを追加すること。
  test("現サイクルでは全タイルで variantId が undefined である（暫定）", () => {
    for (const tile of INITIAL_DEFAULT_LAYOUT.tiles) {
      expect(tile.variantId).toBeUndefined();
    }
  });
});

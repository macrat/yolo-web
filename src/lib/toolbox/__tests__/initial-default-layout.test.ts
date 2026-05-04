import { describe, expect, test } from "vitest";
import {
  INITIAL_DEFAULT_LAYOUT,
  type InitialDefaultLayout,
} from "../initial-default-layout";
import { getTileableBySlug } from "../registry";

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

  // 件数は固定値で検証する。Phase 7 で枚数を増やすときはこのテストも書き換える。
  test("tiles は 5 件である", () => {
    expect(INITIAL_DEFAULT_LAYOUT.tiles.length).toBe(5);
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

  test("small サイズのタイルが 1 つ以上ある", () => {
    const smalls = INITIAL_DEFAULT_LAYOUT.tiles.filter(
      (t) => t.size === "small",
    );
    expect(smalls.length).toBeGreaterThanOrEqual(1);
  });

  test("medium または large サイズのタイルが 1 つ以上ある（small のみで構成されていない）", () => {
    const widers = INITIAL_DEFAULT_LAYOUT.tiles.filter(
      (t) => t.size === "medium" || t.size === "large",
    );
    expect(widers.length).toBeGreaterThanOrEqual(1);
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

  /**
   * CRIT-1: fixture-* ダミー slug ではなく、レジストリに実在する slug を使っているか。
   * fixture-* の slug は getTileableBySlug で undefined を返すため、
   * このテストが失敗した場合はダミー slug が残っている。
   */
  test("すべての slug がレジストリに実在する（fixture-* ダミーでない）", () => {
    for (const tile of INITIAL_DEFAULT_LAYOUT.tiles) {
      const tileable = getTileableBySlug(tile.slug);
      expect(
        tileable,
        `slug "${tile.slug}" がレジストリに存在しない。fixture-* ダミーのまま実 slug に差し替えていない可能性がある。`,
      ).toBeDefined();
    }
  });
});

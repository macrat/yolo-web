import { describe, expect, test } from "vitest";
import {
  INITIAL_DEFAULT_LAYOUT,
  type InitialDefaultLayout,
} from "../initial-default-layout";
import {
  FIXTURE_SMALL_1,
  FIXTURE_SMALL_2,
  FIXTURE_MEDIUM_1,
  FIXTURE_MEDIUM_2,
  FIXTURE_LARGE_1,
} from "@/components/Tile/fixtures";

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

  test("small サイズのタイルが 2 つ以上ある", () => {
    const smalls = INITIAL_DEFAULT_LAYOUT.tiles.filter(
      (t) => t.size === "small",
    );
    expect(smalls.length).toBeGreaterThanOrEqual(2);
  });

  test("medium サイズのタイルが 2 つ以上ある", () => {
    const mediums = INITIAL_DEFAULT_LAYOUT.tiles.filter(
      (t) => t.size === "medium",
    );
    expect(mediums.length).toBeGreaterThanOrEqual(2);
  });

  test("large サイズのタイルが 1 つ以上ある", () => {
    const larges = INITIAL_DEFAULT_LAYOUT.tiles.filter(
      (t) => t.size === "large",
    );
    expect(larges.length).toBeGreaterThanOrEqual(1);
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

describe("INITIAL_DEFAULT_LAYOUT とフィクスチャの実体結合", () => {
  // slug 文字列リテラルの比較だけでは、フィクスチャ側で slug や size が変わっても
  // 気づけない。実際に fixtures からインポートした値と突き合わせることで、
  // Phase 7 で実 slug への差し替え漏れ・不整合を早期検出する。
  test("INITIAL_DEFAULT_LAYOUT の各 slug はフィクスチャに実在し、size も一致する", () => {
    const fixtureBySlug = new Map([
      [FIXTURE_SMALL_1.tileable.slug, FIXTURE_SMALL_1],
      [FIXTURE_SMALL_2.tileable.slug, FIXTURE_SMALL_2],
      [FIXTURE_MEDIUM_1.tileable.slug, FIXTURE_MEDIUM_1],
      [FIXTURE_MEDIUM_2.tileable.slug, FIXTURE_MEDIUM_2],
      [FIXTURE_LARGE_1.tileable.slug, FIXTURE_LARGE_1],
    ]);

    for (const tile of INITIAL_DEFAULT_LAYOUT.tiles) {
      const fixture = fixtureBySlug.get(tile.slug);
      expect(
        fixture,
        `slug=${tile.slug} がフィクスチャに存在しない`,
      ).toBeDefined();
      expect(tile.size).toBe(fixture!.recommendedSize);
    }
  });
});

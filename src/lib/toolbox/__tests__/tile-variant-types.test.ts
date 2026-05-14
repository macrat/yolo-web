/**
 * TileVariant 型の構造テスト。
 *
 * T-C-型契約タスク（cycle-191）で新設した TileVariant 型が
 * 3 事例（keigo-reference / sql-formatter / char-count）で正しく値を埋められることを確認する。
 *
 * NOTE: TypeScript の型は実行時に存在しないため、ここでは「型の形状に沿った値が
 * JavaScript オブジェクトとして正しく構築できる」ことを検証する。
 */

import { describe, expect, test } from "vitest";
import type { TileVariant, TileGridSpan } from "../tile-variant-types";

describe("TileGridSpan 型の形状確認", () => {
  test("cols=1, rows=1 で small サイズを表現できる", () => {
    const span: TileGridSpan = { cols: 1, rows: 1 };
    expect(span.cols).toBe(1);
    expect(span.rows).toBe(1);
  });

  test("cols=2, rows=1 で medium サイズを表現できる", () => {
    const span: TileGridSpan = { cols: 2, rows: 1 };
    expect(span.cols).toBe(2);
    expect(span.rows).toBe(1);
  });

  test("cols=2, rows=2 で large サイズを表現できる", () => {
    const span: TileGridSpan = { cols: 2, rows: 2 };
    expect(span.cols).toBe(2);
    expect(span.rows).toBe(2);
  });
});

describe("TileVariant 型の基本構造", () => {
  test("必須フィールドをすべて持つ最小オブジェクトを構築できる", () => {
    const variant: TileVariant = {
      variantId: "keigo-reference-medium-search",
      gridSpan: { cols: 2, rows: 1 },
      tileDescription: "検索と候補一覧のみ。詳細例文は詳細ページで確認できます",
      loaderId: "keigo-reference-medium-search",
      isDefaultVariant: false,
    };
    expect(variant.variantId).toBe("keigo-reference-medium-search");
    expect(variant.gridSpan.cols).toBe(2);
    expect(variant.gridSpan.rows).toBe(1);
    expect(variant.tileDescription).toBeTruthy();
    expect(variant.loaderId).toBe("keigo-reference-medium-search");
    expect(variant.isDefaultVariant).toBe(false);
  });

  test("isDefaultVariant=true のバリアントを構築できる", () => {
    const variant: TileVariant = {
      variantId: "keigo-reference-medium-search",
      gridSpan: { cols: 2, rows: 1 },
      tileDescription: "検索と候補一覧のみ",
      loaderId: "keigo-reference-medium-search",
      isDefaultVariant: true,
    };
    expect(variant.isDefaultVariant).toBe(true);
  });
});

describe("3 事例の型表現確認", () => {
  describe("keigo-reference バリアント群", () => {
    const keigoReferenceVariants: TileVariant[] = [
      {
        variantId: "keigo-reference-large-full",
        gridSpan: { cols: 2, rows: 2 },
        tileDescription:
          "敬語早見表の全機能（検索・カテゴリフィルター・例文展開・誤用パターン）",
        loaderId: "keigo-reference-large-full",
        isDefaultVariant: false,
      },
      {
        variantId: "keigo-reference-medium-search",
        gridSpan: { cols: 2, rows: 1 },
        tileDescription:
          "検索と候補一覧のみ。詳細例文は詳細ページで確認できます",
        loaderId: "keigo-reference-medium-search",
        isDefaultVariant: true,
      },
      {
        variantId: "keigo-reference-medium-category-business",
        gridSpan: { cols: 2, rows: 1 },
        tileDescription: "ビジネス敬語に特化した候補一覧（カテゴリ固定）",
        loaderId: "keigo-reference-medium-category-business",
        isDefaultVariant: false,
      },
      {
        variantId: "keigo-reference-medium-mistakes",
        gridSpan: { cols: 2, rows: 1 },
        tileDescription: "よくある敬語の間違いパターン一覧",
        loaderId: "keigo-reference-medium-mistakes",
        isDefaultVariant: false,
      },
      {
        variantId: "keigo-reference-small-daily-pick",
        gridSpan: { cols: 1, rows: 1 },
        tileDescription: "今日の敬語 1 件を毎日表示",
        loaderId: "keigo-reference-small-daily-pick",
        isDefaultVariant: false,
      },
      {
        variantId: "keigo-reference-small-quick-search",
        gridSpan: { cols: 1, rows: 1 },
        tileDescription: "検索入力欄のみ。結果は詳細ページへ",
        loaderId: "keigo-reference-small-quick-search",
        isDefaultVariant: false,
      },
    ];

    test("6 バリアントすべてが構築できる", () => {
      expect(keigoReferenceVariants).toHaveLength(6);
    });

    test("各バリアントが必須フィールドをすべて持つ", () => {
      for (const v of keigoReferenceVariants) {
        expect(v.variantId, `variantId: ${v.variantId}`).toBeTruthy();
        expect(v.gridSpan, `gridSpan: ${v.variantId}`).toBeDefined();
        expect(v.gridSpan.cols, `cols: ${v.variantId}`).toBeGreaterThan(0);
        expect(v.gridSpan.rows, `rows: ${v.variantId}`).toBeGreaterThan(0);
        expect(
          v.tileDescription,
          `tileDescription: ${v.variantId}`,
        ).toBeTruthy();
        expect(v.loaderId, `loaderId: ${v.variantId}`).toBeTruthy();
        expect(
          typeof v.isDefaultVariant,
          `isDefaultVariant type: ${v.variantId}`,
        ).toBe("boolean");
      }
    });

    test("デフォルトバリアントが 1 件だけ存在する", () => {
      const defaults = keigoReferenceVariants.filter((v) => v.isDefaultVariant);
      expect(defaults).toHaveLength(1);
      expect(defaults[0].variantId).toBe("keigo-reference-medium-search");
    });

    test("variantId がすべて一意である", () => {
      const ids = keigoReferenceVariants.map((v) => v.variantId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(keigoReferenceVariants.length);
    });
  });

  describe("sql-formatter バリアント群", () => {
    const sqlFormatterVariants: TileVariant[] = [
      {
        variantId: "sql-formatter-large-full",
        gridSpan: { cols: 2, rows: 2 },
        tileDescription:
          "SQL フォーマッターの全機能（入力・整形・圧縮・オプション・コピー）",
        loaderId: "sql-formatter-large-full",
        isDefaultVariant: false,
      },
      {
        variantId: "sql-formatter-medium-format",
        gridSpan: { cols: 2, rows: 1 },
        tileDescription: "SQL を整形してクリップボードにコピー",
        loaderId: "sql-formatter-medium-format",
        isDefaultVariant: true,
      },
      {
        variantId: "sql-formatter-medium-minify",
        gridSpan: { cols: 2, rows: 1 },
        tileDescription: "SQL を 1 行に圧縮してコピー",
        loaderId: "sql-formatter-medium-minify",
        isDefaultVariant: false,
      },
    ];

    test("3 バリアントすべてが構築できる", () => {
      expect(sqlFormatterVariants).toHaveLength(3);
    });

    test("各バリアントが必須フィールドをすべて持つ", () => {
      for (const v of sqlFormatterVariants) {
        expect(v.variantId, `variantId: ${v.variantId}`).toBeTruthy();
        expect(v.gridSpan, `gridSpan: ${v.variantId}`).toBeDefined();
        expect(
          v.tileDescription,
          `tileDescription: ${v.variantId}`,
        ).toBeTruthy();
        expect(v.loaderId, `loaderId: ${v.variantId}`).toBeTruthy();
        expect(
          typeof v.isDefaultVariant,
          `isDefaultVariant type: ${v.variantId}`,
        ).toBe("boolean");
      }
    });

    test("small バリアントが存在しない（sql-formatter は small で機能成立しない）", () => {
      const smalls = sqlFormatterVariants.filter(
        (v) => v.gridSpan.cols === 1 && v.gridSpan.rows === 1,
      );
      expect(smalls).toHaveLength(0);
    });

    test("デフォルトバリアントが 1 件だけ存在する", () => {
      const defaults = sqlFormatterVariants.filter((v) => v.isDefaultVariant);
      expect(defaults).toHaveLength(1);
      expect(defaults[0].variantId).toBe("sql-formatter-medium-format");
    });
  });

  describe("char-count バリアント群", () => {
    const charCountVariants: TileVariant[] = [
      {
        variantId: "char-count-large-full",
        gridSpan: { cols: 2, rows: 2 },
        tileDescription:
          "文字数カウンターの全機能（文字数・バイト数・単語数・行数・段落数）",
        loaderId: "char-count-large-full",
        isDefaultVariant: false,
      },
      {
        variantId: "char-count-medium-text-volume",
        gridSpan: { cols: 2, rows: 1 },
        tileDescription: "文字数・バイト数をリアルタイム表示",
        loaderId: "char-count-medium-text-volume",
        isDefaultVariant: false,
      },
      {
        variantId: "char-count-medium-text-structure",
        gridSpan: { cols: 2, rows: 1 },
        tileDescription: "単語数・行数・段落数をリアルタイム表示",
        loaderId: "char-count-medium-text-structure",
        isDefaultVariant: false,
      },
      {
        variantId: "char-count-small-char-only",
        gridSpan: { cols: 1, rows: 1 },
        tileDescription: "文字数のみをリアルタイム確認",
        loaderId: "char-count-small-char-only",
        isDefaultVariant: true,
      },
    ];

    test("4 バリアントすべてが構築できる", () => {
      expect(charCountVariants).toHaveLength(4);
    });

    test("各バリアントが必須フィールドをすべて持つ", () => {
      for (const v of charCountVariants) {
        expect(v.variantId, `variantId: ${v.variantId}`).toBeTruthy();
        expect(v.gridSpan, `gridSpan: ${v.variantId}`).toBeDefined();
        expect(
          v.tileDescription,
          `tileDescription: ${v.variantId}`,
        ).toBeTruthy();
        expect(v.loaderId, `loaderId: ${v.variantId}`).toBeTruthy();
        expect(
          typeof v.isDefaultVariant,
          `isDefaultVariant type: ${v.variantId}`,
        ).toBe("boolean");
      }
    });

    test("small バリアントが 1 件存在する", () => {
      const smalls = charCountVariants.filter(
        (v) => v.gridSpan.cols === 1 && v.gridSpan.rows === 1,
      );
      expect(smalls).toHaveLength(1);
    });

    test("デフォルトバリアントが 1 件だけ存在する", () => {
      const defaults = charCountVariants.filter((v) => v.isDefaultVariant);
      expect(defaults).toHaveLength(1);
      expect(defaults[0].variantId).toBe("char-count-small-char-only");
    });
  });
});

describe("variantId 命名規則の確認", () => {
  test("variantId は '{slug}-{size}-{feature}' の形式に従う", () => {
    // keigo-reference の例
    const variant: TileVariant = {
      variantId: "keigo-reference-medium-search",
      gridSpan: { cols: 2, rows: 1 },
      tileDescription: "検索と候補一覧のみ",
      loaderId: "keigo-reference-medium-search",
      isDefaultVariant: true,
    };
    // slug-size-feature 形式: ハイフン区切りで 4 部分以上
    const parts = variant.variantId.split("-");
    expect(parts.length).toBeGreaterThanOrEqual(4);
  });

  test("loaderId は variantId と同一値を持てる（D-3 案: tile-loader が解決する）", () => {
    const variant: TileVariant = {
      variantId: "sql-formatter-medium-format",
      gridSpan: { cols: 2, rows: 1 },
      tileDescription: "SQL を整形してコピー",
      loaderId: "sql-formatter-medium-format",
      isDefaultVariant: true,
    };
    expect(variant.loaderId).toBe(variant.variantId);
  });
});

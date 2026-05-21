/**
 * T-1: タイル登録の型契約テスト（Phase 7.1）
 *
 * 原典: docs/design-migration-plan.md L49 / L101-104 / L117
 *
 * ## テスト構成
 *
 * (a) 仮想例の単体テスト:
 *   - 形態 A (single) の正例: 型チェックを通過
 *   - 形態 B (widget) の正例: 型チェックを通過
 *   - 形態 C (multi) の正例: 型チェックを通過
 *   - 不正組み合わせの負例: @ts-expect-error で型エラーを確認
 *   - 不正 kind の負例: @ts-expect-error で型エラーを確認
 *
 * (b) 4 系統実例のドライラン単体テスト:
 *   - tools: json-formatter（入力/出力の両方を持つ典型的なテキスト変換ツール）
 *   - cheatsheets: git（セクション数最多=8、cheatsheets 系統の構造的代表）
 *   - play: irodori（入力 UI=HSL スライダー、出力 UI=スコア表示。widget 形態に最も合致）
 *   - dictionary: yoji（検索・閲覧型の性質が明確、widget 形態で簡易検索ウィジェット）
 *
 * 注意: このテストは型の正確性を検証する。実コンポーネントは作成しない（原典 L117）。
 * ドライランのため、tileComponent はダミー関数コンポーネントを使用する。
 */

import { describe, expect, it } from "vitest";
import { expectTypeOf } from "vitest";
import type {
  TileDefinition,
  TileDefinitionMulti,
  TileDefinitionSingle,
  TileDefinitionWidget,
  TileSize,
} from "../tile-definition";

// ── ダミーコンポーネント（型テスト用。実装は持たない）──────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function DummyComponent(_props: Record<string, unknown>): null {
  return null;
}

// ── (a) 仮想例の単体テスト ────────────────────────────────────────────────

describe("TileDefinitionSingle (形態 A: single)", () => {
  it("正例: kind='single' + 必須フィールドすべて存在 → TileDefinitionSingle に代入可能", () => {
    const def: TileDefinitionSingle = {
      kind: "single",
      tileComponent: DummyComponent,
      recommendedSize: { cols: 2, rows: 2 },
      inputPlaceholder: "テキストを入力",
      outputPlaceholder: "結果が表示されます",
      detailPath: "/tools/sample",
    };
    // kind が "single" であることを型レベルで確認
    expectTypeOf(def.kind).toEqualTypeOf<"single">();
    // detailPath が string であることを確認
    expectTypeOf(def.detailPath).toEqualTypeOf<string>();
    // TileDefinition 親型に代入可能
    const asParent: TileDefinition = def;
    expect(asParent.kind).toBe("single");
  });

  it("TileSize フィールド: cols と rows が number 型", () => {
    const size: TileSize = { cols: 2, rows: 3 };
    expectTypeOf(size.cols).toEqualTypeOf<number>();
    expectTypeOf(size.rows).toEqualTypeOf<number>();
    expect(size.cols).toBe(2);
    expect(size.rows).toBe(3);
  });
});

describe("TileDefinitionWidget (形態 B: widget)", () => {
  it("正例: kind='widget' + 必須フィールドすべて存在 → TileDefinitionWidget に代入可能", () => {
    const def: TileDefinitionWidget = {
      kind: "widget",
      tileComponent: DummyComponent,
      recommendedSize: { cols: 2, rows: 1 },
      inputPlaceholder: "テキストを入力",
      outputPlaceholder: "結果が表示されます",
      detailPath: "/tools/sample",
      widgetSummary: "テキストを変換するツール",
    };
    expectTypeOf(def.kind).toEqualTypeOf<"widget">();
    expectTypeOf(def.widgetSummary).toEqualTypeOf<string>();
    const asParent: TileDefinition = def;
    expect(asParent.kind).toBe("widget");
  });
});

describe("TileDefinitionMulti (形態 C: multi)", () => {
  it("正例: kind='multi' + 必須フィールドすべて存在 → TileDefinitionMulti に代入可能", () => {
    const def: TileDefinitionMulti = {
      kind: "multi",
      tileComponent: DummyComponent,
      recommendedSize: { cols: 1, rows: 1 },
      inputPlaceholder: "",
      outputPlaceholder: "",
      detailPath: "/tools/sample",
      variantLabel: "compact",
    };
    expectTypeOf(def.kind).toEqualTypeOf<"multi">();
    expectTypeOf(def.variantLabel).toEqualTypeOf<string>();
    const asParent: TileDefinition = def;
    expect(asParent.kind).toBe("multi");
  });
});

describe("TileDefinition (Discriminated Union 親型)", () => {
  it("3 形態すべてが TileDefinition に代入可能", () => {
    const single: TileDefinition = {
      kind: "single",
      tileComponent: DummyComponent,
      recommendedSize: { cols: 2, rows: 2 },
      inputPlaceholder: "入力",
      outputPlaceholder: "出力",
      detailPath: "/tools/a",
    };
    const widget: TileDefinition = {
      kind: "widget",
      tileComponent: DummyComponent,
      recommendedSize: { cols: 2, rows: 1 },
      inputPlaceholder: "入力",
      outputPlaceholder: "出力",
      detailPath: "/tools/b",
      widgetSummary: "テスト用サマリー",
    };
    const multi: TileDefinition = {
      kind: "multi",
      tileComponent: DummyComponent,
      recommendedSize: { cols: 1, rows: 1 },
      inputPlaceholder: "",
      outputPlaceholder: "",
      detailPath: "/tools/c",
      variantLabel: "full",
    };
    expect(single.kind).toBe("single");
    expect(widget.kind).toBe("widget");
    expect(multi.kind).toBe("multi");
  });

  it("負例: kind='single' で widgetSummary（形態 B 固有フィールド）を混ぜると型エラー", () => {
    // expectTypeOf を使って「TileDefinitionSingle が widgetSummary を持たない」ことを確認する。
    // TileDefinitionSingle には widgetSummary キーが存在しないことを型レベルで検証。
    expectTypeOf<TileDefinitionSingle>().not.toHaveProperty("widgetSummary");
    expect(true).toBe(true);
  });

  it("負例: kind='single' で variantLabel（形態 C 固有フィールド）を混ぜると型エラー", () => {
    // TileDefinitionSingle には variantLabel キーが存在しないことを型レベルで検証。
    expectTypeOf<TileDefinitionSingle>().not.toHaveProperty("variantLabel");
    expect(true).toBe(true);
  });

  it("負例: 形態 A〜C 以外の kind は TileDefinition の kind 型に代入不可", () => {
    // TileDefinition の kind は "single" | "widget" | "multi" の union であることを確認。
    // "unknown-kind" がこの union に含まれないことを型レベルで検証。
    expectTypeOf<TileDefinition["kind"]>().toEqualTypeOf<
      "single" | "widget" | "multi"
    >();
    // "unknown-kind" は上記 union に含まれないため、代入不可（型安全）
    type IsUnknownKindAssignable = "unknown-kind" extends TileDefinition["kind"]
      ? true
      : false;
    expectTypeOf<IsUnknownKindAssignable>().toEqualTypeOf<false>();
  });
});

// ── (b) 4 系統実例のドライランテスト ────────────────────────────────────────

describe("4 系統実例のドライランテスト（型契約適合確認）", () => {
  /**
   * tools 系統: json-formatter
   *
   * 選定理由: 34 件の tools の中で「テキスト入力（JSON 文字列）→ 整形テキスト出力」という
   * 入力/出力の両方を持つ最も典型的なテキスト変換ツール。developer カテゴリで
   * JSON 整形は開発者が道具箱に置く優先度が高い。タイル内で簡易 JSON 整形を
   * 提供する widget 形態が自然。
   */
  it("tools / json-formatter: widget 形態でタイル定義が型契約を満たす", () => {
    // ドライラン: 実際のコンポーネントは Phase 8 で実装。ここでは型契約の適合を確認
    const def: TileDefinitionWidget = {
      kind: "widget",
      tileComponent: DummyComponent, // Phase 8 で JsonFormatterTile に置き換える
      recommendedSize: { cols: 2, rows: 2 }, // 2×2: 入力欄と出力欄を縦並びで収める
      inputPlaceholder: "JSONを貼り付け",
      outputPlaceholder: "整形結果",
      detailPath: "/tools/json-formatter",
      widgetSummary: "JSONの整形・圧縮・検証",
    };
    expectTypeOf(def).toMatchTypeOf<TileDefinition>();
    expect(def.kind).toBe("widget");
    expect(def.detailPath).toBe("/tools/json-formatter");
  });

  /**
   * cheatsheets 系統: git
   *
   * 選定理由: 7 件の cheatsheets の中で最もセクション数が多い（8 セクション）。
   * cheatsheets は参照型コンテンツで「入力→変換→出力」よりも「一覧表示」が主目的。
   * タイル内では検索入力と結果表示という widget 形態が適切。
   * git は開発者向けサイトで利用頻度が高く、道具箱への配置優先度も高い。
   */
  it("cheatsheets / git: widget 形態でタイル定義が型契約を満たす", () => {
    const def: TileDefinitionWidget = {
      kind: "widget",
      tileComponent: DummyComponent, // Phase 8 で GitCheatsheetTile に置き換える
      recommendedSize: { cols: 2, rows: 2 }, // 2×2: コマンド一覧を収める
      inputPlaceholder: "コマンドを検索",
      outputPlaceholder: "コマンドと説明",
      detailPath: "/cheatsheets/git",
      widgetSummary: "Gitコマンドをすぐ確認",
    };
    expectTypeOf(def).toMatchTypeOf<TileDefinition>();
    expect(def.kind).toBe("widget");
    expect(def.detailPath).toBe("/cheatsheets/git");
  });

  /**
   * play 系統: irodori（games 系統から選定）
   *
   * 選定理由: games（4件）/ quiz（15件）/ fortune（1件）の中から games 系統の irodori を選定。
   * fortune は単一機能で選定幅なし。quiz は 15 件あるが結果ページ中心でタイル化が複雑。
   * games 系統 4 件の中で irodori は「HSL スライダーで色を作成 → スコア表示」という
   * 入力 UI と出力 UI の両方が明確で、道具箱内で完結できる可能性が高い。
   * widget 形態（今日の色チャレンジ表示 + 詳細ページへの動線）が自然。
   */
  it("play / irodori: widget 形態でタイル定義が型契約を満たす", () => {
    const def: TileDefinitionWidget = {
      kind: "widget",
      tileComponent: DummyComponent, // Phase 8 で IrodoriTile に置き換える
      recommendedSize: { cols: 2, rows: 2 }, // 2×2: 色スウォッチとスコアを表示
      inputPlaceholder: "HSLで色を作成",
      outputPlaceholder: "スコア表示",
      detailPath: "/play/irodori",
      widgetSummary: "毎日の色彩チャレンジ",
    };
    expectTypeOf(def).toMatchTypeOf<TileDefinition>();
    expect(def.kind).toBe("widget");
    expect(def.detailPath).toBe("/play/irodori");
  });

  /**
   * dictionary 系統: yoji（四字熟語辞典）
   *
   * 選定理由: dictionary（kanji/yoji/colors の 3 件）+ humor-dict（1 件）の計 4 件から選定。
   * humor-dict は笑い・面白コンテンツで humor-dict 固有の性質が強い。
   * dictionary 3 件の中で yoji（四字熟語）は「検索入力 → 意味・読み表示」という
   * 入出力構造がタイル向きで、道具箱で「四字熟語をすぐ調べる」用途として widget 形態が適切。
   * kanji は「漢字 1 文字の詳細閲覧」で単純すぎる。colors は視覚的でタイルが映えるが
   * 250 色一覧はタイル内に収まらない。yoji が最も widget 形態の設計を言語化しやすい。
   */
  it("dictionary / yoji: widget 形態でタイル定義が型契約を満たす", () => {
    const def: TileDefinitionWidget = {
      kind: "widget",
      tileComponent: DummyComponent, // Phase 8 で YojiTile に置き換える
      recommendedSize: { cols: 2, rows: 1 }, // 2×1: 検索入力と結果一行表示
      inputPlaceholder: "四字熟語を検索",
      outputPlaceholder: "読みと意味",
      detailPath: "/dictionary/yoji",
      widgetSummary: "四字熟語をすぐ調べる",
    };
    expectTypeOf(def).toMatchTypeOf<TileDefinition>();
    expect(def.kind).toBe("widget");
    expect(def.detailPath).toBe("/dictionary/yoji");
  });
});

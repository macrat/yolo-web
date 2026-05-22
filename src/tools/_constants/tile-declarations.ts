/**
 * タイル化済エントリ宣言ファイル（Phase 7.3）。
 *
 * 目的:
 *   4 系統（tools / cheatsheets / play / dictionary）のタイル化済エントリを
 *   既存メタファイルを touch せずに宣言する場所。
 *
 * 既存メタファイルへの touch 禁止方針（採用設計表「タイル定義の保持」）に従い、
 * 本ファイルが「どの slug がタイル化済か」を宣言する単一の場所となる。
 *
 * Phase 7 時点では全エントリ 0 件（タイル定義を持つコンテンツがまだ存在しない）。
 * Phase 8 で各コンテンツのタイル実装が完了したら、TILE_DECLARATIONS 配列に
 * エントリを追加し、`npm run generate:tiles-registry` を実行する。
 *
 * ## Phase 8 の操作モデル（1 操作 = 1 エントリ）
 *
 * 1. タイル React コンポーネントを実装
 * 2. TILE_DECLARATIONS 配列に { domain, slug, ...TileDefinition } を 1 件追加
 *    - kind: "single" → 追加フィールドなし（TileDefinitionBase のみ）
 *    - kind: "widget" → widgetSummary が required
 *    - kind: "multi"  → variantLabel が required
 *    - 型契約により形態固有フィールドが型レベルで要求される（AP-I02 回避）
 * 3. `npm run generate:tiles-registry` を実行（prebuild でも自動実行）
 *
 * ## tileComponent の serialization について
 *
 * tileComponent は React コンポーネント参照（関数）のため codegen 出力ファイルに
 * 値として書き出すことができない（JSON シリアライズ不可）。
 * そのため codegen は domain / slug / kind 等のシリアライズ可能なフィールドのみ出力し、
 * tileComponent への参照は本ファイル（TILE_DECLARATIONS 配列）が実体として保持する。
 * 実行時に tileComponent を利用するコードは本ファイルを直接 import する。
 *
 * DELETION UNIT (for 6th failure revert):
 *   本ファイルは scripts/generate-tiles-registry.ts と一体で削除する。
 *   generate-tiles-registry.ts のコメント「DELETION UNIT」セクション参照。
 */

import type { TileDefinition } from "@/tools/_constants/tile-definition";
import CharCountTile from "@/tools/char-count/CharCountTile";
import ByteCounterTile from "@/tools/byte-counter/ByteCounterTile";
import UrlEncodeTile from "@/tools/url-encode/UrlEncodeTile";

/**
 * 系統識別子の型（4 系統）— SSoT: このファイルのみで定義する。
 *
 * tools / cheatsheets / play / dictionary の 4 値。
 * scripts/generate-tiles-registry.ts はこのファイルから import type して使用する。
 * （scripts/ → src/ の import は tsx 実行環境で可能であり、
 *  事実 generate-tiles-registry.ts は dynamic import で src/ ファイルを参照している）
 */
export type TileDomain = "tools" | "cheatsheets" | "play" | "dictionary";

/**
 * tiles-registry に登録されるエントリの型（SSoT: T-1 TileDefinition から導出）。
 *
 * TileDefinition（Discriminated Union）全体を引き継ぐため:
 * - kind フィールドが discriminant として型レベルで保持される
 * - 形態固有フィールド（widgetSummary / variantLabel）が required として要求される
 * - AP-I02（optional による形態間制約の緩和）が型レベルで防止される
 *
 * tileComponent（React コンポーネント参照）を含むため codegen 出力には
 * シリアライズ可能な domain / slug / kind のみが書き出される（上記コメント参照）。
 *
 * 型注釈が TileRegistryEntry[] であることにより、Phase 8 で TileDefinition に
 * 新フィールドを追加した際に TILE_DECLARATIONS の型チェックが自動的に失敗し、
 * 追加漏れをコンパイル時に検出できる。
 */
export type TileRegistryEntry = TileDefinition & {
  /** 系統識別子: tools / cheatsheets / play / dictionary の 4 値 */
  domain: TileDomain;
  /** コンテンツの slug（URL 用のケバブケース文字列） */
  slug: string;
};

/**
 * タイル化済エントリ宣言配列。
 *
 * 型注釈 TileRegistryEntry[] により TileDefinition の形態固有フィールドが
 * required として要求される（型レベルの整合保証）。
 *
 * Phase 7 時点: 0 件（全コンテンツのタイル定義が未実装のため）。
 * Phase 8 でタイル実装が完了した都度、エントリを追加する。
 *
 * 追加例（Phase 8 実装者向け）:
 *   {
 *     domain: "tools", slug: "json-formatter", kind: "single",
 *     tileComponent: JsonFormatterTile,
 *     recommendedSize: { cols: 2, rows: 2 },
 *     inputPlaceholder: "JSON を入力", outputPlaceholder: "整形結果",
 *     detailPath: "/tools/json-formatter",
 *   },
 *   {
 *     domain: "play", slug: "irodori", kind: "widget",
 *     tileComponent: IrodoriWidget,
 *     recommendedSize: { cols: 2, rows: 2 },
 *     inputPlaceholder: "", outputPlaceholder: "",
 *     detailPath: "/play/irodori",
 *     widgetSummary: "色彩パレット生成",  // widget 形態では required
 *   },
 */
export const TILE_DECLARATIONS: TileRegistryEntry[] = [
  // Phase 8 実装者がエントリをここに追加する
  {
    domain: "tools",
    slug: "char-count",
    kind: "widget",
    tileComponent: CharCountTile,
    recommendedSize: { cols: 3, rows: 2 },
    inputPlaceholder: "文字を入力すると数えます",
    outputPlaceholder: "",
    detailPath: "/tools/char-count",
    widgetSummary: "文字数を素早く数える",
  },
  {
    domain: "tools",
    slug: "byte-counter",
    kind: "widget",
    tileComponent: ByteCounterTile,
    recommendedSize: { cols: 3, rows: 2 },
    inputPlaceholder: "テキストを入力するとバイト数を数えます",
    outputPlaceholder: "",
    detailPath: "/tools/byte-counter",
    widgetSummary: "テキストのバイト数を素早く数える",
  },
  {
    domain: "tools",
    slug: "url-encode",
    kind: "widget",
    tileComponent: UrlEncodeTile,
    recommendedSize: { cols: 3, rows: 2 },
    inputPlaceholder: "テキストを入力すると URL エンコードします",
    outputPlaceholder: "",
    detailPath: "/tools/url-encode",
    widgetSummary: "URL エンコード／デコードを素早く確認する",
  },
];

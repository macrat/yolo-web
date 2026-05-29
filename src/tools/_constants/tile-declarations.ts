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
import Base64Tile from "@/tools/base64/Base64Tile";
import HtmlEntityTile from "@/tools/html-entity/HtmlEntityTile";
import HashGeneratorTile from "@/tools/hash-generator/HashGeneratorTile";
import FullwidthConverterTile from "@/tools/fullwidth-converter/FullwidthConverterTile";
import QrCodeTile from "@/tools/qr-code/QrCodeTile";
import KanaConverterTile from "@/tools/kana-converter/KanaConverterTile";
import LineBreakRemoverTile from "@/tools/line-break-remover/LineBreakRemoverTile";
import TextReplaceTile from "@/tools/text-replace/TextReplaceTile";
import ImageBase64Tile from "@/tools/image-base64/ImageBase64Tile";
import ImageResizerTile from "@/tools/image-resizer/ImageResizerTile";
import PasswordGeneratorTile from "@/tools/password-generator/PasswordGeneratorTile";
import TextDiffTile from "@/tools/text-diff/TextDiffTile";
import RegexTesterTile from "@/tools/regex-tester/RegexTesterTile";
import KeigoReferenceTile from "@/tools/keigo-reference/KeigoReferenceTile";

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
  {
    domain: "tools",
    slug: "base64",
    kind: "widget",
    tileComponent: Base64Tile,
    recommendedSize: { cols: 3, rows: 2 },
    inputPlaceholder: "テキストを入力すると Base64 エンコードします",
    outputPlaceholder: "",
    detailPath: "/tools/base64",
    widgetSummary: "Base64 エンコード／デコードを素早く確認する",
  },
  {
    domain: "tools",
    slug: "html-entity",
    kind: "widget",
    tileComponent: HtmlEntityTile,
    recommendedSize: { cols: 3, rows: 2 },
    inputPlaceholder:
      "テキストを入力すると HTML エンティティにエスケープします",
    outputPlaceholder: "",
    detailPath: "/tools/html-entity",
    widgetSummary:
      "HTML エンティティの エスケープ／アンエスケープを素早く確認する",
  },
  {
    domain: "tools",
    slug: "hash-generator",
    kind: "widget",
    tileComponent: HashGeneratorTile,
    recommendedSize: { cols: 3, rows: 2 },
    inputPlaceholder: "テキストを入力するとハッシュ値を計算します",
    outputPlaceholder: "",
    detailPath: "/tools/hash-generator",
    widgetSummary:
      "SHA-1 / SHA-256 / SHA-384 / SHA-512 ハッシュ値を素早く計算する",
  },
  {
    domain: "tools",
    slug: "fullwidth-converter",
    kind: "widget",
    tileComponent: FullwidthConverterTile,
    recommendedSize: { cols: 3, rows: 2 },
    inputPlaceholder: "全角テキストを入力すると半角に変換します",
    outputPlaceholder: "",
    detailPath: "/tools/fullwidth-converter",
    widgetSummary: "全角半角を素早く相互変換する",
  },
  {
    domain: "tools",
    slug: "qr-code",
    kind: "widget",
    tileComponent: QrCodeTile,
    recommendedSize: { cols: 3, rows: 3 },
    inputPlaceholder: "URL またはテキストを入力すると QR が自動生成されます",
    outputPlaceholder: "",
    detailPath: "/tools/qr-code",
    widgetSummary:
      "URL やテキストから QR コードを素早く生成してダウンロードする",
  },
  {
    domain: "tools",
    slug: "kana-converter",
    kind: "widget",
    tileComponent: KanaConverterTile,
    recommendedSize: { cols: 3, rows: 2 },
    inputPlaceholder: "テキストを入力すると変換します",
    outputPlaceholder: "",
    detailPath: "/tools/kana-converter",
    widgetSummary: "ひらがな・カタカナを素早く相互変換する",
  },
  {
    domain: "tools",
    slug: "line-break-remover",
    kind: "widget",
    tileComponent: LineBreakRemoverTile,
    recommendedSize: { cols: 3, rows: 2 },
    inputPlaceholder: "テキストを入力すると改行を削除します",
    outputPlaceholder: "",
    detailPath: "/tools/line-break-remover",
    widgetSummary: "改行を素早く削除・スペース置換する（PDF コピペにも対応）",
  },
  {
    domain: "tools",
    slug: "text-replace",
    kind: "widget",
    tileComponent: TextReplaceTile,
    recommendedSize: { cols: 3, rows: 3 },
    inputPlaceholder: "テキストを入力すると文字列を置換します",
    outputPlaceholder: "",
    detailPath: "/tools/text-replace",
    widgetSummary: "テキストの文字列を素早く一括置換する",
  },
  {
    domain: "tools",
    slug: "image-base64",
    kind: "widget",
    tileComponent: ImageBase64Tile,
    recommendedSize: { cols: 3, rows: 3 },
    inputPlaceholder: "",
    outputPlaceholder: "",
    detailPath: "/tools/image-base64",
    widgetSummary: "画像を Base64 / Data URI に素早く変換する",
  },
  {
    domain: "tools",
    slug: "image-resizer",
    kind: "widget",
    tileComponent: ImageResizerTile,
    recommendedSize: { cols: 3, rows: 3 },
    inputPlaceholder: "",
    outputPlaceholder: "",
    detailPath: "/tools/image-resizer",
    widgetSummary: "画像を指定サイズにリサイズしてダウンロードする",
  },
  {
    domain: "tools",
    slug: "password-generator",
    kind: "widget",
    tileComponent: PasswordGeneratorTile,
    recommendedSize: { cols: 3, rows: 2 },
    inputPlaceholder: "",
    outputPlaceholder: "",
    detailPath: "/tools/password-generator",
    widgetSummary:
      "ワンクリックで安全なパスワードを生成してコピーする（ブラウザ完結）",
  },
  {
    domain: "tools",
    slug: "text-diff",
    kind: "widget",
    tileComponent: TextDiffTile,
    recommendedSize: { cols: 3, rows: 3 },
    inputPlaceholder: "変更前を貼り付け",
    outputPlaceholder: "",
    detailPath: "/tools/text-diff",
    widgetSummary: "2 つのテキストの差分を素早く可視化する",
  },
  {
    domain: "tools",
    slug: "regex-tester",
    kind: "widget",
    tileComponent: RegexTesterTile,
    recommendedSize: { cols: 3, rows: 3 },
    inputPlaceholder: "/* 例: \\d{4}-\\d{2}-\\d{2} */",
    outputPlaceholder: "マッチ結果がここに表示されます",
    detailPath: "/tools/regex-tester",
    widgetSummary:
      "正規表現を即時テスト。パターン + テキスト → マッチ位置と件数を表示。",
  },
  {
    domain: "tools",
    slug: "keigo-reference",
    kind: "widget",
    tileComponent: KeigoReferenceTile,
    recommendedSize: { cols: 3, rows: 3 },
    inputPlaceholder: "動詞を検索（例: 行く）",
    outputPlaceholder: "",
    detailPath: "/tools/keigo-reference",
    widgetSummary:
      "敬語（尊敬語・謙譲語）を即時検索。60語を逆引き対応でコピーまで最短到達。",
  },
];

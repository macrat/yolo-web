/**
 * toolbox-catalog — 道具箱に並べられるタイルのカタログ（全39エントリ）
 *
 * cycle-230 T-3: ToolboxContent.tsx に JSX としてハードコードされていた39枚
 * （34ツールの full variant 各1 ＋ 形ファミリー代表の固定 variant 5枚）を、
 * 「来訪者が選ぶための選択肢の一覧」としてデータ化したもの。
 *
 * ## 位置づけ（重要）
 *
 * - **道具箱描画専用の暫定データ**であり、B-502（型契約／レジストリの全面再設計）の
 *   前身ではない。全ツールへの構造強制は行わない。
 * - 置き場所はこのディレクトリ（src/app/(new)/toolbox/）に限定し、src/tools/ 側には置かない。
 *
 * ## 表示名をリテラルで保持する理由（バンドルサイズ対策）
 *
 * 表示名は各ツールの ToolMeta.name と同一文字列のリテラルとして保持する。
 * `@/tools/registry` を import すると全34ツールの meta（description / howItWorks /
 * faq 等の SEO 長文、合計約85KB）がクライアントバンドルへ取り込まれてしまうため
 * （AP-I03、bundle-budget.test.ts のトップ `/` 50KB 上限）、クライアントには
 * name のみを埋め込む。ToolMeta.name / category との一致は
 * __tests__/toolbox-catalog.test.ts がレジストリと突き合わせて機械的に検証する
 * （手書きドリフトの構造的防止）。
 *
 * ## 寸法
 *
 * 寸法はセル数（cols × rows）のみを保持し、px 換算は
 * tile-grid.ts の calcTilePixels に委譲する（数値直書き禁止）。
 *
 * ## タイルはリンク/カードではない（cycle-175 の失敗を繰り返さない）
 *
 * renderTile が返すのは "use client" の自己完結タイル（生きたインスタンス）であり、
 * 詳細ページへの誘導カードではない。詳細は docs/knowledge/tile-architecture.md。
 */

import type { ReactElement } from "react";

import type { ToolCategory } from "@/tools/types";

// --- developer カテゴリ ---
import ColorConverterTile from "@/tools/color-converter/ColorConverterTile";
import CronParserTile from "@/tools/cron-parser/CronParserTile";
import CsvConverterTile from "@/tools/csv-converter/CsvConverterTile";
import DateCalculatorTile from "@/tools/date-calculator/DateCalculatorTile";
import EmailValidatorTile from "@/tools/email-validator/EmailValidatorTile";
import JsonFormatterTile from "@/tools/json-formatter/JsonFormatterTile";
import MarkdownPreviewTile from "@/tools/markdown-preview/MarkdownPreviewTile";
import NumberBaseConverterTile from "@/tools/number-base-converter/NumberBaseConverterTile";
import RegexTesterTile from "@/tools/regex-tester/RegexTesterTile";
import SqlFormatterTile from "@/tools/sql-formatter/SqlFormatterTile";
import UnixTimestampTile from "@/tools/unix-timestamp/UnixTimestampTile";
import YamlFormatterTile from "@/tools/yaml-formatter/YamlFormatterTile";
// --- text カテゴリ ---
import BusinessEmailTile from "@/tools/business-email/BusinessEmailTile";
import ByteCounterTile from "@/tools/byte-counter/ByteCounterTile";
import CharCountTile from "@/tools/char-count/CharCountTile";
import FullwidthConverterTile from "@/tools/fullwidth-converter/FullwidthConverterTile";
import KanaConverterTile from "@/tools/kana-converter/KanaConverterTile";
import KeigoReferenceTile from "@/tools/keigo-reference/KeigoReferenceTile";
import LineBreakRemoverTile from "@/tools/line-break-remover/LineBreakRemoverTile";
import TextDiffTile from "@/tools/text-diff/TextDiffTile";
import TextReplaceTile from "@/tools/text-replace/TextReplaceTile";
// --- generator カテゴリ ---
import AgeCalculatorTile from "@/tools/age-calculator/AgeCalculatorTile";
import BmiCalculatorTile from "@/tools/bmi-calculator/BmiCalculatorTile";
import DummyTextTile from "@/tools/dummy-text/DummyTextTile";
import ImageResizerTile from "@/tools/image-resizer/ImageResizerTile";
import QrCodeTile from "@/tools/qr-code/QrCodeTile";
import TraditionalColorPaletteTile from "@/tools/traditional-color-palette/TraditionalColorPaletteTile";
import UnitConverterTile from "@/tools/unit-converter/UnitConverterTile";
// --- encoding カテゴリ ---
import Base64Tile from "@/tools/base64/Base64Tile";
import HtmlEntityTile from "@/tools/html-entity/HtmlEntityTile";
import ImageBase64Tile from "@/tools/image-base64/ImageBase64Tile";
import UrlEncodeTile from "@/tools/url-encode/UrlEncodeTile";
// --- security カテゴリ ---
import HashGeneratorTile from "@/tools/hash-generator/HashGeneratorTile";
import PasswordGeneratorTile from "@/tools/password-generator/PasswordGeneratorTile";

/** 道具箱カタログの1エントリ（タイル1種の定義） */
export interface ToolboxCatalogEntry {
  /** カタログエントリ id（`${slug}:${variant}` 形式・カタログ内で一意） */
  id: string;
  /** ツールの slug（src/tools/<slug>/） */
  slug: string;
  /** タイルの variant（同一コンポーネントの設定差。別実装ではない） */
  variant: string;
  /** 表示名（ToolMeta.name と同一。テストでドリフトを検証） */
  name: string;
  /** 固定 variant の補足ラベル（例: 「エンコード専用」）。full には付けない */
  variantLabel?: string;
  /**
   * 表示・aria-label 用の一意なラベル。
   * 同名ツールの full と固定 variant を区別するため variantLabel を括弧で付与する。
   */
  displayLabel: string;
  /** カテゴリ（ToolMeta.category と同一。テストでドリフトを検証） */
  category: ToolCategory;
  /** タイル幅のセル数（px 換算は calcTilePixels に委譲） */
  cols: number;
  /** タイル高さのセル数（px 換算は calcTilePixels に委譲） */
  rows: number;
  /** 生きたタイルを描画する（リンク/カードではない）。className はタイルに渡す */
  renderTile: (tileClassName: string) => ReactElement;
}

/**
 * カタログ定義のカテゴリ順。カタログの並び（カテゴリ単位でまとまっている
 * こと）の機械検証に使う。cycle-232（Phase 10.3 本公開）でデフォルト構成が
 * daily-life プリセットになって以降、道具箱の表示にカテゴリ見出しは
 * 使われない（表示モデルは ToolboxContent.tsx 冒頭コメント参照）。
 */
export const TOOLBOX_CATEGORY_ORDER: readonly ToolCategory[] = [
  "developer",
  "text",
  "generator",
  "encoding",
  "security",
];

/** id と displayLabel を導出してエントリを組み立てるヘルパー */
function defineEntry(
  input: Omit<ToolboxCatalogEntry, "id" | "displayLabel">,
): ToolboxCatalogEntry {
  return {
    ...input,
    id: `${input.slug}:${input.variant}`,
    displayLabel: input.variantLabel
      ? `${input.name}（${input.variantLabel}）`
      : input.name,
  };
}

/**
 * 道具箱カタログ（カタログ定義順 = 「タイルを追加」パネルの表示順）。
 *
 * 順序はカテゴリ単位（TOOLBOX_CATEGORY_ORDER）でまとまっており、
 * 固定 variant は対応する full タイルの直後に置く
 * （「同じツールの別の見せ方」であることが来訪者に分かるようにする）。
 * デフォルト構成（保存構成がない来訪者の初期道具箱）はカタログではなく
 * toolbox-presets.ts の DEFAULT_TOOLBOX_ITEM_IDS（daily-life プリセット）。
 */
export const TOOLBOX_CATALOG: readonly ToolboxCatalogEntry[] = [
  // =========================================================================
  // developer（12ツール × full ＋ 固定 variant 2枚）
  // =========================================================================
  defineEntry({
    slug: "color-converter",
    variant: "full",
    name: "カラーコード変換",
    category: "developer",
    cols: 5,
    rows: 4,
    renderTile: (c) => (
      <ColorConverterTile variant="full" as="div" className={c} />
    ),
  }),
  defineEntry({
    slug: "cron-parser",
    variant: "full",
    name: "Cron式解析",
    category: "developer",
    cols: 4,
    rows: 6,
    renderTile: (c) => <CronParserTile variant="full" as="div" className={c} />,
  }),
  defineEntry({
    slug: "csv-converter",
    variant: "full",
    name: "CSV/TSV変換",
    category: "developer",
    cols: 5,
    rows: 5,
    renderTile: (c) => (
      <CsvConverterTile variant="full" as="div" className={c} />
    ),
  }),
  defineEntry({
    slug: "date-calculator",
    variant: "full",
    name: "日付計算",
    category: "developer",
    cols: 4,
    rows: 6,
    renderTile: (c) => (
      <DateCalculatorTile variant="full" as="div" className={c} />
    ),
  }),
  defineEntry({
    slug: "email-validator",
    variant: "full",
    name: "メールアドレスバリデーター",
    category: "developer",
    cols: 4,
    rows: 4,
    renderTile: (c) => (
      <EmailValidatorTile variant="full" as="div" className={c} />
    ),
  }),
  defineEntry({
    slug: "json-formatter",
    variant: "full",
    name: "JSON整形・検証",
    category: "developer",
    cols: 4,
    rows: 5,
    renderTile: (c) => (
      <JsonFormatterTile variant="full" as="div" className={c} />
    ),
  }),
  // 固定 variant ─ フォーマッタ系ファミリー代表（full の直後に配置）
  defineEntry({
    slug: "json-formatter",
    variant: "format-only",
    name: "JSON整形・検証",
    variantLabel: "整形専用",
    category: "developer",
    cols: 4,
    rows: 5,
    renderTile: (c) => (
      <JsonFormatterTile variant="format-only" as="div" className={c} />
    ),
  }),
  defineEntry({
    slug: "markdown-preview",
    variant: "full",
    name: "Markdownプレビュー",
    category: "developer",
    cols: 5,
    rows: 6,
    renderTile: (c) => (
      <MarkdownPreviewTile variant="full" as="div" className={c} />
    ),
  }),
  defineEntry({
    slug: "number-base-converter",
    variant: "full",
    name: "進数変換",
    category: "developer",
    cols: 4,
    rows: 4,
    renderTile: (c) => (
      <NumberBaseConverterTile variant="full" as="div" className={c} />
    ),
  }),
  // 固定 variant ─ 多モード変換系ファミリー代表（2進→16進固定）
  defineEntry({
    slug: "number-base-converter",
    variant: "bin-hex",
    name: "進数変換",
    variantLabel: "2進→16進専用",
    category: "developer",
    cols: 4,
    rows: 4,
    renderTile: (c) => (
      <NumberBaseConverterTile variant="bin-hex" as="div" className={c} />
    ),
  }),
  defineEntry({
    slug: "regex-tester",
    variant: "full",
    name: "正規表現テスター",
    category: "developer",
    cols: 5,
    rows: 6,
    renderTile: (c) => (
      <RegexTesterTile variant="full" as="div" className={c} />
    ),
  }),
  defineEntry({
    slug: "sql-formatter",
    variant: "full",
    name: "SQL整形",
    category: "developer",
    cols: 4,
    rows: 5,
    renderTile: (c) => (
      <SqlFormatterTile variant="full" as="div" className={c} />
    ),
  }),
  defineEntry({
    slug: "unix-timestamp",
    variant: "full",
    name: "UNIXタイムスタンプ変換",
    category: "developer",
    cols: 4,
    rows: 5,
    renderTile: (c) => (
      <UnixTimestampTile variant="full" as="div" className={c} />
    ),
  }),
  defineEntry({
    slug: "yaml-formatter",
    variant: "full",
    name: "YAML整形・変換",
    category: "developer",
    cols: 4,
    rows: 5,
    renderTile: (c) => (
      <YamlFormatterTile variant="full" as="div" className={c} />
    ),
  }),

  // =========================================================================
  // text（9ツール × full ＋ 固定 variant 1枚）
  // =========================================================================
  defineEntry({
    slug: "business-email",
    variant: "full",
    name: "ビジネスメール作成",
    category: "text",
    cols: 5,
    rows: 6,
    renderTile: (c) => (
      <BusinessEmailTile variant="full" as="div" className={c} />
    ),
  }),
  defineEntry({
    slug: "byte-counter",
    variant: "full",
    name: "バイト数計算",
    category: "text",
    cols: 4,
    rows: 5,
    renderTile: (c) => (
      <ByteCounterTile variant="full" as="div" className={c} />
    ),
  }),
  defineEntry({
    slug: "char-count",
    variant: "full",
    name: "文字数カウント",
    category: "text",
    cols: 4,
    rows: 5,
    renderTile: (c) => <CharCountTile variant="full" as="div" className={c} />,
  }),
  defineEntry({
    slug: "fullwidth-converter",
    variant: "full",
    name: "全角半角変換",
    category: "text",
    cols: 4,
    rows: 5,
    renderTile: (c) => (
      <FullwidthConverterTile variant="full" as="div" className={c} />
    ),
  }),
  defineEntry({
    slug: "kana-converter",
    variant: "full",
    name: "ひらがな・カタカナ変換",
    category: "text",
    cols: 4,
    rows: 5,
    renderTile: (c) => (
      <KanaConverterTile variant="full" as="div" className={c} />
    ),
  }),
  // 固定 variant ─ テキスト変換系ファミリー代表（ひらがな→カタカナ固定）
  defineEntry({
    slug: "kana-converter",
    variant: "hiragana-to-katakana",
    name: "ひらがな・カタカナ変換",
    variantLabel: "ひらがな→カタカナ専用",
    category: "text",
    cols: 4,
    rows: 5,
    renderTile: (c) => (
      <KanaConverterTile
        variant="hiragana-to-katakana"
        as="div"
        className={c}
      />
    ),
  }),
  defineEntry({
    slug: "keigo-reference",
    variant: "full",
    name: "敬語早見表",
    category: "text",
    cols: 5,
    rows: 5,
    renderTile: (c) => (
      <KeigoReferenceTile variant="full" as="div" className={c} />
    ),
  }),
  defineEntry({
    slug: "line-break-remover",
    variant: "full",
    name: "改行削除",
    category: "text",
    cols: 4,
    rows: 5,
    renderTile: (c) => (
      <LineBreakRemoverTile variant="full" as="div" className={c} />
    ),
  }),
  defineEntry({
    slug: "text-diff",
    variant: "full",
    name: "テキスト差分比較",
    category: "text",
    cols: 5,
    rows: 6,
    renderTile: (c) => <TextDiffTile variant="full" as="div" className={c} />,
  }),
  defineEntry({
    slug: "text-replace",
    variant: "full",
    name: "テキスト置換",
    category: "text",
    cols: 4,
    rows: 5,
    renderTile: (c) => (
      <TextReplaceTile variant="full" as="div" className={c} />
    ),
  }),

  // =========================================================================
  // generator（7ツール × full）
  // =========================================================================
  defineEntry({
    slug: "age-calculator",
    variant: "full",
    name: "年齢計算",
    category: "generator",
    cols: 4,
    rows: 4,
    renderTile: (c) => (
      <AgeCalculatorTile variant="full" as="div" className={c} />
    ),
  }),
  defineEntry({
    slug: "bmi-calculator",
    variant: "full",
    name: "BMI計算",
    category: "generator",
    cols: 4,
    rows: 4,
    renderTile: (c) => (
      <BmiCalculatorTile variant="full" as="div" className={c} />
    ),
  }),
  defineEntry({
    slug: "dummy-text",
    variant: "full",
    name: "ダミーテキスト生成",
    category: "generator",
    cols: 4,
    rows: 5,
    renderTile: (c) => <DummyTextTile variant="full" as="div" className={c} />,
  }),
  defineEntry({
    slug: "image-resizer",
    variant: "full",
    name: "画像リサイズ",
    category: "generator",
    cols: 5,
    rows: 6,
    renderTile: (c) => (
      <ImageResizerTile variant="full" as="div" className={c} />
    ),
  }),
  defineEntry({
    slug: "qr-code",
    variant: "full",
    name: "QRコード生成",
    category: "generator",
    cols: 4,
    rows: 5,
    renderTile: (c) => <QrCodeTile variant="full" as="div" className={c} />,
  }),
  defineEntry({
    slug: "traditional-color-palette",
    variant: "full",
    name: "伝統色カラーパレット",
    category: "generator",
    cols: 5,
    rows: 5,
    renderTile: (c) => (
      <TraditionalColorPaletteTile variant="full" as="div" className={c} />
    ),
  }),
  defineEntry({
    slug: "unit-converter",
    variant: "full",
    name: "単位変換",
    category: "generator",
    cols: 4,
    rows: 5,
    renderTile: (c) => (
      <UnitConverterTile variant="full" as="div" className={c} />
    ),
  }),

  // =========================================================================
  // encoding（4ツール × full ＋ 固定 variant 2枚）
  // =========================================================================
  defineEntry({
    slug: "base64",
    variant: "full",
    name: "Base64エンコード・デコード",
    category: "encoding",
    cols: 4,
    rows: 4,
    renderTile: (c) => <Base64Tile variant="full" as="div" className={c} />,
  }),
  defineEntry({
    slug: "html-entity",
    variant: "full",
    name: "HTMLエンティティ変換",
    category: "encoding",
    cols: 4,
    rows: 4,
    renderTile: (c) => <HtmlEntityTile variant="full" as="div" className={c} />,
  }),
  defineEntry({
    slug: "image-base64",
    variant: "full",
    name: "画像Base64変換",
    category: "encoding",
    cols: 4,
    rows: 5,
    renderTile: (c) => (
      <ImageBase64Tile variant="full" as="div" className={c} />
    ),
  }),
  // 固定 variant ─ ファイルI/O系ファミリー代表（エンコード固定）
  defineEntry({
    slug: "image-base64",
    variant: "encode",
    name: "画像Base64変換",
    variantLabel: "エンコード専用",
    category: "encoding",
    cols: 4,
    rows: 5,
    renderTile: (c) => (
      <ImageBase64Tile variant="encode" as="div" className={c} />
    ),
  }),
  defineEntry({
    slug: "url-encode",
    variant: "full",
    name: "URLエンコード・デコード",
    category: "encoding",
    cols: 4,
    rows: 4,
    renderTile: (c) => <UrlEncodeTile variant="full" as="div" className={c} />,
  }),
  // 固定 variant ─ 方向変換系ファミリー代表（エンコード固定）
  defineEntry({
    slug: "url-encode",
    variant: "encode",
    name: "URLエンコード・デコード",
    variantLabel: "エンコード専用",
    category: "encoding",
    cols: 3,
    rows: 4,
    renderTile: (c) => (
      <UrlEncodeTile variant="encode" as="div" className={c} />
    ),
  }),

  // =========================================================================
  // security（2ツール × full）
  // =========================================================================
  defineEntry({
    slug: "hash-generator",
    variant: "full",
    name: "ハッシュ生成",
    category: "security",
    cols: 4,
    rows: 4,
    renderTile: (c) => (
      <HashGeneratorTile variant="full" as="div" className={c} />
    ),
  }),
  defineEntry({
    slug: "password-generator",
    variant: "full",
    name: "パスワード生成",
    category: "security",
    cols: 4,
    rows: 4,
    renderTile: (c) => (
      <PasswordGeneratorTile variant="full" as="div" className={c} />
    ),
  }),
];

/** id → エントリの索引 */
export const TOOLBOX_CATALOG_BY_ID: ReadonlyMap<string, ToolboxCatalogEntry> =
  new Map(TOOLBOX_CATALOG.map((entry) => [entry.id, entry]));

/** カタログに実在する id の集合（永続化データの未知 id 除去に使う） */
export const TOOLBOX_CATALOG_IDS: ReadonlySet<string> = new Set(
  TOOLBOX_CATALOG.map((entry) => entry.id),
);

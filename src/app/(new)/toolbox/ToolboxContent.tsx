"use client";

/**
 * ToolboxContent — 道具箱プレビューのインタラクティブ部分
 *
 * cycle-228 T-31: 全34ツールの full variant 各1枚 +
 *   形ファミリー代表の固定 variant 5枚 = 合計39枚の生きたタイル。
 *
 * ## タイル配置（計39枚）
 *
 * カテゴリ別セクション見出し（ToolMeta.category をそのまま表示する暫定整理。
 * 新たな分類体系・フィルタ UI・状態は導入しない。B-312/B-502 で置換可能）:
 *   1. developer (12ツール × full 各1)
 *   2. text      (9ツール × full 各1)
 *   3. generator (7ツール × full 各1)
 *   4. encoding  (4ツール × full 各1)
 *   5. security  (2ツール × full 各1)
 *
 * 固定 variant 5枚（形ファミリー代表・全カテゴリの末尾にまとめて配置）:
 *   - url-encode `encode`        （方向変換系代表）
 *   - kana-converter `hiragana-to-katakana` （テキスト変換系代表）
 *   - number-base-converter `bin-hex`        （多モード変換系代表）
 *   - json-formatter `format-only`           （フォーマッタ系代表）
 *   - image-base64 `encode`                  （ファイルI/O系代表）
 *
 * 固定 variant は対応する full タイルのすぐ隣に配置し、
 * 「同じツールの別の見せ方」であることが来訪者に分かるようにする。
 *
 * ## 重要: リンク/カードではない（cycle-175 の失敗を繰り返さない）
 *
 * タイルは <Link> でも詳細ページへの誘導カードでもない。
 * 各タイルは "use client" の自己完結コンポーネントで、
 * この道具箱の中で直接入力・変換・コピーができる。
 *
 * ## タイル寸法（tile-grid.ts 規格: TILE_CELL_PX=128 / TILE_GAP_PX=8）
 *
 * calcTilePixels(cols, rows) = { width: 136*cols - 8, height: 136*rows - 8 }
 * maxWidth + width:100% でレスポンシブ（固定 width 禁止 = w360 横はみ出し防止）。
 * 規格に収まらない場合は機能を削らずに minHeight でオーバーフローを許容する。
 */

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

import { calcTilePixels } from "@/tools/_constants/tile-grid";
import styles from "./ToolboxContent.module.css";

// ---------------------------------------------------------------------------
// タイル寸法を tile-grid.ts 規格から計算（推奨幅の上限として使用）
// ---------------------------------------------------------------------------

/** 4×4 = 536×536px: 標準的な full タイルの上限サイズ */
const S4x4 = calcTilePixels(4, 4);

/** 4×5 = 536×672px: fullwidth-converter・kana-converter など縦長タイルの上限 */
const S4x5 = calcTilePixels(4, 5);

/** 4×6 = 536×808px: cron-parser・regex-tester など複合UIタイルの上限 */
const S4x6 = calcTilePixels(4, 6);

/** 5×4 = 672×536px: color-converter・text-diff など横幅が必要なタイルの上限 */
const S5x4 = calcTilePixels(5, 4);

/** 5×5 = 672×672px: keigo-reference・traditional-color-palette など広いタイルの上限 */
const S5x5 = calcTilePixels(5, 5);

/** 5×6 = 672×808px: markdown-preview・image-resizer など大型タイルの上限 */
const S5x6 = calcTilePixels(5, 6);

/** 3×4 = 400×536px: url-encode encode/decode など方向固定の variant タイルの上限 */
const S3x4 = calcTilePixels(3, 4);

export default function ToolboxContent() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>道具箱プレビュー</h1>
        <p className={styles.description}>
          タイルを並べる道具箱のプレビューです。各タイルはこのページを離れずにその場で機能します。
          <br />
          <small className={styles.note}>
            （このページは開発プレビューです。DnD・永続化・公開は後続で追加予定）
          </small>
        </p>
      </div>

      {/* ===================================================================
          カテゴリ: developer（12ツール）
          ツール件数最多。開発・フォーマット・変換・計算系。
          =================================================================== */}
      <section className={styles.category}>
        <h2 className={styles.categoryHeading}>developer</h2>
        <div className={styles.grid}>
          {/* color-converter (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S5x4.width, minHeight: S5x4.height }}
          >
            <ColorConverterTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* cron-parser (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x6.width, minHeight: S4x6.height }}
          >
            <CronParserTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* csv-converter (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S5x5.width, minHeight: S5x5.height }}
          >
            <CsvConverterTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* date-calculator (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x6.width, minHeight: S4x6.height }}
          >
            <DateCalculatorTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* email-validator (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x4.width, minHeight: S4x4.height }}
          >
            <EmailValidatorTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* json-formatter (full) + format-only 固定 variant（フォーマッタ系代表）*/}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x5.width, minHeight: S4x5.height }}
          >
            <JsonFormatterTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* json-formatter (format-only): 固定 variant ─ フォーマッタ系ファミリー代表
              full と並べて「同じツールの別の見せ方」であることを示す */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x5.width, minHeight: S4x5.height }}
          >
            <JsonFormatterTile
              variant="format-only"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* markdown-preview (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S5x6.width, minHeight: S5x6.height }}
          >
            <MarkdownPreviewTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* number-base-converter (full) + bin-hex 固定 variant（多モード変換系代表）*/}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x4.width, minHeight: S4x4.height }}
          >
            <NumberBaseConverterTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* number-base-converter (bin-hex): 固定 variant ─ 多モード変換系ファミリー代表
              full と並べて「同じツールの別の見せ方」（2進→16進固定）であることを示す */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x4.width, minHeight: S4x4.height }}
          >
            <NumberBaseConverterTile
              variant="bin-hex"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* regex-tester (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S5x6.width, minHeight: S5x6.height }}
          >
            <RegexTesterTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* sql-formatter (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x5.width, minHeight: S4x5.height }}
          >
            <SqlFormatterTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* unix-timestamp (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x5.width, minHeight: S4x5.height }}
          >
            <UnixTimestampTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* yaml-formatter (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x5.width, minHeight: S4x5.height }}
          >
            <YamlFormatterTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>
        </div>
      </section>

      {/* ===================================================================
          カテゴリ: text（9ツール）
          文字列処理・テキスト変換・文書作成支援系。
          =================================================================== */}
      <section className={styles.category}>
        <h2 className={styles.categoryHeading}>text</h2>
        <div className={styles.grid}>
          {/* business-email (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S5x6.width, minHeight: S5x6.height }}
          >
            <BusinessEmailTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* byte-counter (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x5.width, minHeight: S4x5.height }}
          >
            <ByteCounterTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* char-count (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x5.width, minHeight: S4x5.height }}
          >
            <CharCountTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* fullwidth-converter (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x5.width, minHeight: S4x5.height }}
          >
            <FullwidthConverterTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* kana-converter (full) + hiragana-to-katakana 固定 variant（テキスト変換系代表）*/}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x5.width, minHeight: S4x5.height }}
          >
            <KanaConverterTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* kana-converter (hiragana-to-katakana): 固定 variant ─ テキスト変換系ファミリー代表
              full と並べて「同じツールの別の見せ方」（ひらがな→カタカナ固定）であることを示す */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x5.width, minHeight: S4x5.height }}
          >
            <KanaConverterTile
              variant="hiragana-to-katakana"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* keigo-reference (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S5x5.width, minHeight: S5x5.height }}
          >
            <KeigoReferenceTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* line-break-remover (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x5.width, minHeight: S4x5.height }}
          >
            <LineBreakRemoverTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* text-diff (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S5x6.width, minHeight: S5x6.height }}
          >
            <TextDiffTile variant="full" as="div" className={styles.liveTile} />
          </div>

          {/* text-replace (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x5.width, minHeight: S4x5.height }}
          >
            <TextReplaceTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>
        </div>
      </section>

      {/* ===================================================================
          カテゴリ: generator（7ツール）
          画像・QR・テキスト生成・単位変換・計算系。
          =================================================================== */}
      <section className={styles.category}>
        <h2 className={styles.categoryHeading}>generator</h2>
        <div className={styles.grid}>
          {/* age-calculator (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x4.width, minHeight: S4x4.height }}
          >
            <AgeCalculatorTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* bmi-calculator (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x4.width, minHeight: S4x4.height }}
          >
            <BmiCalculatorTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* dummy-text (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x5.width, minHeight: S4x5.height }}
          >
            <DummyTextTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* image-resizer (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S5x6.width, minHeight: S5x6.height }}
          >
            <ImageResizerTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* qr-code (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x5.width, minHeight: S4x5.height }}
          >
            <QrCodeTile variant="full" as="div" className={styles.liveTile} />
          </div>

          {/* traditional-color-palette (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S5x5.width, minHeight: S5x5.height }}
          >
            <TraditionalColorPaletteTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* unit-converter (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x5.width, minHeight: S4x5.height }}
          >
            <UnitConverterTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>
        </div>
      </section>

      {/* ===================================================================
          カテゴリ: encoding（4ツール）
          URL・HTML・Base64・画像のエンコード/デコード系。
          =================================================================== */}
      <section className={styles.category}>
        <h2 className={styles.categoryHeading}>encoding</h2>
        <div className={styles.grid}>
          {/* base64 (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x4.width, minHeight: S4x4.height }}
          >
            <Base64Tile variant="full" as="div" className={styles.liveTile} />
          </div>

          {/* html-entity (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x4.width, minHeight: S4x4.height }}
          >
            <HtmlEntityTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* image-base64 (full) + encode 固定 variant（ファイルI/O系代表）*/}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x5.width, minHeight: S4x5.height }}
          >
            <ImageBase64Tile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* image-base64 (encode): 固定 variant ─ ファイルI/O系ファミリー代表
              full と並べて「同じツールの別の見せ方」（エンコード固定）であることを示す */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x5.width, minHeight: S4x5.height }}
          >
            <ImageBase64Tile
              variant="encode"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* url-encode (full) + encode 固定 variant（方向変換系代表）*/}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x4.width, minHeight: S4x4.height }}
          >
            <UrlEncodeTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* url-encode (encode): 固定 variant ─ 方向変換系ファミリー代表
              full と並べて「同じツールの別の見せ方」（エンコード固定）であることを示す */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S3x4.width, minHeight: S3x4.height }}
          >
            <UrlEncodeTile
              variant="encode"
              as="div"
              className={styles.liveTile}
            />
          </div>
        </div>
      </section>

      {/* ===================================================================
          カテゴリ: security（2ツール）
          ハッシュ生成・パスワード生成系。
          =================================================================== */}
      <section className={styles.category}>
        <h2 className={styles.categoryHeading}>security</h2>
        <div className={styles.grid}>
          {/* hash-generator (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x4.width, minHeight: S4x4.height }}
          >
            <HashGeneratorTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>

          {/* password-generator (full) */}
          <div
            className={styles.tileWrapper}
            style={{ maxWidth: S4x4.width, minHeight: S4x4.height }}
          >
            <PasswordGeneratorTile
              variant="full"
              as="div"
              className={styles.liveTile}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

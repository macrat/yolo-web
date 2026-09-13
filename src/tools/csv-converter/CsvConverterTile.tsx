"use client";

/**
 * CsvConverterTile — CSV/TSV/JSON/Markdown表の相互変換ツールの単一正典タイル
 *
 * cycle-228 T-16: CsvConverterPage.tsx をタイル化したもの。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>（A-1）。
 * - **1ツール1実装**: この CsvConverterTile.tsx のみが UI を描く（A-3）。
 * - **"use client" で自己完結**: ToolPageLayout に機能依存しない（A-2）。
 * - **共有エンジン logic.ts**: convert() が唯一のロジック源。再実装・改変禁止。
 * - **id インスタンス一意化**: useId ベースで複数インスタンス同居でも重複しない（A-6）。
 *
 * ## variant
 *
 * - `"full"` (デフォルト): 入力形式・出力形式 Select + 変換ボタン + 2ペイン。
 *   道具箱でも詳細ページでも同一インスタンスとして動作する。
 *
 * ## アクセシビリティ
 *
 * - C-3: role="status" aria-live="polite" + 実テキストサマリで SR に通知。
 * - C-4: コピーボタンの aria-label。
 * - A-6: 全 DOM id は useId ベースのインスタンス一意 id。
 */

import { useId, useState, useCallback } from "react";
import Panel from "@/components/Panel";
import Button from "@/components/Button";
import Select from "@/components/Select";
import Textarea from "@/components/Textarea";
import ErrorMessage from "@/components/ErrorMessage";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import { convert, type DataFormat } from "./logic";
import styles from "./CsvConverterTile.module.css";

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type CsvConverterTileVariant = "full";

export interface CsvConverterTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": 入力形式・出力形式 Select + 変換ボタン + 2ペイン
   */
  variant?: CsvConverterTileVariant;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

/**
 * logic.ts が返す英語エラーメッセージを日本語に変換する。
 *
 * parseJson や parseMarkdown は英語エラーを投げることがある（例: JSON.parse の
 * "Unexpected token..." 等）。日本語サイトとして、生の英語エラーを来訪者に
 * 露出しないよう、変換後に日本語メッセージに整形する（G-2 準拠）。
 */
function toJapaneseConvertError(rawError: string): string {
  // "JSONは配列である必要があります" のようにすでに日本語のメッセージはそのまま使う
  if (/[぀-ヿ㐀-䶿一-鿿]/.test(rawError)) {
    return rawError;
  }

  // JSON.parse の英語エラー: "line N column M" パターンを抽出
  const lineColMatch = rawError.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (lineColMatch) {
    const line = lineColMatch[1];
    const col = lineColMatch[2];
    return `入力データの形式が正しくありません。（${line}行目、${col}文字目付近）`;
  }

  // "position N" だけのパターン
  const posMatch = rawError.match(/position\s+(\d+)/i);
  if (posMatch) {
    const pos = posMatch[1];
    return `入力データの形式が正しくありません。（位置 ${pos} 付近）`;
  }

  // フォールバック
  return "入力データの形式が正しくありません。";
}

const FORMAT_LABELS: Record<DataFormat, string> = {
  csv: "CSV",
  tsv: "TSV",
  json: "JSON",
  markdown: "Markdown表",
};

const FORMATS = Object.keys(FORMAT_LABELS) as DataFormat[];

const SAMPLE_CSV = `名前,年齢,都市
田中太郎,30,東京
佐藤花子,25,大阪
"鈴木, 一郎",40,名古屋`;

export default function CsvConverterTile({
  variant = "full",
  as = "section",
  className,
}: CsvConverterTileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合防止） ----------
  const uid = useId();
  const fromFormatId = `${uid}-from-format`;
  const toFormatId = `${uid}-to-format`;
  const inputId = `${uid}-input`;
  const outputId = `${uid}-output`;

  // ---------- State ----------
  const [input, setInput] = useState(SAMPLE_CSV);
  const [fromFormat, setFromFormat] = useState<DataFormat>("csv");
  const [toFormat, setToFormat] = useState<DataFormat>("json");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  // C-3: スクリーンリーダーへ通知するための短いサマリテキスト
  const [statusSummary, setStatusSummary] = useState("");

  // T-4b: コピーあり確定。useCopyToClipboard フックを使用（独自実装しない）
  const { copy, copiedKey } = useCopyToClipboard();

  // ---------- ハンドラ ----------
  const handleConvert = useCallback(() => {
    setError("");
    setStatusSummary("");
    if (!input.trim()) {
      setOutput("");
      return;
    }
    const result = convert(input, fromFormat, toFormat);
    if (result.success) {
      setOutput(result.output);
      // C-3: 変換成功サマリを role="status" 領域に実テキストとして配置
      setStatusSummary("変換しました");
    } else {
      // G-2: logic.ts が返すエラーを日本語に変換して表示
      const rawMsg = result.error ?? "";
      setError(toJapaneseConvertError(rawMsg));
      setOutput("");
    }
  }, [input, fromFormat, toFormat]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await copy(output);
  }, [output, copy]);

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）
  // variant は現在 "full" のみだが、将来の拡張に備えて prop は保持する
  void variant; // unused variable suppression（将来の variant 分岐を意図した受け口）

  return (
    <Panel as={as} className={className}>
      {/* フォーマット選択行 */}
      <div className={styles.formatRow}>
        <div className={styles.field}>
          <label htmlFor={fromFormatId} className={styles.fieldLabel}>
            入力形式
          </label>
          <Select
            id={fromFormatId}
            aria-label="入力形式"
            value={fromFormat}
            onChange={(e) => setFromFormat(e.target.value as DataFormat)}
          >
            {FORMATS.map((fmt) => (
              <option key={fmt} value={fmt}>
                {FORMAT_LABELS[fmt]}
              </option>
            ))}
          </Select>
        </div>
        <div className={styles.field}>
          <label htmlFor={toFormatId} className={styles.fieldLabel}>
            出力形式
          </label>
          <Select
            id={toFormatId}
            aria-label="出力形式"
            value={toFormat}
            onChange={(e) => setToFormat(e.target.value as DataFormat)}
          >
            {FORMATS.map((fmt) => (
              <option key={fmt} value={fmt}>
                {FORMAT_LABELS[fmt]}
              </option>
            ))}
          </Select>
        </div>
        <div className={styles.convertButtonWrapper}>
          <Button onClick={handleConvert} type="button" variant="primary">
            変換
          </Button>
        </div>
      </div>

      {/* 入出力パネル */}
      <div className={styles.panels}>
        {/* 入力欄 */}
        <div className={styles.panel}>
          <label htmlFor={inputId} className={styles.panelLabel}>
            入力データ
          </label>
          <Textarea
            id={inputId}
            aria-label="入力データ"
            variant="mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="変換するデータを入力..."
            spellCheck={false}
            rows={12}
          />
        </div>

        {/* 出力欄 */}
        <div className={styles.panel}>
          <div className={styles.outputHeader}>
            <label htmlFor={outputId} className={styles.panelLabel}>
              変換結果
            </label>
            {/* T-4b: コピーボタンあり確定。出力が空のとき disabled */}
            <Button
              onClick={handleCopy}
              type="button"
              size="small"
              disabled={!output}
              aria-label={copiedKey ? COPIED_LABEL : "コピー"}
            >
              {copiedKey ? COPIED_LABEL : "コピー"}
            </Button>
          </div>
          {/* C-3: role="status" aria-live="polite" で動的通知。
              実テキストノード（サマリ）を置くことでスクリーンリーダーに変化を通知する。
              readOnly textarea をラップするだけでは値変化が読み上げられないため分離する。 */}
          <div
            role="status"
            aria-live="polite"
            aria-label="操作結果サマリ"
            className={styles.srOnly}
          >
            {statusSummary}
          </div>
          <Textarea
            id={outputId}
            aria-label="変換結果"
            variant="mono"
            value={output}
            readOnly
            placeholder="結果がここに表示されます"
            rows={12}
          />
        </div>
      </div>

      {/* エラー表示: G-2 ErrorMessage を使用。空のときは非表示 */}
      {error && <ErrorMessage message={error} />}
    </Panel>
  );
}

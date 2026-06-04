"use client";

import { useState, useCallback } from "react";
import { convert, type DataFormat } from "./logic";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import Textarea from "@/components/Textarea";
import Select from "@/components/Select";
import ErrorMessage from "@/components/ErrorMessage";
import Button from "@/components/Button";
import styles from "./CsvConverterPage.module.css";

/**
 * logic.ts が返す英語エラーメッセージを日本語に変換する。
 *
 * parseJson や parseMarkdown は英語エラーを投げることがある（例: JSON.parse の
 * "Unexpected token..." 等）。日本語サイトとして、生の英語エラーを来訪者に
 * 露出しないよう、変換後に日本語メッセージに整形する。
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

/**
 * CsvConverterPage — CSV/TSV/JSON/Markdown表の相互変換ツールの単一実装。
 *
 * 機能:
 * - 入力形式・出力形式を Select で選択
 * - 変換ボタンで変換実行
 * - 出力コピー（useCopyToClipboard）
 * - エラー表示（ErrorMessage）
 *
 * 設計方針:
 * - 確定提示方式: 入力欄・出力欄を最初から表示
 * - AP-I11: タイマーは useCopyToClipboard フック内で useRef+useEffect cleanup 済み
 * - ARIA C-3: 出力結果は role="status" aria-live="polite" + 実テキストサマリで SR に通知
 * - T-4b: csv-converter はコピーボタンあり確定
 * - A-4: エラーは toJapaneseConvertError で日本語化して ErrorMessage に渡す
 */
export default function CsvConverterPage() {
  const [input, setInput] = useState(SAMPLE_CSV);
  const [fromFormat, setFromFormat] = useState<DataFormat>("csv");
  const [toFormat, setToFormat] = useState<DataFormat>("json");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  // C-3: スクリーンリーダーへ通知するための短いサマリテキスト
  const [statusSummary, setStatusSummary] = useState("");

  // T-4b: コピーあり確定。useCopyToClipboard フックを使用（独自実装しない）
  const { copy, copiedKey } = useCopyToClipboard();

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
      // A-4: logic.ts が返すエラーを日本語に変換して表示
      const rawMsg = result.error ?? "";
      setError(toJapaneseConvertError(rawMsg));
      setOutput("");
    }
  }, [input, fromFormat, toFormat]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await copy(output);
  }, [output, copy]);

  return (
    <div className={styles.container}>
      {/* フォーマット選択行 */}
      <div className={styles.formatRow}>
        <div className={styles.field}>
          <label htmlFor="csv-from-format" className={styles.fieldLabel}>
            入力形式
          </label>
          <Select
            id="csv-from-format"
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
          <label htmlFor="csv-to-format" className={styles.fieldLabel}>
            出力形式
          </label>
          <Select
            id="csv-to-format"
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
          <label htmlFor="csv-input" className={styles.panelLabel}>
            入力データ
          </label>
          <Textarea
            id="csv-input"
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
            <label htmlFor="csv-output" className={styles.panelLabel}>
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
            id="csv-output"
            aria-label="変換結果"
            variant="mono"
            value={output}
            readOnly
            placeholder="結果がここに表示されます"
            rows={12}
          />
        </div>
      </div>

      {/* エラー表示: A-4 ErrorMessage を使用。空のときは非表示 */}
      {error && <ErrorMessage message={error} />}
    </div>
  );
}

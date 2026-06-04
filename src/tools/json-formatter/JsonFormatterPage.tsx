"use client";

import { useState, useCallback } from "react";
import { formatJson, minifyJson, validateJson, type IndentType } from "./logic";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import Textarea from "@/components/Textarea";
import Select from "@/components/Select";
import ErrorMessage from "@/components/ErrorMessage";
import Button from "@/components/Button";
import styles from "./JsonFormatterPage.module.css";

/**
 * JSON パーサーが返す英語エラーメッセージを日本語に変換する。
 *
 * JSON.parse は常に英語のエラーメッセージを返す（例:
 * "Expected property name or '}' in JSON at position 1 (line 1 column 2)"）。
 * 日本語サイトとして、生の英語パーサーエラーを来訪者に露出しないよう、
 * エラー位置情報（line/column）を活かした日本語メッセージに整形する。
 *
 * @param rawError - JSON.parse が投げたエラーの message（英語）
 * @returns 日本語の人間可読エラーメッセージ
 */
function toJapaneseJsonError(rawError: string): string {
  // "line N column M" パターンを抽出（Chrome/Firefox/Node 共通形式）
  const lineColMatch = rawError.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (lineColMatch) {
    const line = lineColMatch[1];
    const col = lineColMatch[2];
    return `JSONの形式が正しくありません。（${line}行目、${col}文字目付近）`;
  }

  // "position N" だけのパターン（一部の環境）
  const posMatch = rawError.match(/position\s+(\d+)/i);
  if (posMatch) {
    const pos = posMatch[1];
    return `JSONの形式が正しくありません。（位置 ${pos} 付近）`;
  }

  // 位置情報が取れない場合のフォールバック
  return "JSONの形式が正しくありません。";
}

/**
 * JsonFormatterPage — JSON整形・圧縮・検証の単一実装。
 *
 * 機能:
 * - JSON 整形（インデント: 2スペース / 4スペース / タブ）
 * - JSON 圧縮（minify）
 * - JSON 検証（validate）
 * - 出力コピー（useCopyToClipboard）
 * - エラー表示（ErrorMessage）
 *
 * 設計方針:
 * - 確定提示方式: 入力欄を最初から表示
 * - AP-I11: setTimeout は useCopyToClipboard フック内で useRef+useEffect cleanup 済み
 * - ARIA: 出力欄に role="status" aria-live="polite"
 * - T-4b: json-formatter はコピーボタンあり確定
 * - エラー日本語化: 英語の生パーサーエラーを来訪者に露出しない（toJapaneseJsonError で変換）
 */
export default function JsonFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState<IndentType>("2");
  // C-3: スクリーンリーダーへ通知するための短いサマリテキスト
  // role="status" aria-live="polite" 領域に実テキストとして配置する
  const [statusSummary, setStatusSummary] = useState("");

  // T-4b: コピーあり確定。useCopyToClipboard フックを使用（独自実装しない）
  const { copy, copiedKey } = useCopyToClipboard();

  const handleFormat = useCallback(() => {
    setError("");
    setStatusSummary("");
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      const formatted = formatJson(input, indent);
      setOutput(formatted);
      // C-3: 整形成功サマリを role="status" 領域に実テキストとして配置
      setStatusSummary("整形しました");
    } catch (e) {
      // JSON.parse の英語エラーを日本語に変換して表示（生エラーを露出しない）
      const rawMsg = e instanceof Error ? e.message : String(e);
      setError(toJapaneseJsonError(rawMsg));
      setOutput("");
    }
  }, [input, indent]);

  const handleMinify = useCallback(() => {
    setError("");
    setStatusSummary("");
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      const minified = minifyJson(input);
      setOutput(minified);
      // C-3: 圧縮成功サマリを role="status" 領域に実テキストとして配置
      setStatusSummary("圧縮しました");
    } catch (e) {
      // JSON.parse の英語エラーを日本語に変換して表示（生エラーを露出しない）
      const rawMsg = e instanceof Error ? e.message : String(e);
      setError(toJapaneseJsonError(rawMsg));
      setOutput("");
    }
  }, [input]);

  const handleValidate = useCallback(() => {
    setError("");
    setStatusSummary("");
    if (!input.trim()) {
      setOutput("");
      return;
    }
    const result = validateJson(input);
    if (result.valid) {
      // 検証成功は日本語メッセージで表示（"Valid JSON" 等の英語は使わない）
      setOutput("正しいJSONです");
      // C-3: 検証成功サマリを role="status" 領域に実テキストとして配置
      setStatusSummary("正しいJSONです");
    } else {
      // validateJson の result.error は英語の生パーサーエラーなので日本語に変換
      const rawMsg = result.error ?? "";
      setError(toJapaneseJsonError(rawMsg));
      setOutput("");
    }
  }, [input]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await copy(output);
  }, [output, copy]);

  return (
    <div className={styles.container}>
      {/* コントロール行: インデント選択 + 操作ボタン */}
      <div className={styles.controls}>
        <div className={styles.indentControl}>
          <label htmlFor="indent-select" className={styles.controlLabel}>
            インデント
          </label>
          <Select
            id="indent-select"
            aria-label="インデント"
            value={indent}
            onChange={(e) => setIndent(e.target.value as IndentType)}
          >
            <option value="2">2スペース</option>
            <option value="4">4スペース</option>
            <option value="tab">タブ</option>
          </Select>
        </div>
        <div className={styles.buttons}>
          <Button onClick={handleFormat} type="button" variant="primary">
            整形
          </Button>
          <Button onClick={handleMinify} type="button">
            圧縮
          </Button>
          <Button onClick={handleValidate} type="button">
            検証
          </Button>
        </div>
      </div>

      {/* 入出力パネル */}
      <div className={styles.panels}>
        {/* 入力欄 */}
        <div className={styles.panel}>
          <label htmlFor="json-input" className={styles.panelLabel}>
            入力
          </label>
          <Textarea
            id="json-input"
            aria-label="入力"
            variant="mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"key": "value"}'
            spellCheck={false}
            rows={12}
          />
        </div>

        {/* 出力欄 */}
        <div className={styles.panel}>
          <div className={styles.outputHeader}>
            <label htmlFor="json-output" className={styles.panelLabel}>
              出力
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
            id="json-output"
            aria-label="出力"
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

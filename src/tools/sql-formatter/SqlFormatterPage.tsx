"use client";

import { useState, useCallback } from "react";
import { formatSql, minifySql } from "./logic";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import Textarea from "@/components/Textarea";
import Select from "@/components/Select";
import ErrorMessage from "@/components/ErrorMessage";
import Button from "@/components/Button";
import styles from "./SqlFormatterPage.module.css";

type IndentType = "2" | "4" | "tab";

function getIndentString(indentType: IndentType): string {
  switch (indentType) {
    case "2":
      return "  ";
    case "4":
      return "    ";
    case "tab":
      return "\t";
  }
}

/**
 * SQL 整形エンジンが投げるエラーを日本語メッセージに変換する。
 *
 * logic.ts の formatSql / minifySql が返すエラーには英語の技術的な文字列が
 * 混じることがある。来訪者に英語の生エラーを露出しないよう日本語に変換する（A-4）。
 */
function toJapaneseSqlError(rawError: string): string {
  // 位置情報付きエラーの場合は行・列を活かして案内する
  const lineColMatch = rawError.match(/line\s+(\d+)\s+col(?:umn)?\s+(\d+)/i);
  if (lineColMatch) {
    const line = lineColMatch[1];
    const col = lineColMatch[2];
    return `SQLの形式が正しくありません。（${line}行目、${col}文字目付近）`;
  }

  const posMatch = rawError.match(/position\s+(\d+)/i);
  if (posMatch) {
    const pos = posMatch[1];
    return `SQLの形式が正しくありません。（位置 ${pos} 付近）`;
  }

  // 位置情報が取れない場合の日本語フォールバック
  return "SQLの形式が正しくありません。入力内容を確認してください。";
}

/**
 * SqlFormatterPage — SQL整形・圧縮の単一実装。
 *
 * 機能:
 * - SQL 整形（インデント: 2スペース / 4スペース / タブ）
 * - キーワード大文字化オプション
 * - SQL 圧縮（minify）
 * - 出力コピー（useCopyToClipboard）
 * - エラー表示（ErrorMessage、日本語化）
 *
 * 設計方針:
 * - 確定提示方式: 入力欄を最初から表示
 * - AP-I11: setTimeout は useCopyToClipboard フック内で useRef+useEffect cleanup 済み
 * - C-3: ARIA role="status" aria-live="polite" に実テキストサマリを配置
 * - T-4b: sql-formatter はコピーボタンあり確定（持ち帰り対象）
 * - A-4: 英語の生パーサーエラーを来訪者に露出しない（toJapaneseSqlError で変換）
 */
export default function SqlFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState<IndentType>("2");
  const [uppercase, setUppercase] = useState(true);
  // C-3: スクリーンリーダーへ通知するための短いサマリテキスト
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
      const formatted = formatSql(input, {
        indent: getIndentString(indent),
        uppercase,
      });
      setOutput(formatted);
      // C-3: 整形成功サマリを role="status" 領域に実テキストとして配置
      setStatusSummary("整形しました");
    } catch (e) {
      // 英語エラーを日本語に変換して表示（A-4）
      const rawMsg = e instanceof Error ? e.message : String(e);
      setError(toJapaneseSqlError(rawMsg));
      setOutput("");
    }
  }, [input, indent, uppercase]);

  const handleMinify = useCallback(() => {
    setError("");
    setStatusSummary("");
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      const minified = minifySql(input);
      setOutput(minified);
      // C-3: 圧縮成功サマリを role="status" 領域に実テキストとして配置
      setStatusSummary("圧縮しました");
    } catch (e) {
      // 英語エラーを日本語に変換して表示（A-4）
      const rawMsg = e instanceof Error ? e.message : String(e);
      setError(toJapaneseSqlError(rawMsg));
      setOutput("");
    }
  }, [input]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await copy(output);
  }, [output, copy]);

  return (
    <div className={styles.container}>
      {/* コントロール行: インデント選択・大文字オプション・操作ボタン */}
      <div className={styles.controls}>
        <div className={styles.options}>
          <div className={styles.indentControl}>
            <label htmlFor="sql-indent-select" className={styles.controlLabel}>
              インデント
            </label>
            <Select
              id="sql-indent-select"
              aria-label="インデント"
              value={indent}
              onChange={(e) => setIndent(e.target.value as IndentType)}
            >
              <option value="2">2スペース</option>
              <option value="4">4スペース</option>
              <option value="tab">タブ</option>
            </Select>
          </div>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className={styles.checkbox}
              aria-label="キーワードを大文字にする"
            />
            キーワード大文字
          </label>
        </div>
        <div className={styles.buttons}>
          <Button onClick={handleFormat} type="button" variant="primary">
            整形
          </Button>
          <Button onClick={handleMinify} type="button">
            圧縮
          </Button>
        </div>
      </div>

      {/* 入出力パネル */}
      <div className={styles.panels}>
        {/* 入力欄 */}
        <div className={styles.panel}>
          <label htmlFor="sql-input" className={styles.panelLabel}>
            入力
          </label>
          <Textarea
            id="sql-input"
            aria-label="SQL入力"
            variant="mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="SELECT id, name, email FROM users WHERE status = 'active' AND created_at > '2024-01-01' ORDER BY name ASC;"
            spellCheck={false}
            rows={12}
          />
        </div>

        {/* 出力欄 */}
        <div className={styles.panel}>
          <div className={styles.outputHeader}>
            <label htmlFor="sql-output" className={styles.panelLabel}>
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
            id="sql-output"
            aria-label="SQL出力"
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

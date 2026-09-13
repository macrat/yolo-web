"use client";

/**
 * JsonFormatterTile — JSON 整形・圧縮・検証の単一正典タイル
 *
 * cycle-228 T-12 で JsonFormatterPage.tsx を Panel ルートのタイルへ作り直したもの。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>。外部ラッパーなし。
 * - **1ツール n タイル = variant**: full / format-only は同一コンポーネントの
 *   設定差で表現。別実装を作らない（分裂ゼロ）。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する。
 * - **logic.ts 共有エンジン**: formatJson / minifyJson / validateJson が唯一のロジック源。
 *
 * ## variant
 *
 * - `"full"` (デフォルト): 整形・圧縮・検証の3操作 + インデント Select + コピー
 * - `"format-only"`: 整形操作に絞る（T-31 道具箱恒久展示用）。
 *   インデント Select は維持。「JSON を整形する道具」として一目で分かる丁寧な作り。
 *
 * ## 使い方
 *
 * ```tsx
 * // 道具箱や詳細ページから同一エクスポートを描画する（同一性の構造的保証）
 * <JsonFormatterTile variant="full" />
 * <JsonFormatterTile variant="format-only" />
 * ```
 *
 * ## アクセシビリティ（C-3 準拠）
 *
 * - 出力 textarea は readOnly で表示専用
 * - role="status" aria-live="polite" の div にサマリテキストを置く
 *   （readOnly textarea は値変化をスクリーンリーダーが読み上げないため）
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
import { formatJson, minifyJson, validateJson, type IndentType } from "./logic";
import styles from "./JsonFormatterTile.module.css";

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type JsonFormatterTileVariant = "full" | "format-only";

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

export interface JsonFormatterTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": 整形・圧縮・検証の3操作 + インデント Select + コピー
   * - "format-only": 整形操作のみ（道具箱恒久展示用）。インデント Select は維持。
   */
  variant?: JsonFormatterTileVariant;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

export default function JsonFormatterTile({
  variant = "full",
  as = "section",
  className,
}: JsonFormatterTileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合防止） ----------
  const uid = useId();
  const inputId = `${uid}-input`;
  const outputId = `${uid}-output`;
  const indentId = `${uid}-indent`;

  // ---------- State ----------
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState<IndentType>("2");
  // C-3: スクリーンリーダーへ通知するための短いサマリテキスト
  // role="status" aria-live="polite" 領域に実テキストとして配置する
  const [statusSummary, setStatusSummary] = useState("");

  // T-4b: コピーあり確定。useCopyToClipboard フックを使用（独自実装しない）
  const { copy, copiedKey } = useCopyToClipboard();

  // ---------- ハンドラ ----------

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

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）
  return (
    <Panel as={as} className={className}>
      {/* コントロール行: インデント選択 + 操作ボタン */}
      <div className={styles.controls}>
        {/* インデント選択（full・format-only 両方に表示） */}
        <div className={styles.indentControl}>
          <label htmlFor={indentId} className={styles.controlLabel}>
            インデント
          </label>
          <Select
            id={indentId}
            aria-label="インデント"
            value={indent}
            onChange={(e) => setIndent(e.target.value as IndentType)}
          >
            <option value="2">2スペース</option>
            <option value="4">4スペース</option>
            <option value="tab">タブ</option>
          </Select>
        </div>

        {/* 操作ボタン群 */}
        <div className={styles.buttons}>
          <Button onClick={handleFormat} type="button" variant="primary">
            整形
          </Button>
          {/* variant="full" のみ圧縮・検証ボタンを表示 */}
          {variant === "full" && (
            <>
              <Button onClick={handleMinify} type="button">
                圧縮
              </Button>
              <Button onClick={handleValidate} type="button">
                検証
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 入出力パネル（2カラムグリッド） */}
      <div className={styles.panels}>
        {/* 入力欄 */}
        <div className={styles.panel}>
          <label htmlFor={inputId} className={styles.panelLabel}>
            入力
          </label>
          <Textarea
            id={inputId}
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
            <label htmlFor={outputId} className={styles.panelLabel}>
              出力
            </label>
            {/* コピーボタン: 出力が空のとき disabled */}
            <Button
              onClick={() => void handleCopy()}
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
            aria-atomic="true"
            className={styles.statusSummary}
          >
            {statusSummary}
          </div>
          <Textarea
            id={outputId}
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
    </Panel>
  );
}

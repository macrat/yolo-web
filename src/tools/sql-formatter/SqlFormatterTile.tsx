"use client";

/**
 * SqlFormatterTile — SQL整形・圧縮の単一正典タイル
 *
 * cycle-228 T-13: SqlFormatterPage.tsx を Panel ルートのタイルへ作り直したもの。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>（A-1）
 * - **1ツール 1実装**: variant prop の設定差のみでバリエーションを表現（A-5）
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない（A-6）
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する（A-2）
 * - **logic.ts 共有エンジン**: formatSql / minifySql が唯一のロジック源（再実装禁止）
 *
 * ## variant
 *
 * - `"full"` (デフォルト): format/minify + インデント Select + 大文字化 ToggleSwitch + コピー
 *   （詳細ページ・道具箱両方で使用）
 *
 * ## 使い方
 *
 * ```tsx
 * // 詳細ページと道具箱が同一エクスポートを描画する
 * <SqlFormatterTile variant="full" />
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
import ToggleSwitch from "@/components/ToggleSwitch";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import { formatSql, minifySql } from "./logic";
import styles from "./SqlFormatterTile.module.css";

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
 * SQL エンジンが投げるエラーを日本語メッセージに変換する。
 *
 * logic.ts の formatSql / minifySql が返すエラーには英語の技術的な文字列が
 * 混じることがある。来訪者に英語の生エラーを露出しないよう日本語に変換する（A-4）。
 */
function toJapaneseSqlError(rawError: string): string {
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

  return "SQLの形式が正しくありません。入力内容を確認してください。";
}

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type SqlFormatterTileVariant = "full";

export interface SqlFormatterTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": format/minify + インデント Select + 大文字化 ToggleSwitch + コピー
   */
  variant?: SqlFormatterTileVariant;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

export default function SqlFormatterTile({
  variant = "full",
  as = "section",
  className,
}: SqlFormatterTileProps = {}) {
  // ---------- id インスタンス一意化（A-6: 複数同居時の重複 id・label 誤結合防止） ----------
  const uid = useId();
  const inputId = `${uid}-sql-input`;
  const outputId = `${uid}-sql-output`;
  const indentId = `${uid}-indent-select`;

  // ---------- State ----------
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState<IndentType>("2");
  const [uppercase, setUppercase] = useState(true);
  // C-3: スクリーンリーダーへ通知するための短いサマリテキスト
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

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）(A-1)
  // variant の型は現在 "full" のみ。将来固定 variant を追加する場合はここに値を増やす。
  // data-variant に渡すことで参照し、未使用変数警告を回避する。
  return (
    <Panel as={as} className={className} data-variant={variant}>
      {/* コントロール行: インデント選択・大文字オプション・操作ボタン */}
      <div className={styles.controls}>
        <div className={styles.options}>
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
          {/* DESIGN.md §5: 単一 ON/OFF はトグルスイッチで統一 (B-9) */}
          <ToggleSwitch
            label="キーワード大文字"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
          />
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
          <label htmlFor={inputId} className={styles.panelLabel}>
            入力
          </label>
          <Textarea
            id={inputId}
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
            <label htmlFor={outputId} className={styles.panelLabel}>
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
            className={styles.statusSummary}
          >
            {statusSummary}
          </div>
          <Textarea
            id={outputId}
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
    </Panel>
  );
}

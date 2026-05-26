"use client";

import { useState } from "react";
import Link from "next/link";
import { replaceText } from "./logic";

/**
 * 文字列置換ツール タイル用簡素 UI（kind=widget）。
 *
 * 詳細ページ Component.tsx（3 入力 + 3 チェックボックス + 警告/エラー表示 + 結果 textarea
 * + コピーボタン）とは別に、タイルサイズ（cols=3 rows=3 = 400×400px）に
 * 最適化した簡素版 UI。ロジックは詳細ページと同じ logic.ts の replaceText() を再利用。
 *
 * 複合入力型タイル初回（Phase 8.1 第 11 弾）:
 * - 既存 10 タイルに「3 入力 + 出力」構造は不在。本タイルが SSoT 確立。
 * - 3 入力フィールド: 本文 textarea + 検索 input + 置換 input
 *
 * 論点 2 採択 = 案 A 全省略:
 * - オプション（useRegex / caseSensitive / globalReplace）は UI から完全に除く
 * - useRegex: false / caseSensitive: true / globalReplace: true を literal で固定
 * - useRegex を true にする UI 経路が一切存在しない
 *
 * 論点 2.1 採択 = 補助ラベル採択:
 * - 検索 input の placeholder に「大文字/小文字を区別」旨を含める
 * - visitor が誤置換に気づかずコピーするシナリオを事前防止
 *
 * 論点 3 採択 = 案 X（縦並び）:
 * - 本文 textarea → 検索 input → 置換 input → 結果欄 の順（競合多数派 9/11 サイト同型）
 *
 * 論点 4 採択 = 案 α（AP-P21 役割分担二分類）:
 * - 操作側（短い高さ固定）= 検索 input + 置換 input（flexShrink: 0）
 * - 膨張側（残余高さ枠内収納）= 本文 textarea + 結果欄（flex: 1 + overflowY: auto）
 *
 * 論点 5 採択 = 案 a（既存文言をそのまま表示）:
 * - logic.ts の result.error「入力テキストが長すぎます（最大100,000文字）」をそのまま表示
 *
 * CSS はデザイントークン（--fg / --bg / --accent / --fg-soft / --border / --danger / --danger-soft）を
 * 使用した inline style で実装。CSS Module 不使用（codegen 制約）。
 *
 * 【AP-P21 対応】
 * - 操作側（検索 input / 置換 input）= flexShrink: 0 で「操作欄を潰さない」設計
 * - 膨張側（本文 textarea / 結果欄）= flex: 1 + overflowY: auto で残余高さを分け合う
 *
 * debounce なし（即時反映 / 軽量同期処理 + cycle-208/209 実証済）。
 *
 * Phase 8.1 cycle-210 T-3
 */

/**
 * タイル固定オプション（論点 2 = 案 A 全省略採択）。
 * useRegex は literal false で固定し、true にする UI 経路が一切存在しない。
 */
const TILE_OPTIONS = {
  useRegex: false, // literal false 固定 = 正規表現 UI 経路なし
  caseSensitive: true, // 大文字/小文字を区別（詳細ページデフォルトと一致）
  globalReplace: true, // 全件置換（詳細ページデフォルトと一致）
} as const;

export default function TextReplaceTile() {
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");
  const [replacement, setReplacement] = useState("");
  const [copied, setCopied] = useState(false);

  // 置換結果（pure 同期 = debounce 不要 / logic.ts replaceText() を再利用）
  const result = replaceText(body, search, replacement, TILE_OPTIONS);

  const handleCopy = async () => {
    if (!result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available — silent fail（Component.tsx L29-31 同型）
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        padding: "12px",
        backgroundColor: "var(--bg)",
        color: "var(--fg)",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
        fontFamily: "inherit",
      }}
    >
      {/* ヘッダー: タイトル */}
      <p
        style={{
          margin: 0,
          fontSize: "0.75rem",
          fontWeight: 600,
          opacity: 0.7,
          flexShrink: 0,
        }}
      >
        文字列置換
      </p>

      {/* 本文入力欄（膨張側 = flex: 1 で残余高さを占有）
           AP-P21 役割分担: 膨張側 = 複数行テキスト貼付の主ユースケースに応答 */}
      <textarea
        aria-label="本文"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="置換対象のテキストを貼り付け"
        style={{
          flex: 1,
          width: "100%",
          resize: "none",
          border: "1px solid var(--fg-soft)",
          borderRadius: "4px",
          padding: "6px 8px",
          fontSize: "0.8125rem",
          backgroundColor: "var(--bg)",
          color: "var(--fg)",
          boxSizing: "border-box",
          fontFamily: "inherit",
          minHeight: 0,
          overflowY: "auto",
        }}
      />

      {/* 検索 input（操作側 = flexShrink: 0 で高さ固定）
           論点 2.1 補助ラベル採択: placeholder に「大文字/小文字を区別」旨を含める
           AP-P21 基準 (i) 下限 40px 以上: minHeight: 40 で明示確保 */}
      <input
        type="text"
        aria-label="検索"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="検索（大文字/小文字を区別）"
        style={{
          flexShrink: 0,
          width: "100%",
          minHeight: 40,
          border: "1px solid var(--fg-soft)",
          borderRadius: "4px",
          padding: "11px 8px",
          fontSize: "0.8125rem",
          backgroundColor: "var(--bg)",
          color: "var(--fg)",
          boxSizing: "border-box",
          fontFamily: "inherit",
        }}
      />

      {/* 置換 input（操作側 = flexShrink: 0 で高さ固定）
           AP-P21 基準 (i) 下限 40px 以上: minHeight: 40 で明示確保 */}
      <input
        type="text"
        aria-label="置換"
        value={replacement}
        onChange={(e) => setReplacement(e.target.value)}
        placeholder="置換後の文字列"
        style={{
          flexShrink: 0,
          width: "100%",
          minHeight: 40,
          border: "1px solid var(--fg-soft)",
          borderRadius: "4px",
          padding: "11px 8px",
          fontSize: "0.8125rem",
          backgroundColor: "var(--bg)",
          color: "var(--fg)",
          boxSizing: "border-box",
          fontFamily: "inherit",
        }}
      />

      {/* エラー表示（100,000 字超過時 / logic.ts の result.error をそのまま表示）
           論点 5 採択 = 案 a: 詳細ページと同一文言で T2 likes「操作性一貫」
           AP-P21 基準 (i) 下限 40px 以上: padding 上下 11px で高さ確保 */}
      {result.error && (
        <div
          role="alert"
          style={{
            flexShrink: 0,
            fontSize: "0.8125rem",
            color: "var(--danger)",
            backgroundColor: "var(--danger-soft)",
            border: "1px solid var(--danger)",
            borderRadius: "4px",
            padding: "11px 8px",
          }}
        >
          {result.error}
        </div>
      )}

      {/* 結果欄（膨張側 = flex: 1 で残余高さを占有 / 本文と残余高さを分け合う）
           role="status" aria-live="polite" で支援技術に更新を通知。
           AP-P21: overflowY: auto で枠内スクロール。 */}
      <div
        role="status"
        aria-live="polite"
        style={{
          flex: 1,
          fontSize: "0.8125rem",
          wordBreak: "break-all",
          overflowWrap: "break-word",
          overflowY: "auto",
          color: "var(--fg)",
          opacity: result.output ? 0.85 : 0,
          minHeight: 0,
        }}
      >
        {result.output}
      </div>

      {/* 件数表示（置換が発生した場合のみ表示 / target-user-mapping §2「件数表示は信頼性に寄与」）*/}
      {result.output && result.count > 0 && (
        <p
          style={{
            flexShrink: 0,
            margin: 0,
            fontSize: "0.7rem",
            color: "var(--fg-soft)",
          }}
        >
          {result.count} 件を置換
        </p>
      )}

      {/* フッター: コピーボタン + 詳細ページリンク */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0,
        }}
      >
        {result.output ? (
          <button
            type="button"
            onClick={handleCopy}
            style={{
              padding: "2px 8px",
              fontSize: "0.75rem",
              borderRadius: "4px",
              border: "1px solid var(--border, var(--fg-soft))",
              backgroundColor: copied ? "var(--accent)" : "transparent",
              color: copied ? "var(--bg)" : "var(--fg)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {copied ? "コピー済み" : "コピー"}
          </button>
        ) : (
          <span />
        )}

        {/* 詳細ページへのリンク（追加機能・全オプションは詳細ページの責務） */}
        <Link
          href="/tools/text-replace"
          style={{
            fontSize: "0.75rem",
            color: "var(--accent)",
            textDecoration: "underline",
            textUnderlineOffset: "2px",
            alignSelf: "flex-end",
          }}
        >
          詳細ページで開く
        </Link>
      </div>
    </div>
  );
}

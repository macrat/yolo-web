"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  generatePassword,
  evaluateStrength,
  DEFAULT_OPTIONS,
  type PasswordStrength,
} from "./logic";

/**
 * パスワード生成 タイル用 UI（kind=widget）。
 *
 * 詳細ページ Component.tsx（文字数スライダー + 5 チェックボックス + 強度バー
 * + 生成ボタン + 結果表示 + コピーボタン）とは別に、
 * タイルサイズ（cols=3 rows=2 = 400×264px）に最適化した最短動線 UI。
 * ロジックは詳細ページと同じ logic.ts の generatePassword() / evaluateStrength() を再利用。
 *
 * 採択仕様（cycle-213 T-3 計画書）:
 * - §論点 A 採択: cols=3 rows=2（400×264px）
 * - §論点 B 採択: マウント時自動生成型（useState 遅延初期化で crypto.getRandomValues 同期呼出）
 * - §論点 C 採択: オプション操作 UI なし（全委譲 / 最短動線 = DEFAULT_OPTIONS 固定）
 * - §論点 D 採択: 強度バー（小サイズ）表示（差別化軸 = エントロピー計算可視化）
 * - §論点 E 採択: コピーボタン文言「コピー」→「コピー済み」→ 2 秒後自動復帰（cycle-211/212 SSoT）
 * - §論点 F 採択: <code> には aria-live なし / 強度ラベル側に role="status" 付与（秘密情報配慮）
 * - §論点 I 採択: 詳細リンクテキスト「オプションを設定して生成 →」
 *
 * 秘密情報配慮 ARIA 設計（本サイクル独自の新規 SSoT 候補 / cycle-213 §論点 F）:
 * - パスワード <code> 要素に aria-live を付与しない（盗み聞きリスク回避）
 * - 強度ラベル側にのみ role="status" aria-live="polite" を付与
 *   （「強い」「弱い」等 2 字は秘密情報ではない）
 *
 * AP-I11 setTimeout cleanup（cycle-211 / cycle-212 / cycle-213 = 3 連続 SSoT）:
 * - コピーボタン文言復帰の 2 秒タイマーを useRef で保持
 * - useEffect cleanup（返却関数）で clearTimeout を呼び出す
 *
 * AP-P21 役割分担（cycle-210 L37 SSoT / cycle-213 強度バー配置確認）:
 * - 操作側 flexShrink:0 = タイトル / <code> パスワード表示 / 強度バー / ボタン行 / 詳細リンク
 * - 膨張側 flex:1 + overflowY:auto = なし（全要素が操作側 / 固定高さ設計）
 *
 * CSS Module 不使用（codegen 制約）/ インラインスタイル方式（既存 13 タイル同型）。
 * Phase 8.1 第 14 弾 / cycle-213 T-3
 */

/** 強度ラベル日本語表記（Component.tsx:13-18 実装値と同一） */
const STRENGTH_LABELS: Record<PasswordStrength, string> = {
  weak: "弱い",
  fair: "普通",
  good: "良い",
  strong: "強い",
};

/** 強度バー幅（%）: 4 段階均等分割 */
const STRENGTH_BAR_WIDTH: Record<PasswordStrength, string> = {
  weak: "25%",
  fair: "50%",
  good: "75%",
  strong: "100%",
};

/**
 * 強度バー色: CSS 変数（cycle-213 §T-2 新規 4 種マッピング SSoT）
 * weak=--danger / fair=--warning / good=--success / strong=--accent
 */
const STRENGTH_BAR_COLOR: Record<PasswordStrength, string> = {
  weak: "var(--danger)",
  fair: "var(--warning)",
  good: "var(--success)",
  strong: "var(--accent)",
};

/** コピー完了表示を元に戻すまでの時間 (ms): cycle-211 / cycle-212 SSoT 同型 */
const COPY_FEEDBACK_DURATION_MS = 2000;

export default function PasswordGeneratorTile() {
  // マウント時自動生成済パスワード（空文字 = 生成前 = マウント直後の瞬間のみ）
  // マウント時自動生成（§論点 B 採択 = B1）
  // useState の遅延初期化（initializer 関数）でマウント時に 1 回だけ generatePassword を呼ぶ。
  // crypto.getRandomValues() は同期 API のため Promise 不要・< 1ms 高速。
  // useEffect 内での setState を使わないことで react-hooks/set-state-in-effect を回避。
  // SSR 時: getRandomValues は Edge/Node でも利用可能（Next.js App Router 環境での安全性確認済み）。
  const [password, setPassword] = useState<string>(() =>
    generatePassword(DEFAULT_OPTIONS),
  );
  // コピー完了フラグ（true: 「コピー済み」表示中）
  const [copied, setCopied] = useState(false);

  /** コピー完了表示を元に戻す setTimeout ID
   *  useRef で保持し、useEffect cleanup で clearTimeout（AP-I11 SSoT） */
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // AP-I11 cleanup: unmount 時に走行中の setTimeout をすべてキャンセルする
  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  /** 強度評価（DEFAULT_OPTIONS で entropy ≈ 103.35 → strong / 実装値） */
  const strength = evaluateStrength(DEFAULT_OPTIONS);

  /** 再生成ハンドラ */
  const handleRegenerate = useCallback(() => {
    setPassword(generatePassword(DEFAULT_OPTIONS));
    // 再生成でコピー済みフラグをリセット（新しいパスワードに更新されたため）
    setCopied(false);
    if (copyTimerRef.current !== null) {
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = null;
    }
  }, []);

  /** コピーハンドラ（AP-I11 SSoT + §論点 F 秘密情報 = clipboard API は使用するが aria-live なし）*/
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(password);
      // コピー成功 → 「コピー済み」表示
      setCopied(true);
      // 既存タイマーをキャンセルしてから新規設定（連打対策）
      if (copyTimerRef.current !== null) {
        clearTimeout(copyTimerRef.current);
      }
      // ID を ref に保持して unmount 時の clearTimeout でリーク防止（AP-I11）
      copyTimerRef.current = setTimeout(() => {
        setCopied(false);
        copyTimerRef.current = null;
      }, COPY_FEEDBACK_DURATION_MS);
    } catch {
      // Clipboard API not available（旧ブラウザ / 非 secure context）— silent fail
      // §論点 F: silent fail により AT 読み上げ干渉なし
    }
  }, [password]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
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
      {/* ヘッダー: タイトル（操作側 = flexShrink: 0） */}
      <p
        style={{
          margin: 0,
          fontSize: "0.75rem",
          fontWeight: 600,
          opacity: 0.7,
          flexShrink: 0,
        }}
      >
        パスワード生成
      </p>

      {/* パスワード表示（<code> / aria-live なし = §論点 F 秘密情報配慮）
           操作側 = flexShrink: 0
           AP-P21: 固定高さ要素として操作側に配置 */}
      <code
        style={{
          flexShrink: 0,
          display: "block",
          padding: "8px 10px",
          backgroundColor: "var(--bg-soft)",
          border: "1px solid var(--border, var(--fg-soft))",
          borderRadius: "4px",
          fontSize: "0.875rem",
          fontFamily:
            "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
          letterSpacing: "0.05em",
          wordBreak: "break-all",
          minHeight: "36px",
          color: "var(--fg)",
          userSelect: "all",
        }}
        // aria-live は意図的に付与しない（§論点 F: 秘密情報 = 盗み聞きリスク回避）
      >
        {password}
      </code>

      {/* 強度バー（§論点 D 採択 = 小サイズ / 差別化軸）
           role="status" aria-live="polite" で強度ラベル「強い」等を AT に通知（§論点 F）
           操作側 = flexShrink: 0 で高さ固定（AP-P21 cycle-213 §論点 D 採択） */}
      <div
        role="status"
        aria-live="polite"
        aria-label={`パスワード強度: ${STRENGTH_LABELS[strength]}`}
        style={{
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {/* 強度ラベル行 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.75rem",
            color: "var(--fg-soft)",
          }}
        >
          <span>強度:</span>
          <span
            style={{
              color: STRENGTH_BAR_COLOR[strength],
              fontWeight: 600,
            }}
          >
            {STRENGTH_LABELS[strength]}
          </span>
        </div>
        {/* 強度バー（幅で強度を視覚表現）*/}
        <div
          style={{
            width: "100%",
            height: "4px",
            backgroundColor: "var(--bg-soft)",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: STRENGTH_BAR_WIDTH[strength],
              backgroundColor: STRENGTH_BAR_COLOR[strength],
              borderRadius: "2px",
              transition: "width 0.2s ease",
            }}
          />
        </div>
      </div>

      {/* ボタン行: 「再生成」+ 「コピー」横並び（操作側 = flexShrink: 0）
           AP-P21: 操作側の固定高さ要素として配置
           論点 E 採択: コピーボタン文言変化（コピー → コピー済み → 2 秒後自動復帰） */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          gap: "8px",
        }}
      >
        {/* 再生成ボタン */}
        <button
          type="button"
          onClick={handleRegenerate}
          style={{
            flex: 1,
            padding: "6px 8px",
            fontSize: "0.8125rem",
            borderRadius: "4px",
            border: "1px solid var(--border, var(--fg-soft))",
            backgroundColor: "transparent",
            color: "var(--fg)",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          再生成
        </button>

        {/* コピーボタン（文言変化 = cycle-211 / cycle-212 SSoT 同型）*/}
        <button
          type="button"
          onClick={handleCopy}
          style={{
            flex: 1,
            padding: "6px 8px",
            fontSize: "0.8125rem",
            borderRadius: "4px",
            border: "1px solid var(--border, var(--fg-soft))",
            backgroundColor: copied ? "var(--accent)" : "transparent",
            color: copied ? "var(--fg-invert, var(--bg))" : "var(--fg)",
            cursor: "pointer",
            fontFamily: "inherit",
            fontWeight: copied ? 600 : 400,
            transition: "background-color 0.15s, color 0.15s",
          }}
        >
          {copied ? "コピー済み" : "コピー"}
        </button>
      </div>

      {/* 詳細ページリンク（§論点 I 採択 = I1: 「オプションを設定して生成 →」）
           操作側 = flexShrink: 0（AP-P21） */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Link
          href="/tools/password-generator"
          style={{
            fontSize: "0.75rem",
            color: "var(--accent)",
            textDecoration: "underline",
            textUnderlineOffset: "2px",
            whiteSpace: "nowrap",
          }}
        >
          オプションを設定して生成 →
        </Link>
      </div>
    </div>
  );
}

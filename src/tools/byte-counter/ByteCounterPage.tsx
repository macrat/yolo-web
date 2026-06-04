"use client";

/**
 * ByteCounterPage — バイト数計算ツールの単一実装（フル機能のページ本体）
 *
 * B-490 T-6: Component.tsx を廃止し、共通部品で組んだ単一実装に差し替える。
 *
 * 個別論点（cycle-225 §ツール個別論点）:
 * - フル統計復元: バイト数・文字数・文字数（空白除く）・行数・単語数・バイト構成内訳
 * - B-485 (src/lib/text-counting.ts) から共通関数を継承（logic.ts 経由）
 * - char-count との2ツール維持（①-19）: 同一 SSoT で両ツールが同一結果
 * - 空状態（①-13）: 入力なし時は 0 表示（エラーなし）
 * - コピーボタン: なし（カウント=知る対象・T-4b 確定）
 *
 * C-3 対応（収束チェックリスト準拠・reviewer 指摘解消）:
 * ライブリージョン（role="status" aria-live="polite"）には実テキストノードのサマリ
 * （「Nバイト、N文字、N行」）のみを置き、詳細統計パネルはライブリージョン外に出す。
 *
 * aria-atomic="true" を付けない理由:
 * aria-atomic=true だと入力1文字ごとにスクリーンリーダーがリージョン内の
 * 全テキストをまるごと読み上げてしまう。サマリだけなら aria-atomic なしで充分。
 * 詳細統計（プライマリ統計・4統計グリッド・バイト構成内訳）は
 * role="region" の通常エリアに配置し、SR が都度全件読み上げないようにする。
 */

import { useState, useMemo } from "react";
import Textarea from "@/components/Textarea";
import { analyzeText } from "./logic";
import styles from "./ByteCounterPage.module.css";

export default function ByteCounterPage() {
  const [text, setText] = useState("");

  const result = useMemo(() => analyzeText(text), [text]);

  // C-3: ライブリージョンに置くサマリテキスト（簡潔に・全統計でなく要点のみ）
  const summaryText = text
    ? `${result.byteLength}バイト、${result.charCount}文字、${result.lineCount}行`
    : "";

  return (
    <div className={styles.container}>
      {/* テキスト入力欄（A-1: Textarea 共通部品を使用） */}
      <label htmlFor="byte-counter-input" className={styles.inputLabel}>
        テキストを入力
      </label>
      <Textarea
        id="byte-counter-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="ここにテキストを入力してください..."
        rows={10}
        aria-describedby="byte-counter-live-summary"
      />

      {/*
       * C-3: ライブリージョン（role="status" aria-live="polite"）
       * サマリテキストのみを置く。aria-atomic は付けない（付けると長文全体が毎回読み上げられる）。
       * 詳細統計はこのリージョンの外に配置する。
       * visually-hidden で視覚的には非表示だが SR には読み上げられる。
       */}
      <div
        id="byte-counter-live-summary"
        role="status"
        aria-live="polite"
        className={styles.srOnly}
      >
        {summaryText}
      </div>

      {/*
       * 詳細統計パネル（ライブリージョン外の通常エリア）
       * SR にはフォーカス時に読まれるが、入力変化のたびに自動読み上げはされない。
       */}
      <div
        role="region"
        aria-label="バイト数計算結果"
        className={styles.statsPanel}
      >
        {/* プライマリ統計（バイト数・大きく表示） */}
        <div className={styles.primaryStat}>
          <span className={styles.primaryStatLabel}>バイト数 (UTF-8)</span>
          <span className={styles.primaryStatValue}>{result.byteLength}</span>
        </div>

        {/* 統計グリッド（文字数・行数・単語数） */}
        <div className={styles.statsGrid}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>文字数</span>
            <span className={styles.statValue}>{result.charCount}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>文字数（空白除く）</span>
            <span className={styles.statValue}>{result.charCountNoSpaces}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>行数</span>
            <span className={styles.statValue}>{result.lineCount}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>単語数</span>
            <span className={styles.statValue}>{result.wordCount}</span>
          </div>
        </div>

        {/* バイト構成内訳 */}
        <div className={styles.breakdown}>
          <span className={styles.breakdownTitle}>バイト構成</span>
          <div className={styles.breakdownRow}>
            <span className={styles.breakdownLabel}>1バイト文字 (ASCII)</span>
            <span className={styles.breakdownValue}>
              {result.singleByteChars}文字
            </span>
          </div>
          <div className={styles.breakdownRow}>
            <span className={styles.breakdownLabel}>2バイト文字</span>
            <span className={styles.breakdownValue}>
              {result.twoBytechars}文字
            </span>
          </div>
          <div className={styles.breakdownRow}>
            <span className={styles.breakdownLabel}>
              3バイト文字 (日本語等)
            </span>
            <span className={styles.breakdownValue}>
              {result.threeByteChars}文字
            </span>
          </div>
          <div className={styles.breakdownRow}>
            <span className={styles.breakdownLabel}>
              4バイト文字 (絵文字等)
            </span>
            <span className={styles.breakdownValue}>
              {result.fourByteChars}文字
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

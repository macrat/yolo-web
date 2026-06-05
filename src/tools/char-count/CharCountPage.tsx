"use client";

/**
 * CharCountPage — 文字数カウントツールの単一実装（フル機能のページ本体）
 *
 * B-490 T-6: Component.tsx を廃止し、共通部品で組んだ単一実装に差し替える。
 *
 * 個別論点（cycle-225 §ツール個別論点）:
 * - フル統計復元: 文字数・文字数（空白除く）・バイト数・単語数・行数・段落数
 * - B-485 (src/lib/text-counting.ts) から共通関数を継承（logic.ts 経由）
 * - char-count と byte-counter の2ツール維持（①-19）: 同一 SSoT で両ツールが同一結果
 * - 空状態（①-13）: 入力なし時は 0 表示（エラーなし）
 * - コピーボタン: なし（カウント=知る対象・T-4b 確定）
 *
 * C-3 対応（ライブリージョンに実テキストノードのサマリ）:
 * スクリーンリーダーが動的な変化を読み上げられるよう、
 * role="status" aria-live="polite" のリージョン内に実テキストノードを配置する。
 * readOnly textarea のラップだけでは SR が値の変化を検知できないため、
 * 明示的なサマリテキストを配置する（C-3 の要件）。
 */

import { useState, useMemo } from "react";
import Textarea from "@/components/Textarea";
import { analyzeText } from "./logic";
import styles from "./CharCountPage.module.css";

export default function CharCountPage() {
  const [text, setText] = useState("");

  const result = useMemo(() => analyzeText(text), [text]);

  // C-3: ライブリージョンに読み上げるサマリテキスト
  const summaryText = text
    ? `${result.chars}文字、${result.bytes}バイト、${result.lines}行、${result.words}単語`
    : "テキストを入力してください";

  return (
    <div className={styles.container}>
      {/* テキスト入力欄（A-1: Textarea 共通部品を使用） */}
      <label htmlFor="char-count-input" className={styles.inputLabel}>
        テキストを入力
      </label>
      <Textarea
        id="char-count-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="ここにテキストを入力してください..."
        rows={10}
        aria-describedby="char-count-live-summary"
      />

      {/*
       * C-3: ライブリージョン（role="status" aria-live="polite"）
       * サマリテキストのみを置く。aria-atomic は付けない（付けると全テキストが毎回読み上げられる）。
       * 詳細統計はこのリージョンの外に配置する（byte-counter と同じ設計）。
       * visually-hidden で視覚的には非表示だが SR には読み上げられる。
       */}
      <div
        id="char-count-live-summary"
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
        aria-label="文字数カウント結果"
        className={styles.statsPanel}
      >
        {/* プライマリ統計（文字数・大きく表示・byte-counter の「バイト数」主役表示と一貫） */}
        <div className={styles.primaryStat}>
          <span className={styles.primaryStatLabel}>文字数</span>
          <span className={styles.primaryStatValue}>{result.chars}</span>
        </div>

        {/* 統計グリッド（文字数以外の5統計） */}
        <div className={styles.statsGrid}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>文字数（空白除く）</span>
            <span className={styles.statValue}>{result.charsNoSpaces}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>バイト数 (UTF-8)</span>
            <span className={styles.statValue}>{result.bytes}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>単語数</span>
            <span className={styles.statValue}>{result.words}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>行数</span>
            <span className={styles.statValue}>{result.lines}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>段落数</span>
            <span className={styles.statValue}>{result.paragraphs}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

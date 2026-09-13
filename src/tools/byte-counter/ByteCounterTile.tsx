"use client";

/**
 * ByteCounterTile — バイト数計算ツールの単一正典タイル
 *
 * cycle-228 T-2: ByteCounterPage.tsx を廃止し、Panel ルートのタイルへ統一。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>。外部ラッパーなし。
 * - **1ツール n タイル = variant**: full / compact は同一コンポーネントの
 *   設定差で表現。別実装を作らない（分裂ゼロ）。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない（A-6 準拠）。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する（道具箱に置いても単独で動く）。
 * - **logic.ts 共有エンジン**: analyzeText が唯一のロジック源（再実装・改変禁止）。
 *
 * ## variant
 *
 * - `"full"` (デフォルト): 全統計表示（バイト数・文字数・行数・単語数）＋バイト分布内訳。
 * - `"compact"`: 主要統計のみ（バイト数・文字数・行数・単語数）。バイト分布を非表示。
 *
 * ## アクセシビリティ（C-3 準拠）
 *
 * - role="status" aria-live="polite" の div にサマリテキストを置く。
 *   aria-atomic は付けない（付けると入力1文字ごとに全統計が読み上げられる）。
 * - 詳細統計はライブリージョン外の role="region" に配置（フォーカス時のみ読み上げ）。
 */

import { useId, useMemo, useState } from "react";
import Panel from "@/components/Panel";
import Textarea from "@/components/Textarea";
import { analyzeText } from "./logic";
import styles from "./ByteCounterTile.module.css";

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type ByteCounterTileVariant = "full" | "compact";

export interface ByteCounterTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": 全統計表示（バイト数・文字数・行数・単語数）＋バイト分布内訳
   * - "compact": 主要統計のみ（バイト分布非表示）
   */
  variant?: ByteCounterTileVariant;
  /** 初期入力値（デフォルト: ""） */
  defaultInput?: string;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

export default function ByteCounterTile({
  variant = "full",
  defaultInput = "",
  as = "section",
  className,
}: ByteCounterTileProps = {}) {
  // ---------- id インスタンス一意化（A-6: 複数同居時の重複 id・label 誤結合防止） ----------
  const uid = useId();
  const inputId = `${uid}-input`;
  const liveRegionId = `${uid}-live`;

  // ---------- State ----------
  const [text, setText] = useState(defaultInput);

  // ---------- リアルタイム集計（共有エンジン logic.ts を使用・再実装禁止） ----------
  const result = useMemo(() => analyzeText(text), [text]);

  // C-3: ライブリージョンに置くサマリテキスト（簡潔に・全統計でなく要点のみ）
  // aria-atomic を付けないため、入力変化ごとに全文読み上げにならない
  const summaryText = text
    ? `${result.byteLength}バイト、${result.charCount}文字、${result.lineCount}行`
    : "";

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）
  return (
    <Panel as={as} className={className}>
      {/* テキスト入力欄 */}
      <div className={styles.field}>
        <label htmlFor={inputId} className={styles.fieldLabel}>
          テキストを入力
        </label>
        <Textarea
          id={inputId}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="ここにテキストを入力してください..."
          rows={10}
          aria-describedby={liveRegionId}
        />
      </div>

      {/*
       * C-3: ライブリージョン（role="status" aria-live="polite"）
       * サマリテキストのみを置く。aria-atomic は付けない。
       * 詳細統計はこのリージョンの外に配置する。
       * visually-hidden で視覚的には非表示だが SR には読み上げられる。
       */}
      <div
        id={liveRegionId}
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

        {/* バイト構成内訳（variant=full のみ表示） */}
        {variant === "full" && (
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
        )}
      </div>
    </Panel>
  );
}

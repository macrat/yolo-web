"use client";

/**
 * CharCountTile — 文字数カウントの単一正典タイル
 *
 * cycle-228 T-1: CharCountPage.tsx を Panel ルートのタイルへ作り直したもの。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>。外部ラッパーなし。
 * - **1ツール n タイル = variant**: full / compact は同一コンポーネントの
 *   設定差で表現。別実装を作らない（分裂ゼロ）。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する。
 * - **logic.ts 共有エンジン**: analyzeText が唯一のロジック源。改変禁止。
 *
 * ## variant
 *
 * - `"full"` (デフォルト): 全6統計（文字数・文字数（空白除く）・バイト数・単語数・行数・段落数）を表示。
 * - `"compact"`: 主要統計のみ（文字数・バイト数・単語数・行数）を表示。
 *   道具箱での省スペース表示に適した設定差。
 *
 * ## 使い方
 *
 * ```tsx
 * // 道具箱や詳細ページから同一エクスポートを描画する（同一性の構造的保証）
 * <CharCountTile variant="full" />
 * <CharCountTile variant="compact" />
 * ```
 *
 * ## アクセシビリティ（C-3 準拠）
 *
 * - role="status" aria-live="polite" の div にサマリテキストを置く
 *   （readOnly や動的テキスト変化はスクリーンリーダーが値の変化を検知しないため）
 * - 詳細統計は role="region" aria-label="文字数カウント結果" のリージョン内に配置
 */

import { useId, useMemo, useState } from "react";
import Panel from "@/components/Panel";
import Textarea from "@/components/Textarea";
import { analyzeText } from "./logic";
import styles from "./CharCountTile.module.css";

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type CharCountTileVariant = "full" | "compact";

export interface CharCountTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": 全6統計（文字数・文字数（空白除く）・バイト数・単語数・行数・段落数）を表示
   * - "compact": 主要統計のみ（文字数・バイト数・単語数・行数）を表示
   */
  variant?: CharCountTileVariant;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

export default function CharCountTile({
  variant = "full",
  as = "section",
  className,
}: CharCountTileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合防止） ----------
  const uid = useId();
  const inputId = `${uid}-input`;
  const summaryId = `${uid}-summary`;

  // ---------- State ----------
  const [text, setText] = useState("");

  // ---------- リアルタイム解析（共有エンジン logic.ts を使用） ----------
  const result = useMemo(() => analyzeText(text), [text]);

  // ---------- C-3: ライブリージョンに読み上げるサマリテキスト ----------
  // readOnly でも動的テキスト変化でも SR が値の変化を読み上げないため、
  // 明示的なサマリテキストをライブリージョンに配置する。
  const summaryText = text
    ? `${result.chars}文字、${result.bytes}バイト、${result.lines}行、${result.words}単語`
    : "テキストを入力してください";

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）
  return (
    <Panel as={as} className={className}>
      {/* テキスト入力欄 */}
      <label htmlFor={inputId} className={styles.inputLabel}>
        テキストを入力
      </label>
      <Textarea
        id={inputId}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="ここにテキストを入力してください..."
        rows={variant === "compact" ? 5 : 10}
        aria-describedby={summaryId}
      />

      {/*
       * C-3: ライブリージョン（role="status" aria-live="polite"）
       * サマリテキストのみを置く。visually-hidden で視覚的には非表示だが SR には読み上げられる。
       * aria-atomic は付けない（付けると全テキストが毎回読み上げられる）。
       */}
      <div
        id={summaryId}
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
        {/* プライマリ統計（文字数・大きく表示） */}
        <div className={styles.primaryStat}>
          <span className={styles.primaryStatLabel}>文字数</span>
          <span className={styles.primaryStatValue}>{result.chars}</span>
        </div>

        {/* 統計グリッド */}
        <div className={styles.statsGrid}>
          {/* full/compact 共通統計 */}
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

          {/* full のみ表示する追加統計 */}
          {variant === "full" && (
            <>
              <div className={styles.stat}>
                <span className={styles.statLabel}>文字数（空白除く）</span>
                <span className={styles.statValue}>{result.charsNoSpaces}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>段落数</span>
                <span className={styles.statValue}>{result.paragraphs}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </Panel>
  );
}

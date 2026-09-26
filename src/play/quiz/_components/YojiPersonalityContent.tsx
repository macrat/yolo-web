/**
 * YojiPersonalityContent - yoji-personality variant の共通コンテンツコンポーネント。
 *
 * ResultCard.tsx（受検者向け）と page.tsx（第三者向け）の両方から使用される。
 * Server Component（"use client" なし）: 純粋なプレゼンテーションコンポーネント。
 *
 * 共通化対象:
 * - kanjiBreakdown / origin / behaviors / motto / 他のタイプ（OtherTypesNav） の5セクション
 *
 * 共通化しないもの（呼び出し側の責務）:
 * - catchphrase の表示（ResultCard/page.tsx でスタイル・配置が異なる）
 * - CTA（afterMotto スロットとして注入）
 * - ShareButtons / もう一度挑戦するボタン
 *
 * タイプごとの色は装飾に使わず、共通のトークンで組む。色がタイプの中身ではないため（DESIGN.md §2）。
 */

import type React from "react";
import type { YojiPersonalityDetailedContent } from "@/play/quiz/types";
import yojiPersonalityQuiz from "@/play/quiz/data/yoji-personality";
import OtherTypesNav from "./OtherTypesNav";
import styles from "./YojiPersonalityContent.module.css";

interface YojiPersonalityContentProps {
  /** detailedContent（kanjiBreakdown, origin, behaviors, motto を含む） */
  content: YojiPersonalityDetailedContent;
  /** 結果ID（他のタイプで現在のタイプをハイライトするため） */
  resultId: string;
  /**
   * 結果タイプのテーマカラー（--type-color CSS変数に注入）。
   * 新デザインでは装飾には参照しないが、caller signature 互換のため受け取りは残す
   * （page.tsx / ResultCard の引数を壊さないための dead 注入）。
   */
  resultColor: string;
  /** 見出しタグのレベル。page.tsxではh2（h1の次）、ResultCard内ではh3（h2の次） */
  headingLevel: 2 | 3;
  /** motto後・他のタイプ前にページ固有要素（CTA等）を挿入するスロット */
  afterMotto?: React.ReactNode;
}

export default function YojiPersonalityContent({
  content,
  resultId,
  resultColor,
  headingLevel,
  afterMotto,
}: YojiPersonalityContentProps) {
  const quiz = yojiPersonalityQuiz;
  // headingLevel に応じて h2 または h3 タグを動的に切り替える
  const Heading = `h${headingLevel}` as "h2" | "h3";

  return (
    // 新デザインでは --type-color を装飾に使わない（共通アクセントに統一）。
    // ただし page.tsx / ResultCard など caller の signature 互換を壊さないため、
    // resultColor の受け取りと --type-color の注入自体は残す（dead 注入だが互換目的）。
    <div
      className={styles.wrapper}
      style={{ "--type-color": resultColor } as React.CSSProperties}
    >
      {/* kanjiBreakdown セクション: 漢字一字ずつの意味を紐解く知的コンテンツ（中心解説） */}
      <Heading className={styles.sectionHeading}>
        この四字熟語の成り立ち
      </Heading>
      <div className={styles.kanjiBreakdownCard}>{content.kanjiBreakdown}</div>

      {/* origin セクション: 歴史的背景・出典の解説（副次的な背景） */}
      <Heading className={styles.sectionHeading}>この四字熟語のルーツ</Heading>
      <div className={styles.originCard}>{content.origin}</div>

      {/* behaviors セクション: 共感あるある4項目 */}
      <Heading className={styles.sectionHeading}>
        この四字熟語が現れる日常
      </Heading>
      <ul className={styles.behaviorsList}>
        {content.behaviors.map((b, i) => (
          <li key={i} className={styles.behaviorsItem}>
            {b}
          </li>
        ))}
      </ul>

      {/* motto セクション: 座右の銘としての締めのメッセージ */}
      <Heading className={styles.sectionHeading}>座右の銘として</Heading>
      <div className={styles.mottoCard}>{content.motto}</div>

      {/* afterMotto スロット: CTA等のページ固有要素 */}
      {afterMotto}

      <OtherTypesNav
        quizSlug={quiz.meta.slug}
        currentResultId={resultId}
        results={quiz.results}
        headingLevel={headingLevel}
      />
    </div>
  );
}

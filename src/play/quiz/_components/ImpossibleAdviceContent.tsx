/**
 * ImpossibleAdviceContent - impossible-advice variant の共通コンテンツコンポーネント。
 *
 * ResultCard.tsx（受検者向け）と page.tsx（第三者向け）の両方から使用される。
 * Server Component（"use client" なし）: 純粋なプレゼンテーションコンポーネント。
 *
 * 共通化対象:
 * - diagnosisCore / behaviors / practicalTip / 他のタイプ（OtherTypesNav） の4セクション
 *
 * 共通化しないもの（呼び出し側の責務）:
 * - catchphrase の表示（ResultCard/page.tsx でスタイル・配置が異なる）
 * - CTA（afterPracticalTip スロットとして注入）
 * - ShareButtons / もう一度挑戦するボタン
 *
 * タイプごとの色は装飾に使わず、共通のトークンで組む。色がタイプの中身ではないため（DESIGN.md §2）。
 */

import type React from "react";
import type { ImpossibleAdviceDetailedContent } from "@/play/quiz/types";
import type { QuizResult } from "@/play/quiz/types";
import OtherTypesNav from "./OtherTypesNav";
import styles from "./ImpossibleAdviceContent.module.css";

interface ImpossibleAdviceContentProps {
  /** クイズのスラグ（他のタイプのリンク生成に使用） */
  quizSlug: string;
  /** 結果ID（他のタイプで現在のタイプをハイライトするため） */
  resultId: string;
  /** detailedContent（diagnosisCore, behaviors, practicalTip を含む） */
  detailedContent: ImpossibleAdviceDetailedContent;
  /** 全タイプの配列（他のタイプに並べる） */
  allResults: QuizResult[];
  /** 見出しタグのレベル。page.tsxではh2（h1の次）、ResultCard内ではh3（h2の次） */
  headingLevel: 2 | 3;
  /**
   * 結果タイプのテーマカラー（--type-color CSS変数に注入）。
   * 新デザインでは装飾には参照しないが、caller signature 互換のため受け取りは残す
   * （page.tsx / ResultCard の引数を壊さないための dead 注入）。
   */
  resultColor: string;
  /** practicalTip後・他のタイプ前にページ固有要素（CTA等）を挿入するスロット */
  afterPracticalTip?: React.ReactNode;
}

export default function ImpossibleAdviceContent({
  quizSlug,
  resultId,
  detailedContent,
  allResults,
  headingLevel,
  resultColor,
  afterPracticalTip,
}: ImpossibleAdviceContentProps) {
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
      {/* diagnosisCore セクション: 悩みの本質の散文分析（中心解説） */}
      <Heading className={styles.sectionHeading}>あなたの悩みの本質</Heading>
      <div className={styles.diagnosisCoreCard}>
        {detailedContent.diagnosisCore}
      </div>

      {/* behaviors セクション: ついやってしまうあるあるシーン */}
      <Heading className={styles.sectionHeading}>ついやってしまうこと</Heading>
      <ul className={styles.behaviorsList}>
        {detailedContent.behaviors.map((b, i) => (
          <li key={i} className={styles.behaviorsItem}>
            {b}
          </li>
        ))}
      </ul>

      {/* practicalTip セクション: 本当に使える小さなヒント（締めの提案） */}
      <Heading className={styles.sectionHeading}>
        本当に使える小さなヒント
      </Heading>
      <div className={styles.practicalTipCard}>
        {detailedContent.practicalTip}
      </div>

      {/* afterPracticalTip スロット: CTA等のページ固有要素 */}
      {afterPracticalTip}

      <OtherTypesNav
        quizSlug={quizSlug}
        currentResultId={resultId}
        results={allResults}
        headingLevel={headingLevel}
      />
    </div>
  );
}

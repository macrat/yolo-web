/**
 * ImpossibleAdviceContent - impossible-advice variant の共通コンテンツコンポーネント。
 *
 * ResultCard.tsx（解き終えた画面）と page.tsx（結果のページ）の両方から使用される。
 * Server Component（"use client" なし）: 純粋なプレゼンテーションコンポーネント。
 *
 * 共通化対象:
 * - diagnosisCore / behaviors / practicalTip / すべてのタイプ（OtherTypesNav） の4セクション
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
import OtherTypesNav, {
  type ResultPlacement,
  SECTION_HEADING,
} from "./OtherTypesNav";
import styles from "./ImpossibleAdviceContent.module.css";

interface ImpossibleAdviceContentProps {
  /** クイズのスラグ（すべてのタイプのリンク生成に使用） */
  quizSlug: string;
  /** 結果ID（すべてのタイプで現在のタイプをハイライトするため） */
  resultId: string;
  /** detailedContent（diagnosisCore, behaviors, practicalTip を含む） */
  detailedContent: ImpossibleAdviceDetailedContent;
  /** 全タイプの配列（すべてのタイプに並べる） */
  allResults: QuizResult[];
  /** 置く面。page.tsx は結果のページ、ResultCard は解き終えた画面。見出しの階層と、すべてのタイプでのいまのタイプの示し方が決まる。 */
  placement: ResultPlacement;
  /** practicalTip後・すべてのタイプ前にページ固有要素（CTA等）を挿入するスロット */
  afterPracticalTip?: React.ReactNode;
}

export default function ImpossibleAdviceContent({
  quizSlug,
  resultId,
  detailedContent,
  allResults,
  placement,
  afterPracticalTip,
}: ImpossibleAdviceContentProps) {
  const Heading = SECTION_HEADING[placement];

  return (
    <div className={styles.wrapper}>
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
        placement={placement}
      />
    </div>
  );
}

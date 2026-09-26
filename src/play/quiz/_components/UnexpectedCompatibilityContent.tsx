/**
 * UnexpectedCompatibilityContent - unexpected-compatibility variant の共通コンテンツコンポーネント。
 *
 * ResultCard.tsx（受検者向け）と page.tsx（第三者向け）の両方から使用される。
 * Server Component（"use client" なし）: 純粋なプレゼンテーションコンポーネント。
 *
 * 共通化対象:
 * - entityEssence / whyCompatible / behaviors / lifeAdvice / 他のタイプ（OtherTypesNav） の5セクション
 *
 * 共通化しないもの（呼び出し側の責務）:
 * - catchphrase の表示（ResultCard/page.tsx でスタイル・配置が異なる）
 * - CTA（afterLifeAdvice スロットとして注入）
 * - ShareButtons / もう一度挑戦するボタン
 *
 * タイプごとの色は装飾に使わず、共通のトークンで組む。色がタイプの中身ではないため（DESIGN.md §2）。
 */

import type React from "react";
import type { UnexpectedCompatibilityDetailedContent } from "@/play/quiz/types";
import type { QuizResult } from "@/play/quiz/types";
import OtherTypesNav, {
  type ResultPlacement,
  SECTION_HEADING,
} from "./OtherTypesNav";
import styles from "./UnexpectedCompatibilityContent.module.css";

interface UnexpectedCompatibilityContentProps {
  /** クイズのスラグ（他のタイプのリンク生成に使用） */
  quizSlug: string;
  /** 結果ID（他のタイプで現在のタイプをハイライトするため） */
  resultId: string;
  /** detailedContent（entityEssence, whyCompatible, behaviors, lifeAdvice を含む） */
  detailedContent: UnexpectedCompatibilityDetailedContent;
  /** 全タイプの配列（他のタイプに並べる） */
  allResults: QuizResult[];
  /** 置く面。page.tsx は結果のページ、ResultCard は解き終えた画面。見出しの階層と、他のタイプでのいまのタイプの示し方が決まる。 */
  placement: ResultPlacement;
  /** lifeAdvice後・他のタイプ前にページ固有要素（CTA等）を挿入するスロット */
  afterLifeAdvice?: React.ReactNode;
}

export default function UnexpectedCompatibilityContent({
  quizSlug,
  resultId,
  detailedContent,
  allResults,
  placement,
  afterLifeAdvice,
}: UnexpectedCompatibilityContentProps) {
  const Heading = SECTION_HEADING[placement];

  return (
    <div className={styles.wrapper}>
      {/* entityEssence セクション: 存在の本質を哲学的・ユーモラスに解説（中心解説） */}
      <Heading className={styles.sectionHeading}>この存在の本質</Heading>
      <div className={styles.entityEssenceCard}>
        {detailedContent.entityEssence}
      </div>

      {/* whyCompatible セクション: なぜこの存在と相性が良いかの核心解説 */}
      <Heading className={styles.sectionHeading}>なぜ相性が良いのか</Heading>
      <div className={styles.whyCompatibleCard}>
        {detailedContent.whyCompatible}
      </div>

      {/* behaviors セクション: あるある・日常での共鳴シーン4項目 */}
      <Heading className={styles.sectionHeading}>
        この存在と共鳴する日常
      </Heading>
      <ul className={styles.behaviorsList}>
        {detailedContent.behaviors.map((b, i) => (
          <li key={i} className={styles.behaviorsItem}>
            {b}
          </li>
        ))}
      </ul>

      {/* lifeAdvice セクション: この存在から学べる教訓・締めのメッセージ */}
      <Heading className={styles.sectionHeading}>
        この存在から学べること
      </Heading>
      <div className={styles.lifeAdviceCard}>{detailedContent.lifeAdvice}</div>

      {/* afterLifeAdvice スロット: CTA等のページ固有要素 */}
      {afterLifeAdvice}

      <OtherTypesNav
        quizSlug={quizSlug}
        currentResultId={resultId}
        results={allResults}
        placement={placement}
      />
    </div>
  );
}

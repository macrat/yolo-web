/**
 * TraditionalColorContent - traditional-color variant の共通コンテンツコンポーネント。
 *
 * ResultCard.tsx（解き終えた画面）と page.tsx（結果のページ）の両方から使用される。
 * Server Component（"use client" なし）: 純粋なプレゼンテーションコンポーネント。
 *
 * 共通化対象:
 * - colorMeaning / scenery+season / behaviors / colorAdvice / すべてのタイプ（OtherTypesNav） の5セクション
 *
 * 共通化しないもの（呼び出し側の責務）:
 * - catchphrase の表示（ResultCard/page.tsx でスタイル・配置が異なる）
 * - 相性セクション / CTA（afterColorAdvice スロットとして注入）
 * - ShareButtons / もう一度挑戦するボタン
 *
 * 伝統色はタイプの中身なので、すべてのタイプの行に色見本で見せる。見出しや地などの飾りには使わない（DESIGN.md §2）。
 */

import type React from "react";
import type { TraditionalColorDetailedContent } from "@/play/quiz/types";
import traditionalColorQuiz from "@/play/quiz/data/traditional-color";
import OtherTypesNav, {
  type ResultPlacement,
  SECTION_HEADING,
} from "./OtherTypesNav";
import styles from "./TraditionalColorContent.module.css";

interface TraditionalColorContentProps {
  /** detailedContent（colorMeaning, season, scenery, behaviors, colorAdvice を含む） */
  content: TraditionalColorDetailedContent;
  /** 結果ID（すべてのタイプで現在のタイプをハイライトするため） */
  resultId: string;
  /** 置く面。page.tsx は結果のページ、ResultCard は解き終えた画面。見出しの階層と、すべてのタイプでのいまのタイプの示し方が決まる。 */
  placement: ResultPlacement;
  /** colorAdvice後・すべてのタイプ前にページ固有要素（CTA等）を挿入するスロット */
  afterColorAdvice?: React.ReactNode;
}

export default function TraditionalColorContent({
  content,
  resultId,
  placement,
  afterColorAdvice,
}: TraditionalColorContentProps) {
  const quiz = traditionalColorQuiz;
  const Heading = SECTION_HEADING[placement];

  return (
    <div className={styles.wrapper}>
      {/* colorMeaning セクション: 色の文化的背景 */}
      <Heading className={styles.sectionHeading}>この色の物語</Heading>
      <div className={styles.colorMeaningCard}>{content.colorMeaning}</div>

      {/* scenery + season セクション: 視覚的イメージ喚起 */}
      <Heading className={styles.sectionHeading}>この色が映える風景</Heading>
      <div className={styles.sceneryCard}>
        <span className={styles.seasonTag}>{content.season}</span>
        <p className={styles.sceneryText}>{content.scenery}</p>
      </div>

      {/* behaviors セクション: あるある */}
      <Heading className={styles.sectionHeading}>この色が現れる場面</Heading>
      <ul className={styles.behaviorsList}>
        {content.behaviors.map((b, i) => (
          <li key={i} className={styles.behaviorsItem}>
            {b}
          </li>
        ))}
      </ul>

      {/* colorAdvice セクション: 締めのメッセージ */}
      <Heading className={styles.sectionHeading}>この色からのひとこと</Heading>
      <div className={styles.colorAdviceCard}>{content.colorAdvice}</div>

      {/* afterColorAdvice スロット: CTA等のページ固有要素 */}
      {afterColorAdvice}

      <OtherTypesNav
        quizSlug={quiz.meta.slug}
        currentResultId={resultId}
        results={quiz.results}
        placement={placement}
        showSwatch
      />
    </div>
  );
}

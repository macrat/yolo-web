/**
 * AnimalPersonalityContent - animal-personality variant の共通コンテンツコンポーネント。
 *
 * ResultCard.tsx（解き終えた画面）と
 * app/play/animal-personality/result/[resultId]/page.tsx（結果のページ）の
 * 両方から使用される。Server Component（"use client" なし）: 純粋なプレゼンテーション。
 *
 * 共通化対象:
 * - strengths / weaknesses / behaviors / todayAction / すべてのタイプ（OtherTypesNav） の 5 セクション
 *
 * 共通化しないもの（呼び出し側の責務）:
 * - catchphrase の表示（ResultCard/page.tsx でスタイル・配置が異なる）
 * - 相性セクション / CTA（afterTodayAction スロットとして注入）
 * - ShareButtons / もう一度挑戦するボタン
 *
 * 強み・弱み・行動の3セクションは色で分けず、同じ質感で組んで見出しと本文で見分けさせる（DESIGN.md §1）。
 */

import type React from "react";
import type { AnimalPersonalityDetailedContent } from "@/play/quiz/types";
import animalPersonalityQuiz from "@/play/quiz/data/animal-personality";
import OtherTypesNav, {
  type ResultPlacement,
  SECTION_HEADING,
} from "./OtherTypesNav";
import styles from "./AnimalPersonalityContent.module.css";

interface AnimalPersonalityContentProps {
  /** detailedContent（strengths, weaknesses, behaviors, todayAction を含む） */
  content: AnimalPersonalityDetailedContent;
  /** 結果ID（すべてのタイプで現在のタイプをハイライトするため） */
  resultId: string;
  /** 置く面。page.tsx は結果のページ、ResultCard は解き終えた画面。見出しの階層と、すべてのタイプでのいまのタイプの示し方が決まる。 */
  placement: ResultPlacement;
  /** 相性セクション・CTA等のページ固有要素を挿入するためのスロット（todayActionとすべてのタイプの間に表示） */
  afterTodayAction?: React.ReactNode;
}

export default function AnimalPersonalityContent({
  content,
  resultId,
  placement,
  afterTodayAction,
}: AnimalPersonalityContentProps) {
  const quiz = animalPersonalityQuiz;
  const Heading = SECTION_HEADING[placement];

  return (
    <div className={styles.wrapper}>
      {/* strengths セクション */}
      <Heading className={styles.sectionHeading}>このタイプの強み</Heading>
      <ul className={styles.itemList}>
        {content.strengths.map((s, i) => (
          <li key={i} className={styles.item}>
            {s}
          </li>
        ))}
      </ul>

      {/* weaknesses セクション */}
      <Heading className={styles.sectionHeading}>このタイプの弱み</Heading>
      <ul className={styles.itemList}>
        {content.weaknesses.map((w, i) => (
          <li key={i} className={styles.item}>
            {w}
          </li>
        ))}
      </ul>

      {/* behaviors セクション */}
      <Heading className={styles.sectionHeading}>
        この動物に似た行動パターン
      </Heading>
      <ul className={styles.itemList}>
        {content.behaviors.map((b, i) => (
          <li key={i} className={styles.item}>
            {b}
          </li>
        ))}
      </ul>

      {/* todayAction セクション: 呼びかけなので、リストと分けて --paper-2 の地に置く */}
      <Heading className={styles.sectionHeading}>今日試してほしいこと</Heading>
      <div className={styles.todayActionCard}>{content.todayAction}</div>

      {/* afterTodayAction スロット: 相性セクション・CTA等のページ固有要素 */}
      {afterTodayAction}

      <OtherTypesNav
        quizSlug={quiz.meta.slug}
        currentResultId={resultId}
        results={quiz.results}
        placement={placement}
      />
    </div>
  );
}

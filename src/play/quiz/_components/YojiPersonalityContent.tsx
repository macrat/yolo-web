/**
 * YojiPersonalityContent - yoji-personality variant の共通コンテンツコンポーネント。
 *
 * ResultCard.tsx（解き終えた画面）と page.tsx（結果のページ）の両方から使用される。
 * Server Component（"use client" なし）: 純粋なプレゼンテーションコンポーネント。
 *
 * 共通化対象:
 * - kanjiBreakdown / origin / behaviors / motto / すべてのタイプ（OtherTypesNav） の5セクション
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
import OtherTypesNav, {
  type ResultPlacement,
  SECTION_HEADING,
} from "./OtherTypesNav";
import styles from "./YojiPersonalityContent.module.css";

interface YojiPersonalityContentProps {
  /** detailedContent（kanjiBreakdown, origin, behaviors, motto を含む） */
  content: YojiPersonalityDetailedContent;
  /** 結果ID（すべてのタイプで現在のタイプをハイライトするため） */
  resultId: string;
  /** 置く面。page.tsx は結果のページ、ResultCard は解き終えた画面。見出しの階層と、すべてのタイプでのいまのタイプの示し方が決まる。 */
  placement: ResultPlacement;
  /** motto後・すべてのタイプ前にページ固有要素（CTA等）を挿入するスロット */
  afterMotto?: React.ReactNode;
}

export default function YojiPersonalityContent({
  content,
  resultId,
  placement,
  afterMotto,
}: YojiPersonalityContentProps) {
  const quiz = yojiPersonalityQuiz;
  const Heading = SECTION_HEADING[placement];

  return (
    <div className={styles.wrapper}>
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
        placement={placement}
      />
    </div>
  );
}

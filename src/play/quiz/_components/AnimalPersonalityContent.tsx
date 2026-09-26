/**
 * AnimalPersonalityContent - animal-personality variant の共通コンテンツコンポーネント。
 *
 * ResultCard.tsx（受検者向けインライン結果）と
 * app/play/animal-personality/result/[resultId]/page.tsx（第三者向け静的結果ページ）の
 * 両方から使用される。Server Component（"use client" なし）: 純粋なプレゼンテーション。
 *
 * 共通化対象:
 * - strengths / weaknesses / behaviors / todayAction / 他のタイプ（OtherTypesNav） の 5 セクション
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
import OtherTypesNav from "./OtherTypesNav";
import styles from "./AnimalPersonalityContent.module.css";

interface AnimalPersonalityContentProps {
  /** detailedContent（strengths, weaknesses, behaviors, todayAction を含む） */
  content: AnimalPersonalityDetailedContent;
  /** 結果ID（他のタイプで現在のタイプをハイライトするため） */
  resultId: string;
  /** 見出しタグのレベル。page.tsxではh2（h1の次）、ResultCard内ではh3（h2の次） */
  headingLevel: 2 | 3;
  /** 相性セクション・CTA等のページ固有要素を挿入するためのスロット（todayActionと他のタイプの間に表示） */
  afterTodayAction?: React.ReactNode;
}

export default function AnimalPersonalityContent({
  content,
  resultId,
  headingLevel,
  afterTodayAction,
}: AnimalPersonalityContentProps) {
  const quiz = animalPersonalityQuiz;
  // headingLevel に応じて h2 または h3 タグを動的に切り替える
  const Heading = `h${headingLevel}` as "h2" | "h3";

  return (
    // 新デザインではタイプごとのアクセント色（旧 --animal-accent-color）を撤廃し、
    // wrapper は左寄せ宣言のみ持つ。装飾は共通 --accent / --accent-soft / --accent-strong に統一。
    <div className={styles.wrapper}>
      {/* strengths セクション: 旧版は ✨ 絵文字＋緑ティントだったが、
          新デザインでは他リストと同じ「アクセント縦線マーカー＋枠線カード」に統一する。 */}
      <Heading className={styles.sectionHeading}>このタイプの強み</Heading>
      <ul className={styles.itemList}>
        {content.strengths.map((s, i) => (
          <li key={i} className={styles.item}>
            {s}
          </li>
        ))}
      </ul>

      {/* weaknesses セクション: 旧版は 😅 絵文字＋クリームティントだったが、
          新デザインでは他リストと同質感に統一する。 */}
      <Heading className={styles.sectionHeading}>このタイプの弱み</Heading>
      <ul className={styles.itemList}>
        {content.weaknesses.map((w, i) => (
          <li key={i} className={styles.item}>
            {w}
          </li>
        ))}
      </ul>

      {/* behaviors セクション: 旧版は 💡 絵文字だったが、絵文字は撤去。 */}
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

      {/* todayAction セクション: ResultCard adviceCard 相当の淡いアクセント面で
          「呼びかけ」のトーンを静かに強調する（中央寄せはしない）。 */}
      <Heading className={styles.sectionHeading}>今日試してほしいこと</Heading>
      <div className={styles.todayActionCard}>{content.todayAction}</div>

      {/* afterTodayAction スロット: 相性セクション・CTA等のページ固有要素 */}
      {afterTodayAction}

      <OtherTypesNav
        quizSlug={quiz.meta.slug}
        currentResultId={resultId}
        results={quiz.results}
        headingLevel={headingLevel}
      />
    </div>
  );
}

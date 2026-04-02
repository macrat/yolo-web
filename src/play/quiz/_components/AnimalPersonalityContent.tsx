/**
 * AnimalPersonalityContent - animal-personality variant の共通コンテンツコンポーネント。
 *
 * ResultCard.tsx（受検者向け）と page.tsx（第三者向け）の両方から使用される。
 * Server Component（"use client" なし）: 純粋なプレゼンテーションコンポーネント。
 *
 * 共通化対象:
 * - strengths / weaknesses / behaviors / todayAction / 全タイプ一覧 の5セクション
 * - CSS変数によるダークモード対応（--animal-accent-color, --animal-accent-bg）
 *
 * 共通化しないもの（呼び出し側の責務）:
 * - catchphrase の表示（ResultCard/page.tsx でスタイル・配置が異なる）
 * - 相性セクション / CTA（afterTodayAction スロットとして注入）
 * - ShareButtons / もう一度挑戦するボタン
 */

import type React from "react";
import Link from "next/link";
import type { AnimalPersonalityDetailedContent } from "@/play/quiz/types";
import animalPersonalityQuiz from "@/play/quiz/data/animal-personality";
import styles from "./AnimalPersonalityContent.module.css";

interface AnimalPersonalityContentProps {
  /** detailedContent（strengths, weaknesses, behaviors, todayAction を含む） */
  content: AnimalPersonalityDetailedContent;
  /** 結果ID（全タイプ一覧で現在のタイプをハイライトするため） */
  resultId: string;
  /** 見出しタグのレベル。page.tsxではh2（h1の次）、ResultCard内ではh3（h2の次） */
  headingLevel: 2 | 3;
  /** 全タイプ一覧のレイアウト。ResultCard内では "list"（縦並び）、結果ページでは "pill"（ピル型横wrap） */
  allTypesLayout: "list" | "pill";
  /** 相性セクション・CTA等のページ固有要素を挿入するためのスロット（todayActionと全タイプ一覧の間に表示） */
  afterTodayAction?: React.ReactNode;
}

export default function AnimalPersonalityContent({
  content,
  resultId,
  headingLevel,
  allTypesLayout,
  afterTodayAction,
}: AnimalPersonalityContentProps) {
  const quiz = animalPersonalityQuiz;
  // headingLevel に応じて h2 または h3 タグを動的に切り替える
  const Heading = `h${headingLevel}` as "h2" | "h3";

  const allTypesListClass =
    allTypesLayout === "pill"
      ? styles.allTypesListPill
      : styles.allTypesListVertical;

  return (
    // wrapperクラスで --animal-accent-color / --animal-accent-bg を定義。
    // ライトモード: #15803d（WCAG準拠）、ダークモード: #4ade80（WCAG AA準拠）。
    // CSS変数はCSSファイル側で管理し、inline styleは使用しない。
    <div className={styles.wrapper}>
      {/* strengths セクション */}
      <Heading className={styles.sectionHeading}>このタイプの強み</Heading>
      <ul className={styles.strengthsList}>
        {content.strengths.map((s, i) => (
          <li key={i} className={styles.strengthsItem}>
            {s}
          </li>
        ))}
      </ul>

      {/* weaknesses セクション */}
      <Heading className={styles.sectionHeading}>このタイプの弱み</Heading>
      <ul className={styles.weaknessesList}>
        {content.weaknesses.map((w, i) => (
          <li key={i} className={styles.weaknessesItem}>
            {w}
          </li>
        ))}
      </ul>

      {/* behaviors セクション */}
      <Heading className={styles.sectionHeading}>
        この動物に似た行動パターン
      </Heading>
      <ul className={styles.behaviorsList}>
        {content.behaviors.map((b, i) => (
          <li key={i} className={styles.behaviorsItem}>
            {b}
          </li>
        ))}
      </ul>

      {/* todayAction セクション */}
      <Heading className={styles.sectionHeading}>今日試してほしいこと</Heading>
      <div className={styles.todayActionCard}>{content.todayAction}</div>

      {/* afterTodayAction スロット: 相性セクション・CTA等のページ固有要素 */}
      {afterTodayAction}

      {/* 全タイプ一覧セクション */}
      <div className={styles.allTypesSection}>
        <Heading className={styles.allTypesCta}>他の動物も見てみよう</Heading>
        <ul className={allTypesListClass}>
          {quiz.results.map((r) => (
            <li
              key={r.id}
              className={
                r.id === resultId
                  ? styles.allTypesItemCurrent
                  : styles.allTypesItem
              }
            >
              <Link href={`/play/${quiz.meta.slug}/result/${r.id}`}>
                {r.icon && <span>{r.icon}</span>}
                <span>{r.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

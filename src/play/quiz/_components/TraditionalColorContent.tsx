/**
 * TraditionalColorContent - traditional-color variant の共通コンテンツコンポーネント。
 *
 * ResultCard.tsx（受検者向け）と page.tsx（第三者向け）の両方から使用される。
 * Server Component（"use client" なし）: 純粋なプレゼンテーションコンポーネント。
 *
 * 共通化対象:
 * - colorMeaning / scenery+season / behaviors / colorAdvice / 全タイプ一覧 の5セクション
 * - CSS変数 --type-color をインラインスタイルで注入（タイプごとに色が異なるため）
 * - ダークモード対応（opacity/border調整による汎用的コントラスト確保）
 *
 * 共通化しないもの（呼び出し側の責務）:
 * - catchphrase の表示（ResultCard/page.tsx でスタイル・配置が異なる）
 * - 相性セクション / CTA（afterColorAdvice スロットとして注入）
 * - ShareButtons / もう一度挑戦するボタン
 */

import type React from "react";
import Link from "next/link";
import type { TraditionalColorDetailedContent } from "@/play/quiz/types";
import traditionalColorQuiz from "@/play/quiz/data/traditional-color";
import styles from "./TraditionalColorContent.module.css";

interface TraditionalColorContentProps {
  /** detailedContent（colorMeaning, season, scenery, behaviors, colorAdvice を含む） */
  content: TraditionalColorDetailedContent;
  /** 結果ID（全タイプ一覧で現在のタイプをハイライトするため） */
  resultId: string;
  /** 結果タイプのテーマカラー（--type-color CSS変数に注入） */
  resultColor: string;
  /** 見出しタグのレベル。page.tsxではh2（h1の次）、ResultCard内ではh3（h2の次） */
  headingLevel: 2 | 3;
  /** 全タイプ一覧のレイアウト。ResultCard内では "list"（縦並び）、結果ページでは "pill"（ピル型横wrap） */
  allTypesLayout: "list" | "pill";
  /** colorAdvice後・全タイプ一覧前にページ固有要素（CTA等）を挿入するスロット */
  afterColorAdvice?: React.ReactNode;
}

export default function TraditionalColorContent({
  content,
  resultId,
  resultColor,
  headingLevel,
  allTypesLayout,
  afterColorAdvice,
}: TraditionalColorContentProps) {
  const quiz = traditionalColorQuiz;
  // headingLevel に応じて h2 または h3 タグを動的に切り替える
  const Heading = `h${headingLevel}` as "h2" | "h3";

  const allTypesListClass =
    allTypesLayout === "pill"
      ? styles.allTypesListPill
      : styles.allTypesListVertical;

  return (
    // wrapperクラスで --type-color をインラインスタイルで注入。
    // タイプごとに固有の色があるため、CSS変数ファイルではなくpropsから渡す。
    // ダークモード時のコントラスト調整はCSSファイル側で行う。
    <div
      className={styles.wrapper}
      style={{ "--type-color": resultColor } as React.CSSProperties}
    >
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

      {/* 全タイプ一覧セクション */}
      <div className={styles.allTypesSection}>
        <Heading className={styles.allTypesCta}>他の色も見てみよう</Heading>
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
              <Link
                href={`/play/${quiz.meta.slug}/result/${r.id}`}
                aria-current={r.id === resultId ? "page" : undefined}
              >
                {/* 各タイプの固有色をカラードットで表示 */}
                {r.color && (
                  <span
                    className={styles.colorDot}
                    style={{ backgroundColor: r.color }}
                    aria-hidden="true"
                  />
                )}
                <span>{r.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * UnexpectedCompatibilityContent - unexpected-compatibility variant の共通コンテンツコンポーネント。
 *
 * ResultCard.tsx（受検者向け）と page.tsx（第三者向け）の両方から使用される。
 * Server Component（"use client" なし）: 純粋なプレゼンテーションコンポーネント。
 *
 * 共通化対象:
 * - entityEssence / whyCompatible / behaviors / lifeAdvice / 全タイプ一覧 の5セクション
 * - CSS変数 --type-color をインラインスタイルで注入（タイプごとに色が異なるため）
 * - ダークモード対応（color-mix() による明度調整。YojiPersonalityContent と同じパターン）
 *
 * 共通化しないもの（呼び出し側の責務）:
 * - catchphrase の表示（ResultCard/page.tsx でスタイル・配置が異なる）
 * - CTA（afterLifeAdvice スロットとして注入）
 * - ShareButtons / もう一度挑戦するボタン
 */

import type React from "react";
import Link from "next/link";
import type { UnexpectedCompatibilityDetailedContent } from "@/play/quiz/types";
import type { QuizResult } from "@/play/quiz/types";
import styles from "./UnexpectedCompatibilityContent.module.css";

interface UnexpectedCompatibilityContentProps {
  /** クイズのスラグ（全タイプ一覧のリンク生成に使用） */
  quizSlug: string;
  /** 結果ID（全タイプ一覧で現在のタイプをハイライトするため） */
  resultId: string;
  /** detailedContent（entityEssence, whyCompatible, behaviors, lifeAdvice を含む） */
  detailedContent: UnexpectedCompatibilityDetailedContent;
  /** 全タイプの配列（タイプ一覧表示用） */
  allResults: QuizResult[];
  /** 見出しタグのレベル。page.tsxではh2（h1の次）、ResultCard内ではh3（h2の次） */
  headingLevel: 2 | 3;
  /** 全タイプ一覧のレイアウト。"pill"（ピル型横wrap）| "list"（縦並び）| "grid"（グリッド） */
  allTypesLayout: "pill" | "list" | "grid";
  /** 結果タイプのテーマカラー（--type-color CSS変数に注入） */
  resultColor: string;
  /** lifeAdvice後・全タイプ一覧前にページ固有要素（CTA等）を挿入するスロット */
  afterLifeAdvice?: React.ReactNode;
}

export default function UnexpectedCompatibilityContent({
  quizSlug,
  resultId,
  detailedContent,
  allResults,
  headingLevel,
  allTypesLayout,
  resultColor,
  afterLifeAdvice,
}: UnexpectedCompatibilityContentProps) {
  // headingLevel に応じて h2 または h3 タグを動的に切り替える
  const Heading = `h${headingLevel}` as "h2" | "h3";

  const allTypesListClass =
    allTypesLayout === "pill"
      ? styles.allTypesListPill
      : allTypesLayout === "grid"
        ? styles.allTypesListGrid
        : styles.allTypesListVertical;

  return (
    // wrapperクラスで --type-color をインラインスタイルで注入。
    // タイプごとに固有の色があるため、CSS変数ファイルではなくpropsから渡す。
    // ダークモード時のコントラスト調整はCSSファイル側で行う。
    <div
      className={styles.wrapper}
      style={{ "--type-color": resultColor } as React.CSSProperties}
    >
      {/* entityEssence セクション: 存在の本質を哲学的・ユーモラスに解説 */}
      <Heading className={styles.sectionHeading}>この存在の本質</Heading>
      <div className={styles.entityEssenceCard}>
        {detailedContent.entityEssence}
      </div>

      {/* whyCompatible セクション: なぜこの存在と相性が良いかの核心 */}
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

      {/* 全タイプ一覧セクション */}
      <div className={styles.allTypesSection}>
        <Heading className={styles.allTypesCta}>
          他の「相性の良い存在」も見てみよう
        </Heading>
        <ul className={allTypesListClass}>
          {allResults.map((r) => (
            <li
              key={r.id}
              className={
                r.id === resultId
                  ? styles.allTypesItemCurrent
                  : styles.allTypesItem
              }
            >
              <Link
                href={`/play/${quizSlug}/result/${r.id}`}
                aria-current={r.id === resultId ? "page" : undefined}
              >
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

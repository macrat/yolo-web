/**
 * ImpossibleAdviceContent - impossible-advice variant の共通コンテンツコンポーネント。
 *
 * ResultCard.tsx（受検者向け）と page.tsx（第三者向け）の両方から使用される。
 * Server Component（"use client" なし）: 純粋なプレゼンテーションコンポーネント。
 *
 * 共通化対象:
 * - diagnosisCore / behaviors / practicalTip / 全タイプ一覧 の4セクション
 * - CSS変数 --type-color をインラインスタイルで注入（タイプごとに色が異なるため）
 * - ダークモード対応（color-mix() による明度調整。YojiPersonalityContent と同じパターン）
 *
 * 共通化しないもの（呼び出し側の責務）:
 * - catchphrase の表示（ResultCard/page.tsx でスタイル・配置が異なる）
 * - CTA（afterPracticalTip スロットとして注入）
 * - ShareButtons / もう一度挑戦するボタン
 */

import type React from "react";
import Link from "next/link";
import type { ImpossibleAdviceDetailedContent } from "@/play/quiz/types";
import type { QuizResult } from "@/play/quiz/types";
import styles from "./ImpossibleAdviceContent.module.css";

interface ImpossibleAdviceContentProps {
  /** クイズのスラグ（全タイプ一覧のリンク生成に使用） */
  quizSlug: string;
  /** 結果ID（全タイプ一覧で現在のタイプをハイライトするため） */
  resultId: string;
  /** detailedContent（diagnosisCore, behaviors, practicalTip を含む） */
  detailedContent: ImpossibleAdviceDetailedContent;
  /** 全タイプの配列（タイプ一覧表示用） */
  allResults: QuizResult[];
  /** 見出しタグのレベル。page.tsxではh2（h1の次）、ResultCard内ではh3（h2の次） */
  headingLevel: 2 | 3;
  /** 全タイプ一覧のレイアウト。impossible-advice では "pill" 固定だが、一貫性のためpropsで受け取る */
  allTypesLayout: "pill";
  /** 結果タイプのテーマカラー（--type-color CSS変数に注入） */
  resultColor: string;
  /** practicalTip後・全タイプ一覧前にページ固有要素（CTA等）を挿入するスロット */
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
    // wrapperクラスで --type-color をインラインスタイルで注入。
    // タイプごとに固有の色があるため、CSS変数ファイルではなくpropsから渡す。
    // ダークモード時のコントラスト調整はCSSファイル側で行う。
    <div
      className={styles.wrapper}
      style={{ "--type-color": resultColor } as React.CSSProperties}
    >
      {/* diagnosisCore セクション: 悩みの本質の散文分析 */}
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

      {/* practicalTip セクション: 本当に使える小さなヒント */}
      <Heading className={styles.sectionHeading}>
        本当に使える小さなヒント
      </Heading>
      <div className={styles.practicalTipCard}>
        {detailedContent.practicalTip}
      </div>

      {/* afterPracticalTip スロット: CTA等のページ固有要素 */}
      {afterPracticalTip}

      {/* 全タイプ一覧セクション */}
      <div className={styles.allTypesSection}>
        <Heading className={styles.allTypesCta}>他のタイプも見てみよう</Heading>
        <ul className={styles.allTypesListPill}>
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

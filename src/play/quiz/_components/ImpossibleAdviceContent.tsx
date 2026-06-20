/**
 * ImpossibleAdviceContent - impossible-advice variant の共通コンテンツコンポーネント。
 *
 * ResultCard.tsx（受検者向け）と page.tsx（第三者向け）の両方から使用される。
 * Server Component（"use client" なし）: 純粋なプレゼンテーションコンポーネント。
 *
 * 共通化対象:
 * - diagnosisCore / behaviors / practicalTip / 全タイプ一覧 の4セクション
 *
 * 共通化しないもの（呼び出し側の責務）:
 * - catchphrase の表示（ResultCard/page.tsx でスタイル・配置が異なる）
 * - CTA（afterPracticalTip スロットとして注入）
 * - ShareButtons / もう一度挑戦するボタン
 *
 * 新デザイン体系（DESIGN.md / ResultCard.module.css）への移行ポイント:
 * - 装飾としての --type-color 参照は撤去し、共通アクセント（--accent 系）に統一。
 * - 絵文字マーカー（CSS ::before "💭"）・絵文字アイコン（r.icon 描画）を撤去。
 * - 中央寄せ・font-weight 700・旧トークン・角丸ハードコードを廃止。
 * - public props signature は caller 互換のためすべて維持する。
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
  /**
   * 全タイプ一覧のレイアウト。
   * - "pill": 旧名の互換ラベル。page.tsx（第三者向け静的結果ページ）が渡す。
   *   新デザインでは pill 型（角丸999px・派手色枠・font-weight 700）をやめ、
   *   CharacterPersonalityContent / YojiPersonalityContent と同じ grid 形式（2-3列）で表示する。
   *   public props signature を壊さないため呼び出し側はそのまま "pill" を渡してよい。
   * - "list": ResultCard（受検者向けインライン結果）が渡す縦リスト。
   *   インライン経路は 8 variant 共通で縦リストに揃えるため、Character/Animal と同じ
   *   allTypesListVertical 言語を使う。
   */
  allTypesLayout: "list" | "pill";
  /**
   * 結果タイプのテーマカラー（--type-color CSS変数に注入）。
   * 新デザインでは装飾には参照しないが、caller signature 互換のため受け取りは残す
   * （page.tsx / ResultCard の引数を壊さないための dead 注入）。
   */
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
  allTypesLayout,
  resultColor,
  afterPracticalTip,
}: ImpossibleAdviceContentProps) {
  // headingLevel に応じて h2 または h3 タグを動的に切り替える
  const Heading = `h${headingLevel}` as "h2" | "h3";

  // 全タイプ一覧のレイアウトクラスを surface ごとに切り替える。
  // - "list": インライン（ResultCard）— 縦リストで Character/Animal と質感を揃える
  // - "pill": 静的結果ページ（page.tsx）— 内部 grid（Character/Yoji と同じ allTypesGrid）
  // public props "pill" は caller 互換のためそのまま受け取り、内部で grid にマップする。
  const allTypesListClassName =
    allTypesLayout === "list"
      ? styles.allTypesListVertical
      : styles.allTypesGrid;

  return (
    // 新デザインでは --type-color を装飾に使わない（共通アクセントに統一）。
    // ただし page.tsx / ResultCard など caller の signature 互換を壊さないため、
    // resultColor の受け取りと --type-color の注入自体は残す（dead 注入だが互換目的）。
    <div
      className={styles.wrapper}
      style={{ "--type-color": resultColor } as React.CSSProperties}
    >
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

      {/* 全タイプ一覧セクション */}
      <div className={styles.allTypesSection}>
        <Heading className={styles.allTypesCta}>他のタイプも見てみよう</Heading>
        {/* surface ごとにレイアウトを切り替える:
            - page.tsx は "pill"（互換ラベル）→ Character/Yoji と同じ allTypesGrid（2-3列）
            - ResultCard は "list" → Character/Animal と同じ allTypesListVertical（縦リスト） */}
        <ul className={allTypesListClassName}>
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
                {/* 新デザインでは絵文字アイコン（r.icon）を描画しない（DESIGN.md: 絵文字を使わない）。
                    各タイプの区別はタイトル文言で行う。 */}
                <span>{r.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * UnexpectedCompatibilityContent - unexpected-compatibility variant の共通コンテンツコンポーネント。
 *
 * ResultCard.tsx（受検者向け）と page.tsx（第三者向け）の両方から使用される。
 * Server Component（"use client" なし）: 純粋なプレゼンテーションコンポーネント。
 *
 * 共通化対象:
 * - entityEssence / whyCompatible / behaviors / lifeAdvice / 全タイプ一覧 の5セクション
 * - 全タイプ一覧の現在タイプハイライト
 *
 * 共通化しないもの（呼び出し側の責務）:
 * - catchphrase の表示（ResultCard/page.tsx でスタイル・配置が異なる）
 * - CTA（afterLifeAdvice スロットとして注入）
 * - ShareButtons / もう一度挑戦するボタン
 *
 * 新デザイン体系（DESIGN.md / ResultCard.module.css）への移行ポイント:
 * - 装飾としての --type-color 参照は撤去し、共通アクセント（--accent 系）に統一。
 * - 絵文字マーカー（CSS ::before "✨"）・絵文字アイコン（r.icon 描画）を撤去。
 * - 中央寄せ・font-weight 700・旧トークン・角丸ハードコードを廃止。
 * - public props signature は caller 互換のためすべて維持する。
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
  /**
   * 全タイプ一覧のレイアウト。
   * "list": ResultCard 内で使用する縦並びリスト形式。
   * "grid": 結果ページで使用する2-3列グリッド形式。
   * "pill": 旧名の互換ラベル。新デザインでは pill 型（角丸999px・派手色枠・font-weight 700）をやめ、
   *   "grid" と同じグリッド形式に内部マップする。public props signature を壊さないため
   *   呼び出し側はそのまま "pill" を渡してよい。
   */
  allTypesLayout: "pill" | "list" | "grid";
  /**
   * 結果タイプのテーマカラー（--type-color CSS変数に注入）。
   * 新デザインでは装飾には参照しないが、caller signature 互換のため受け取りは残す
   * （page.tsx / ResultCard の引数を壊さないための dead 注入）。
   */
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

  // 新デザインでは旧 "pill"（派手色枠＋角丸999px＋font-weight 700）をやめ、
  // CharacterPersonalityContent / Yoji と同じ allTypesGrid に統一する。
  // "pill" は caller 互換のため受け取りだけ残し、"grid" と同じクラスにマップする。
  const allTypesListClass =
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

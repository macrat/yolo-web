/**
 * ContrarianFortuneContent - contrarian-fortune variant の共通コンテンツコンポーネント。
 *
 * ResultCard.tsx（受検者向け）と page.tsx（第三者向け）の両方から使用される。
 * Server Component（"use client" なし）: 純粋なプレゼンテーションコンポーネント。
 *
 * 共通化対象:
 * - coreSentence / behaviors / persona / thirdPartyNote / humorMetrics（省略可） / 他のタイプ（OtherTypesNav） の6セクション
 *
 * 共通化しないもの（呼び出し側の責務）:
 * - catchphrase の表示（ResultCard/page.tsx でスタイル・配置が異なる）
 * - CTA（afterThirdPartyNote スロットとして注入）
 * - ShareButtons / もう一度挑戦するボタン
 *
 * タイプごとの色は装飾に使わず、共通のトークンで組む。色がタイプの中身ではないため（DESIGN.md §2）。
 */

import type React from "react";
import type { ContrarianFortuneDetailedContent } from "@/play/quiz/types";
import type { QuizResult } from "@/play/quiz/types";
import OtherTypesNav from "./OtherTypesNav";
import styles from "./ContrarianFortuneContent.module.css";

interface ContrarianFortuneContentProps {
  /** クイズのスラグ（他のタイプのリンク生成に使用） */
  quizSlug: string;
  /** 結果ID（他のタイプで現在のタイプをハイライトするため） */
  resultId: string;
  /** detailedContent（coreSentence, behaviors, persona, thirdPartyNote, humorMetrics を含む） */
  detailedContent: ContrarianFortuneDetailedContent;
  /** 全タイプの配列（他のタイプに並べる） */
  allResults: QuizResult[];
  /** 見出しタグのレベル。page.tsxではh2（h1の次）、ResultCard内ではh3（h2の次） */
  headingLevel: 2 | 3;
  /**
   * 結果タイプのテーマカラー（--type-color CSS変数に注入）。
   * 新デザインでは装飾には参照しないが、caller signature 互換のため受け取りは残す
   * （page.tsx の引数を壊さないための dead 注入）。
   */
  resultColor: string;
  /** thirdPartyNote後・他のタイプ前にページ固有要素（CTA等）を挿入するスロット */
  afterThirdPartyNote?: React.ReactNode;
}

export default function ContrarianFortuneContent({
  quizSlug,
  resultId,
  detailedContent,
  allResults,
  headingLevel,
  resultColor,
  afterThirdPartyNote,
}: ContrarianFortuneContentProps) {
  // headingLevel に応じて h2 または h3 タグを動的に切り替える
  const Heading = `h${headingLevel}` as "h2" | "h3";

  return (
    // 新デザインでは --type-color を装飾に使わない（共通アクセントに統一）。
    // ただし page.tsx の caller signature 互換のため、resultColor の受け取りと
    // --type-color の注入自体は残す（dead 注入だが互換目的）。
    <div
      className={styles.wrapper}
      style={{ "--type-color": resultColor } as React.CSSProperties}
    >
      {/* coreSentence セクション: 逆張りフレームの核心一文（中心解説・アクセント面） */}
      <div className={styles.coreSentenceCard}>
        {detailedContent.coreSentence}
      </div>

      {/* behaviors セクション: あるある行動リスト */}
      <Heading className={styles.sectionHeading}>あるある行動</Heading>
      <ul className={styles.behaviorsList}>
        {detailedContent.behaviors.map((b, i) => (
          <li key={i} className={styles.behaviorsItem}>
            {b}
          </li>
        ))}
      </ul>

      {/* persona セクション: タイプの人物像（散文の語り） */}
      <Heading className={styles.sectionHeading}>このタイプの人物像</Heading>
      <div className={styles.personaCard}>{detailedContent.persona}</div>

      {/* thirdPartyNote セクション: 第三者視点のシーン描写 */}
      <Heading className={styles.sectionHeading}>
        このタイプの人と一緒にいると
      </Heading>
      <div className={styles.thirdPartyNoteCard}>
        {detailedContent.thirdPartyNote}
      </div>

      {/* humorMetrics セクション: 笑い指標テーブル（存在する場合のみ表示） */}
      {detailedContent.humorMetrics &&
        detailedContent.humorMetrics.length > 0 && (
          <div className={styles.humorMetricsSection}>
            <table className={styles.humorMetricsTable}>
              <tbody>
                {detailedContent.humorMetrics.map((metric, i) => (
                  <tr key={i}>
                    <td className={styles.humorMetricsLabel}>{metric.label}</td>
                    <td className={styles.humorMetricsValue}>{metric.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {/* afterThirdPartyNote スロット: CTA等のページ固有要素 */}
      {afterThirdPartyNote}

      <OtherTypesNav
        quizSlug={quizSlug}
        currentResultId={resultId}
        results={allResults}
        placement={headingLevel === 2 ? "resultPage" : "solvedScreen"}
      />
    </div>
  );
}

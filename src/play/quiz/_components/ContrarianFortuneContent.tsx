/**
 * ContrarianFortuneContent - contrarian-fortune variant の共通コンテンツコンポーネント。
 *
 * ResultCard.tsx（受検者向け）と page.tsx（第三者向け）の両方から使用される。
 * Server Component（"use client" なし）: 純粋なプレゼンテーションコンポーネント。
 *
 * 共通化対象:
 * - coreSentence / behaviors / persona / thirdPartyNote / humorMetrics（省略可） / 全タイプ一覧 の6セクション
 * - CSS変数 --type-color をインラインスタイルで注入（タイプごとに色が異なるため）
 * - ダークモード対応（color-mix() による明度調整。ImpossibleAdviceContent と同じパターン）
 *
 * 共通化しないもの（呼び出し側の責務）:
 * - catchphrase の表示（ResultCard/page.tsx でスタイル・配置が異なる）
 * - CTA（afterThirdPartyNote スロットとして注入）
 * - ShareButtons / もう一度挑戦するボタン
 */

import type React from "react";
import Link from "next/link";
import type { ContrarianFortuneDetailedContent } from "@/play/quiz/types";
import type { QuizResult } from "@/play/quiz/types";
import styles from "./ContrarianFortuneContent.module.css";

interface ContrarianFortuneContentProps {
  /** クイズのスラグ（全タイプ一覧のリンク生成に使用） */
  quizSlug: string;
  /** 結果ID（全タイプ一覧で現在のタイプをハイライトするため） */
  resultId: string;
  /** detailedContent（coreSentence, behaviors, persona, thirdPartyNote, humorMetrics を含む） */
  detailedContent: ContrarianFortuneDetailedContent;
  /** 全タイプの配列（タイプ一覧表示用） */
  allResults: QuizResult[];
  /** 見出しタグのレベル。page.tsxではh2（h1の次）、ResultCard内ではh3（h2の次） */
  headingLevel: 2 | 3;
  /** 全タイプ一覧のレイアウト。contrarian-fortune では "pill" 固定だが、一貫性のためpropsで受け取る */
  allTypesLayout: "pill";
  /** 結果タイプのテーマカラー（--type-color CSS変数に注入） */
  resultColor: string;
  /** thirdPartyNote後・全タイプ一覧前にページ固有要素（CTA等）を挿入するスロット */
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
    // wrapperクラスで --type-color をインラインスタイルで注入。
    // タイプごとに固有の色があるため、CSS変数ファイルではなくpropsから渡す。
    // ダークモード時のコントラスト調整はCSSファイル側で行う。
    <div
      className={styles.wrapper}
      style={{ "--type-color": resultColor } as React.CSSProperties}
    >
      {/* coreSentence セクション: 逆張りフレームの核心一文（色付きカード形式） */}
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

      {/* persona セクション: タイプの人物像 */}
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

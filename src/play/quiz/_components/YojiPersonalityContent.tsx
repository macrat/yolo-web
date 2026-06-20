/**
 * YojiPersonalityContent - yoji-personality variant の共通コンテンツコンポーネント。
 *
 * ResultCard.tsx（受検者向け）と page.tsx（第三者向け）の両方から使用される。
 * Server Component（"use client" なし）: 純粋なプレゼンテーションコンポーネント。
 *
 * 共通化対象:
 * - kanjiBreakdown / origin / behaviors / motto / 全タイプ一覧 の5セクション
 * - 全タイプ一覧の現在タイプハイライト
 *
 * 共通化しないもの（呼び出し側の責務）:
 * - catchphrase の表示（ResultCard/page.tsx でスタイル・配置が異なる）
 * - CTA（afterMotto スロットとして注入）
 * - ShareButtons / もう一度挑戦するボタン
 *
 * 新デザイン体系（DESIGN.md / ResultCard.module.css）への移行ポイント:
 * - 装飾としての --type-color 参照は撤去し、共通アクセント（--accent 系）に統一。
 * - 絵文字マーカー（CSS ::before "📖"）・絵文字アイコン（r.icon 描画）を撤去。
 * - 中央寄せ・font-weight 700・旧トークン・角丸ハードコードを廃止。
 * - public props signature は caller 互換のためすべて維持する。
 */

import type React from "react";
import Link from "next/link";
import type { YojiPersonalityDetailedContent } from "@/play/quiz/types";
import yojiPersonalityQuiz from "@/play/quiz/data/yoji-personality";
import styles from "./YojiPersonalityContent.module.css";

interface YojiPersonalityContentProps {
  /** detailedContent（kanjiBreakdown, origin, behaviors, motto を含む） */
  content: YojiPersonalityDetailedContent;
  /** 結果ID（全タイプ一覧で現在のタイプをハイライトするため） */
  resultId: string;
  /**
   * 結果タイプのテーマカラー（--type-color CSS変数に注入）。
   * 新デザインでは装飾には参照しないが、caller signature 互換のため受け取りは残す
   * （page.tsx / ResultCard の引数を壊さないための dead 注入）。
   */
  resultColor: string;
  /** 見出しタグのレベル。page.tsxではh2（h1の次）、ResultCard内ではh3（h2の次） */
  headingLevel: 2 | 3;
  /**
   * 全タイプ一覧のレイアウト。
   * "list": ResultCard内で使用する縦並びリスト形式。
   * "pill": 旧名の互換ラベル。新デザインでは pill 型をやめ、
   *   CharacterPersonalityContent と同じグリッド形式（2-3列）で表示する。
   *   public props signature を壊さないため呼び出し側はそのまま "pill" を渡してよい。
   */
  allTypesLayout: "list" | "pill";
  /** motto後・全タイプ一覧前にページ固有要素（CTA等）を挿入するスロット */
  afterMotto?: React.ReactNode;
}

export default function YojiPersonalityContent({
  content,
  resultId,
  resultColor,
  headingLevel,
  allTypesLayout,
  afterMotto,
}: YojiPersonalityContentProps) {
  const quiz = yojiPersonalityQuiz;
  // headingLevel に応じて h2 または h3 タグを動的に切り替える
  const Heading = `h${headingLevel}` as "h2" | "h3";

  // 新デザインでは旧 "pill"（派手色枠＋角丸999px＋font-weight 700）をやめ、
  // CharacterPersonalityContent と同じ allTypesGrid（2-3列）に統一する。
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

      {/* 全タイプ一覧セクション */}
      <div className={styles.allTypesSection}>
        <Heading className={styles.allTypesCta}>
          他の四字熟語も見てみよう
        </Heading>
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

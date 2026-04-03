/**
 * YojiPersonalityContent - yoji-personality variant の共通コンテンツコンポーネント。
 *
 * ResultCard.tsx（受検者向け）と page.tsx（第三者向け）の両方から使用される。
 * Server Component（"use client" なし）: 純粋なプレゼンテーションコンポーネント。
 *
 * 共通化対象:
 * - kanjiBreakdown / origin / behaviors / motto / 全タイプ一覧 の5セクション
 * - CSS変数 --type-color をインラインスタイルで注入（タイプごとに色が異なるため）
 * - ダークモード対応（color-mix() による明度調整。TraditionalColorContent と同じパターン）
 *
 * 共通化しないもの（呼び出し側の責務）:
 * - catchphrase の表示（ResultCard/page.tsx でスタイル・配置が異なる）
 * - CTA（afterMotto スロットとして注入）
 * - ShareButtons / もう一度挑戦するボタン
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
  /** 結果タイプのテーマカラー（--type-color CSS変数に注入） */
  resultColor: string;
  /** 見出しタグのレベル。page.tsxではh2（h1の次）、ResultCard内ではh3（h2の次） */
  headingLevel: 2 | 3;
  /** 全タイプ一覧のレイアウト。ResultCard内では "list"（縦並び）、結果ページでは "pill"（ピル型横wrap） */
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
      {/* kanjiBreakdown セクション: 漢字一字ずつの意味を紐解く知的コンテンツ */}
      <Heading className={styles.sectionHeading}>
        この四字熟語の成り立ち
      </Heading>
      <div className={styles.kanjiBreakdownCard}>{content.kanjiBreakdown}</div>

      {/* origin セクション: 歴史的背景・出典の解説 */}
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

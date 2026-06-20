import type React from "react";
import Link from "next/link";
import type { QuizResult } from "@/play/quiz/types";
import styles from "./OtherTypesNav.module.css";

/**
 * 「他のタイプも見てみよう」回遊ナビ（標準形式 detailedContent 診断用）。
 *
 * variant 診断（yoji-personality 等）は各 Content コンポーネントが同等の全タイプ
 * 回遊リンクを持つが、標準形式（word-sense-personality）には無かった（cycle-249 / B-516）。
 * 結果を見た来訪者が同一診断の他タイプ結果ページへ自然に回遊できるようにする。
 *
 * 受検者本人向けの `ResultCard`（client）と、第三者向けの静的結果ページ
 * `/play/[slug]/result/[resultId]`（server）の両方から使えるよう、フックを持たない
 * 純粋な presentational コンポーネントにしている。両 surface に同じ導線を出すことで
 * 「結果を見た人が他タイプへ回遊できる」体験を片方だけにせず揃える。
 *
 * 現在の自タイプはリンクにせず、ハイライト span（`aria-current="page"`）で示す。
 * これは「自分が今いる結果へのリンクは張らない」という素直なセマンティクスのため、
 * variant 実装（current も Link にして CSS で無効化）とは意図的に異なる。
 */
type OtherTypesNavResult = Pick<QuizResult, "id" | "title" | "icon" | "color">;

export default function OtherTypesNav({
  quizSlug,
  currentResultId,
  results,
  headingLevel = 3,
}: {
  quizSlug: string;
  currentResultId: string;
  results: readonly OtherTypesNavResult[];
  /** 見出しの階層。ResultCard は h3、静的結果ページ（h2 セクション内）は h2。 */
  headingLevel?: 2 | 3;
}): React.ReactNode {
  // 1タイプしか無い診断では回遊先が無いので描画しない。
  if (results.length < 2) {
    return null;
  }

  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <nav className={styles.section} aria-label="同じ診断の他のタイプ">
      <Heading className={styles.heading}>他のタイプも見てみよう</Heading>
      <ul className={styles.list}>
        {results.map((r) => {
          const isCurrent = r.id === currentResultId;
          // 新デザインでは絵文字アイコン（r.icon）を描画しない（DESIGN.md: 絵文字は使わない）。
          // 各タイプの区別はタイトル文言で行う。caller 互換のため OtherTypesNavResult 型からは
          // icon を削らず受け取りだけ残す（静的結果ページ・ResultCard の signature を壊さないため）。
          const label = <span>{r.title}</span>;
          return (
            <li
              key={r.id}
              className={isCurrent ? styles.itemCurrent : styles.item}
            >
              {isCurrent ? (
                // r.color（タイプ色）は新デザインでは装飾に使わないが、
                // 既存テストおよび caller 互換のため --type-color の CSS 変数注入は維持する
                // （CSS 側では参照しないため装飾としては無効。dead 注入だが互換目的で残す）。
                <span
                  aria-current="page"
                  style={
                    r.color
                      ? ({ "--type-color": r.color } as React.CSSProperties)
                      : undefined
                  }
                >
                  {label}
                </span>
              ) : (
                <Link href={`/play/${quizSlug}/result/${r.id}`}>{label}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

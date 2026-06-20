/**
 * AnimalPersonalityContent - animal-personality variant の共通コンテンツコンポーネント。
 *
 * ResultCard.tsx（受検者向けインライン結果）と
 * (legacy)/play/animal-personality/result/[resultId]/page.tsx（第三者向け静的結果ページ）の
 * 両方から使用される。Server Component（"use client" なし）: 純粋なプレゼンテーション。
 *
 * 共通化対象:
 * - strengths / weaknesses / behaviors / todayAction / 全タイプ一覧 の 5 セクション
 *
 * 共通化しないもの（呼び出し側の責務）:
 * - catchphrase の表示（ResultCard/page.tsx でスタイル・配置が異なる）
 * - 相性セクション / CTA（afterTodayAction スロットとして注入）
 * - ShareButtons / もう一度挑戦するボタン
 *
 * デザイン方針（cycle-254 で新デザイン体系に再設計）:
 * - 旧版は強み (✨ 緑ティント) / 弱み (😅 オレンジティント) / 行動 (💡) の 3 セクションを
 *   絵文字マーカーと色ティントで分けていたが、新デザインでは「色ではなく言葉で立てる」方針に
 *   従い、3 セクションともカード質感を統一する（差別化は見出しと本文で行う）。
 * - 全タイプ一覧の絵文字アイコン（r.icon）も描画しない。
 */

import type React from "react";
import Link from "next/link";
import type { AnimalPersonalityDetailedContent } from "@/play/quiz/types";
import animalPersonalityQuiz from "@/play/quiz/data/animal-personality";
import styles from "./AnimalPersonalityContent.module.css";

interface AnimalPersonalityContentProps {
  /** detailedContent（strengths, weaknesses, behaviors, todayAction を含む） */
  content: AnimalPersonalityDetailedContent;
  /** 結果ID（全タイプ一覧で現在のタイプをハイライトするため） */
  resultId: string;
  /** 見出しタグのレベル。page.tsxではh2（h1の次）、ResultCard内ではh3（h2の次） */
  headingLevel: 2 | 3;
  /** 全タイプ一覧のレイアウト。ResultCard内では "list"（縦並び）、結果ページでは "pill"（ピル型横wrap） */
  allTypesLayout: "list" | "pill";
  /** 相性セクション・CTA等のページ固有要素を挿入するためのスロット（todayActionと全タイプ一覧の間に表示） */
  afterTodayAction?: React.ReactNode;
}

export default function AnimalPersonalityContent({
  content,
  resultId,
  headingLevel,
  allTypesLayout,
  afterTodayAction,
}: AnimalPersonalityContentProps) {
  const quiz = animalPersonalityQuiz;
  // headingLevel に応じて h2 または h3 タグを動的に切り替える
  const Heading = `h${headingLevel}` as "h2" | "h3";

  // public props の "pill" は caller 互換のため受け取り続けるが、
  // 新デザイン言語ではピル型は廃止し、Character/Music/Yoji 等と質感をそろえるため
  // 内部で grid（2列、480px以上で3列）にマップする。クラス名は参照実装と完全に揃える。
  const allTypesListClass =
    allTypesLayout === "pill"
      ? styles.allTypesGrid
      : styles.allTypesListVertical;

  return (
    // 新デザインではタイプごとのアクセント色（旧 --animal-accent-color）を撤廃し、
    // wrapper は左寄せ宣言のみ持つ。装飾は共通 --accent / --accent-soft / --accent-strong に統一。
    <div className={styles.wrapper}>
      {/* strengths セクション: 旧版は ✨ 絵文字＋緑ティントだったが、
          新デザインでは他リストと同じ「アクセント縦線マーカー＋枠線カード」に統一する。 */}
      <Heading className={styles.sectionHeading}>このタイプの強み</Heading>
      <ul className={styles.itemList}>
        {content.strengths.map((s, i) => (
          <li key={i} className={styles.item}>
            {s}
          </li>
        ))}
      </ul>

      {/* weaknesses セクション: 旧版は 😅 絵文字＋クリームティントだったが、
          新デザインでは他リストと同質感に統一する。 */}
      <Heading className={styles.sectionHeading}>このタイプの弱み</Heading>
      <ul className={styles.itemList}>
        {content.weaknesses.map((w, i) => (
          <li key={i} className={styles.item}>
            {w}
          </li>
        ))}
      </ul>

      {/* behaviors セクション: 旧版は 💡 絵文字だったが、絵文字は撤去。 */}
      <Heading className={styles.sectionHeading}>
        この動物に似た行動パターン
      </Heading>
      <ul className={styles.itemList}>
        {content.behaviors.map((b, i) => (
          <li key={i} className={styles.item}>
            {b}
          </li>
        ))}
      </ul>

      {/* todayAction セクション: ResultCard adviceCard 相当の淡いアクセント面で
          「呼びかけ」のトーンを静かに強調する（中央寄せはしない）。 */}
      <Heading className={styles.sectionHeading}>今日試してほしいこと</Heading>
      <div className={styles.todayActionCard}>{content.todayAction}</div>

      {/* afterTodayAction スロット: 相性セクション・CTA等のページ固有要素 */}
      {afterTodayAction}

      {/* 全タイプ一覧セクション */}
      <div className={styles.allTypesSection}>
        <Heading className={styles.allTypesCta}>他の動物も見てみよう</Heading>
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
                {/* 新デザインでは絵文字アイコン（r.icon: 🐵🦊🐿️ 等）を描画しない
                    （DESIGN.md: 絵文字を使わない）。各タイプの区別はタイトル文言で行う。 */}
                <span>{r.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

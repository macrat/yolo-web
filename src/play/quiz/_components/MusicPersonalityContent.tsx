/**
 * MusicPersonalityContent - music-personality variant の共通コンテンツコンポーネント。
 *
 * ResultCard.tsx（解き終えた画面）と
 * app/play/music-personality/result/[resultId]/page.tsx（結果のページ）の
 * 両方から使用される。ResultCard.tsx からは next/dynamic で遅延ロードされるため、
 * クライアントバンドルへの music-personality データの混入を防ぐ。
 *
 * 共通化対象:
 * - strengths / weaknesses / behaviors / todayAction / すべてのタイプ（OtherTypesNav） の 5 セクション
 * - referrerTypeId による相性セクション / 招待ボタン（ResultCard 向け）
 *
 * 共通化しないもの（呼び出し側の責務）:
 * - catchphrase の表示（ResultCard/page.tsx でスタイル・配置が異なる）
 * - ShareButtons / もう一度挑戦するボタン
 *
 * 強み・弱み・行動の3セクションは色で分けず、同じ質感で組んで見出しと本文で見分けさせる（DESIGN.md §1）。
 */

"use client";

import type React from "react";
import type { MusicPersonalityDetailedContent } from "@/play/quiz/types";
import musicPersonalityQuiz, {
  getCompatibility as getMusicCompatibility,
  isValidMusicTypeId,
} from "@/play/quiz/data/music-personality";
import CompatibilitySection from "./CompatibilitySection";
import InviteFriendButton from "./InviteFriendButton";
import OtherTypesNav, {
  type ResultPlacement,
  SECTION_HEADING,
} from "./OtherTypesNav";
import styles from "./MusicPersonalityContent.module.css";

interface MusicPersonalityContentProps {
  /** detailedContent（strengths, weaknesses, behaviors, todayAction を含む） */
  content: MusicPersonalityDetailedContent;
  /** 結果ID（すべてのタイプで現在のタイプをハイライトするため） */
  resultId: string;
  /** 置く面。page.tsx は結果のページ、ResultCard は解き終えた画面。見出しの階層と、すべてのタイプでのいまのタイプの示し方が決まる。 */
  placement: ResultPlacement;
  /**
   * 相性診断用の referrer タイプID。
   * ResultCard から渡される場合、内部で相性セクション・招待ボタンを生成する。
   * page.tsx（結果ページ）から使用する場合は afterTodayAction スロットを使用する。
   */
  referrerTypeId?: string;
  /** 相性セクション・CTA等のページ固有要素を挿入するためのスロット（todayActionとすべてのタイプの間に表示） */
  afterTodayAction?: React.ReactNode;
}

/**
 * ResultCard（"use client"）から呼ばれる場合に相性セクション・招待ボタンを生成する。
 * afterTodayAction が外部から渡された場合はそちらを優先する。
 */
function buildAfterTodayAction(
  resultId: string,
  referrerTypeId?: string,
): React.ReactNode {
  const quiz = musicPersonalityQuiz;

  // 相性セクション: referrerTypeIdが有効な場合は相性表示、なければ招待ボタン
  if (referrerTypeId && isValidMusicTypeId(referrerTypeId)) {
    const myResult = quiz.results.find((r) => r.id === resultId);
    const friendResult = quiz.results.find((r) => r.id === referrerTypeId);
    const compatibility = getMusicCompatibility(resultId, referrerTypeId);

    if (myResult && friendResult && compatibility) {
      return (
        <>
          <CompatibilitySection
            myType={{
              id: myResult.id,
              title: myResult.title,
              icon: myResult.icon,
            }}
            friendType={{
              id: friendResult.id,
              title: friendResult.title,
              icon: friendResult.icon,
            }}
            compatibility={compatibility}
            quizTitle={quiz.meta.title}
            quizSlug={quiz.meta.slug}
          />
          <InviteFriendButton
            quizSlug={quiz.meta.slug}
            resultTypeId={resultId}
            inviteText="音楽性格診断で相性を調べよう!"
          />
        </>
      );
    }
  }

  return (
    <InviteFriendButton
      quizSlug={quiz.meta.slug}
      resultTypeId={resultId}
      inviteText="音楽性格診断で相性を調べよう!"
    />
  );
}

export default function MusicPersonalityContent({
  content,
  resultId,
  placement,
  referrerTypeId,
  afterTodayAction,
}: MusicPersonalityContentProps) {
  const quiz = musicPersonalityQuiz;
  const Heading = SECTION_HEADING[placement];

  // afterTodayAction が外部から渡された場合はそちらを優先。
  // 渡されない場合（ResultCard からの呼び出し）は referrerTypeId を使って内部で生成する。
  const resolvedAfterTodayAction =
    afterTodayAction !== undefined
      ? afterTodayAction
      : buildAfterTodayAction(resultId, referrerTypeId);

  return (
    <div className={styles.wrapper}>
      {/* strengths セクション */}
      <Heading className={styles.sectionHeading}>
        このタイプの音楽的な強み
      </Heading>
      <ul className={styles.itemList}>
        {content.strengths.map((s, i) => (
          <li key={i} className={styles.item}>
            {s}
          </li>
        ))}
      </ul>

      {/* weaknesses セクション */}
      <Heading className={styles.sectionHeading}>
        このタイプの音楽的な弱み
      </Heading>
      <ul className={styles.itemList}>
        {content.weaknesses.map((w, i) => (
          <li key={i} className={styles.item}>
            {w}
          </li>
        ))}
      </ul>

      {/* behaviors セクション */}
      <Heading className={styles.sectionHeading}>
        このタイプの音楽あるある
      </Heading>
      <ul className={styles.itemList}>
        {content.behaviors.map((b, i) => (
          <li key={i} className={styles.item}>
            {b}
          </li>
        ))}
      </ul>

      {/* todayAction セクション: 呼びかけなので、リストと分けて --paper-2 の地に置く */}
      <Heading className={styles.sectionHeading}>
        今日の音楽ライフのヒント
      </Heading>
      <div className={styles.todayActionCard}>{content.todayAction}</div>

      {/* afterTodayAction スロット: 相性セクション・CTA等のページ固有要素 */}
      {resolvedAfterTodayAction}

      <OtherTypesNav
        quizSlug={quiz.meta.slug}
        currentResultId={resultId}
        results={quiz.results}
        placement={placement}
      />
    </div>
  );
}

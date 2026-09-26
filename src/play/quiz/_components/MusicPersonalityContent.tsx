/**
 * MusicPersonalityContent - music-personality variant の共通コンテンツコンポーネント。
 *
 * ResultCard.tsx（受検者向けインライン結果）と
 * app/play/music-personality/result/[resultId]/page.tsx（第三者向け静的結果ページ）の
 * 両方から使用される。ResultCard.tsx からは next/dynamic で遅延ロードされるため、
 * クライアントバンドルへの music-personality データの混入を防ぐ。
 *
 * 共通化対象:
 * - strengths / weaknesses / behaviors / todayAction / 他のタイプ（OtherTypesNav） の 5 セクション
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
import OtherTypesNav from "./OtherTypesNav";
import styles from "./MusicPersonalityContent.module.css";

interface MusicPersonalityContentProps {
  /** detailedContent（strengths, weaknesses, behaviors, todayAction を含む） */
  content: MusicPersonalityDetailedContent;
  /** 結果ID（他のタイプで現在のタイプをハイライトするため） */
  resultId: string;
  /** 見出しタグのレベル。page.tsxではh2（h1の次）、ResultCard内ではh3（h2の次） */
  headingLevel: 2 | 3;
  /**
   * 相性診断用の referrer タイプID。
   * ResultCard から渡される場合、内部で相性セクション・招待ボタンを生成する。
   * page.tsx（結果ページ）から使用する場合は afterTodayAction スロットを使用する。
   */
  referrerTypeId?: string;
  /** 相性セクション・CTA等のページ固有要素を挿入するためのスロット（todayActionと他のタイプの間に表示） */
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
  headingLevel,
  referrerTypeId,
  afterTodayAction,
}: MusicPersonalityContentProps) {
  const quiz = musicPersonalityQuiz;
  // headingLevel に応じて h2 または h3 タグを動的に切り替える
  const Heading = `h${headingLevel}` as "h2" | "h3";

  // afterTodayAction が外部から渡された場合はそちらを優先。
  // 渡されない場合（ResultCard からの呼び出し）は referrerTypeId を使って内部で生成する。
  const resolvedAfterTodayAction =
    afterTodayAction !== undefined
      ? afterTodayAction
      : buildAfterTodayAction(resultId, referrerTypeId);

  return (
    // 新デザインではタイプごとのアクセント色（旧 --music-accent-color / --music-accent-bg）を撤廃し、
    // wrapper は左寄せ宣言のみ持つ。装飾は共通 --accent / --accent-soft / --accent-strong に統一。
    <div className={styles.wrapper}>
      {/* strengths セクション: 旧版は 🎵 絵文字＋紫ティントだったが、
          新デザインでは他リストと同じ「アクセント縦線マーカー＋枠線カード」に統一する。 */}
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

      {/* weaknesses セクション: 旧版は 🎧 絵文字＋クリームティントだったが、
          新デザインでは他リストと同質感に統一する。 */}
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

      {/* behaviors セクション: 旧版は 🎤 絵文字だったが、絵文字は撤去。 */}
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

      {/* todayAction セクション: ResultCard adviceCard 相当の淡いアクセント面で
          「呼びかけ」のトーンを静かに強調する（中央寄せ・font-weight 500 は捨てる）。 */}
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
        headingLevel={headingLevel}
      />
    </div>
  );
}

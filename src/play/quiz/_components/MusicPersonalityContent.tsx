/**
 * MusicPersonalityContent - music-personality variant の共通コンテンツコンポーネント。
 *
 * ResultCard.tsx（受検者向け）と page.tsx（第三者向け）の両方から使用される。
 * ResultCard.tsx からは next/dynamic で遅延ロードされるため、クライアントバンドルへの
 * music-personality データの混入を防ぐ。
 *
 * 共通化対象:
 * - strengths / weaknesses / behaviors / todayAction / 全タイプ一覧 の5セクション
 * - CSS変数によるダークモード対応（--music-accent-color, --music-accent-bg）
 * - referrerTypeId による相性セクション / 招待ボタン（ResultCard向け）
 *
 * 共通化しないもの（呼び出し側の責務）:
 * - catchphrase の表示（ResultCard/page.tsx でスタイル・配置が異なる）
 * - ShareButtons / もう一度挑戦するボタン
 */

"use client";

import type React from "react";
import Link from "next/link";
import type { MusicPersonalityDetailedContent } from "@/play/quiz/types";
import musicPersonalityQuiz, {
  getCompatibility as getMusicCompatibility,
  isValidMusicTypeId,
} from "@/play/quiz/data/music-personality";
import CompatibilitySection from "./CompatibilitySection";
import InviteFriendButton from "./InviteFriendButton";
import styles from "./MusicPersonalityContent.module.css";

interface MusicPersonalityContentProps {
  /** detailedContent（strengths, weaknesses, behaviors, todayAction を含む） */
  content: MusicPersonalityDetailedContent;
  /** 結果ID（全タイプ一覧で現在のタイプをハイライトするため） */
  resultId: string;
  /** 見出しタグのレベル。page.tsxではh2（h1の次）、ResultCard内ではh3（h2の次） */
  headingLevel: 2 | 3;
  /** 全タイプ一覧のレイアウト。ResultCard内では "list"（縦並び）、結果ページでは "pill"（ピル型横wrap） */
  allTypesLayout: "list" | "pill";
  /**
   * 相性診断用の referrer タイプID。
   * ResultCard から渡される場合、内部で相性セクション・招待ボタンを生成する。
   * page.tsx（結果ページ）から使用する場合は afterTodayAction スロットを使用する。
   */
  referrerTypeId?: string;
  /** 相性セクション・CTA等のページ固有要素を挿入するためのスロット（todayActionと全タイプ一覧の間に表示） */
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
  allTypesLayout,
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

  const allTypesListClass =
    allTypesLayout === "pill"
      ? styles.allTypesListPill
      : styles.allTypesListVertical;

  return (
    // wrapperクラスで --music-accent-color / --music-accent-bg を定義。
    // ライトモード: #7c3aed（WCAG準拠）、ダークモード: #a78bfa（WCAG AA準拠）。
    // CSS変数はCSSファイル側で管理し、inline styleは使用しない。
    <div className={styles.wrapper}>
      {/* strengths セクション */}
      <Heading className={styles.sectionHeading}>
        🎵 このタイプの音楽的な強み
      </Heading>
      <ul className={styles.strengthsList}>
        {content.strengths.map((s, i) => (
          <li key={i} className={styles.strengthsItem}>
            {s}
          </li>
        ))}
      </ul>

      {/* weaknesses セクション */}
      <Heading className={styles.sectionHeading}>
        🎧 このタイプの音楽的な弱み
      </Heading>
      <ul className={styles.weaknessesList}>
        {content.weaknesses.map((w, i) => (
          <li key={i} className={styles.weaknessesItem}>
            {w}
          </li>
        ))}
      </ul>

      {/* behaviors セクション */}
      <Heading className={styles.sectionHeading}>
        🎤 このタイプの音楽あるある
      </Heading>
      <ul className={styles.behaviorsList}>
        {content.behaviors.map((b, i) => (
          <li key={i} className={styles.behaviorsItem}>
            {b}
          </li>
        ))}
      </ul>

      {/* todayAction セクション */}
      <Heading className={styles.sectionHeading}>
        🎶 今日の音楽ライフのヒント
      </Heading>
      <div className={styles.todayActionCard}>{content.todayAction}</div>

      {/* afterTodayAction スロット: 相性セクション・CTA等のページ固有要素 */}
      {resolvedAfterTodayAction}

      {/* 全タイプ一覧セクション */}
      <div className={styles.allTypesSection}>
        <Heading className={styles.allTypesCta}>
          🎹 他のタイプも見てみよう
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
              <Link href={`/play/${quiz.meta.slug}/result/${r.id}`}>
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

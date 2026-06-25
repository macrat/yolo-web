/**
 * MusicPersonalityContent - music-personality variant の共通コンテンツコンポーネント。
 *
 * ResultCard.tsx（受検者向けインライン結果）と
 * (new)/play/music-personality/result/[resultId]/page.tsx（第三者向け静的結果ページ）の
 * 両方から使用される。ResultCard.tsx からは next/dynamic で遅延ロードされるため、
 * クライアントバンドルへの music-personality データの混入を防ぐ。
 *
 * 共通化対象:
 * - strengths / weaknesses / behaviors / todayAction / 全タイプ一覧 の 5 セクション
 * - referrerTypeId による相性セクション / 招待ボタン（ResultCard 向け）
 *
 * 共通化しないもの（呼び出し側の責務）:
 * - catchphrase の表示（ResultCard/page.tsx でスタイル・配置が異なる）
 * - ShareButtons / もう一度挑戦するボタン
 *
 * デザイン方針（cycle-254 で新デザイン体系に再設計）:
 * - 旧版は strengths (🎵 紫ティント) / weaknesses (😅 クリームティント) / behaviors (🎤) /
 *   todayAction (中央寄せ＋紫ティント) を絵文字マーカーと色ティントで分けていたが、
 *   新デザインでは「色ではなく言葉で立てる」方針に従い、3 セクションのカード質感を統一する
 *   （差別化は見出しと本文で行う）。
 * - 見出しから絵文字（🎵🎧🎤🎶🎹）を撤去。全タイプ一覧の絵文字アイコン（r.icon）も描画しない。
 * - 全タイプ一覧の旧 "pill"（横wrap 999px 角丸）は新デザイン言語に含まれないため、
 *   public props 互換のため "pill" は受け取り続けつつ、内部実装は CharacterPersonalityContent と
 *   同じ allTypesGrid（2-3 列グリッド）にマップする。8 クイズ間で質感を揃えるための判断。
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
  /**
   * 全タイプ一覧のレイアウト。
   * - "list": ResultCard 内で使う縦並びリスト
   * - "pill": page.tsx 側 caller が指定する従来名。新デザインでは pill 型は廃止し、
   *   内部で CharacterPersonalityContent と同じ 2-3 列グリッドにマップする。public props の
   *   signature は caller 互換のため "pill" のまま維持する。
   */
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

  // 旧 "pill" 型横wrap UI は新デザイン言語に含まれないため、内部で allTypesGrid にマップする。
  // public props 互換のため "pill" の受け取り自体は残している（caller を壊さない）。
  const allTypesListClass =
    allTypesLayout === "pill"
      ? styles.allTypesGrid
      : styles.allTypesListVertical;

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

      {/* 全タイプ一覧セクション */}
      <div className={styles.allTypesSection}>
        <Heading className={styles.allTypesCta}>他のタイプも見てみよう</Heading>
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
                {/* 新デザインでは絵文字アイコン（r.icon: 🎪📢 等）を描画しない
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

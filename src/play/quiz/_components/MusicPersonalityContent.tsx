/**
 * 音楽性格診断のタイプを詳しく説明する読みもの。解き終えた画面（ResultCard）と結果のページの両方に置く。
 *
 * 音楽的な強み・弱み・音楽あるある・今日の音楽ライフのヒントを並べる。解き終えた画面では、読みものの最後の
 * 相性と招待もここで組む（buildAfterTodayAction）。結果のページは afterTodayAction で、?with= の相性と診断への
 * 誘いを差し込む。キャッチコピー・共有・すべてのタイプ・「もう一度挑戦する」は呼び出し側が置く。
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
import {
  Reading,
  ReadingHeading,
  ReadingList,
  ReadingText,
} from "./ResultReading";

interface MusicPersonalityContentProps {
  content: MusicPersonalityDetailedContent;
  /** 来訪者のタイプ。友達との相性と招待に使う。 */
  resultId: string;
  /** 相性を見る友達のタイプの id（共有のリンクの ref）。解き終えた画面で使う。 */
  referrerTypeId?: string;
  /**
   * 今日の音楽ライフのヒントのあと、読みものの最後に置くもの（結果のページの ?with= の相性と診断への誘い）。
   * 渡したときは、解き終えた画面の相性と招待（buildAfterTodayAction）を組まず、これだけを置く。
   */
  afterTodayAction?: React.ReactNode;
}

/**
 * 音楽性格診断の、解き終えた画面の相性と招待。友達の結果の共有のリンクから来て、そのタイプとの相性が
 * 引けたときは相性を出し、招待のボタンを続ける。そうでなければ招待のボタンだけを出す。
 */
function buildAfterTodayAction(
  resultId: string,
  referrerTypeId?: string,
): React.ReactNode {
  const quiz = musicPersonalityQuiz;

  if (referrerTypeId && isValidMusicTypeId(referrerTypeId)) {
    const myResult = quiz.results.find((r) => r.id === resultId);
    const friendResult = quiz.results.find((r) => r.id === referrerTypeId);
    const compatibility = getMusicCompatibility(resultId, referrerTypeId);

    if (myResult && friendResult && compatibility) {
      return (
        <>
          <CompatibilitySection
            placement="solvedScreen"
            myType={{
              id: myResult.id,
              title: myResult.title,
            }}
            friendType={{
              id: friendResult.id,
              title: friendResult.title,
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
  referrerTypeId,
  afterTodayAction,
}: MusicPersonalityContentProps) {
  const resolvedAfterTodayAction =
    afterTodayAction !== undefined
      ? afterTodayAction
      : buildAfterTodayAction(resultId, referrerTypeId);

  return (
    <Reading>
      <ReadingHeading phrases={["この", "タイプの", "音楽的な", "強み"]} />
      <ReadingList items={content.strengths} />

      <ReadingHeading phrases={["この", "タイプの", "音楽的な", "弱み"]} />
      <ReadingList items={content.weaknesses} />

      <ReadingHeading phrases={["この", "タイプの", "音楽", "あるある"]} />
      <ReadingList items={content.behaviors} />

      <ReadingHeading phrases={["今日の", "音楽ライフの", "ヒント"]} />
      <ReadingText>{content.todayAction}</ReadingText>

      {resolvedAfterTodayAction}
    </Reading>
  );
}

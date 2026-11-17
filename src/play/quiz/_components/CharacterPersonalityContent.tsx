/**
 * あなたに似たキャラ診断のタイプを詳しく説明する読みもの。解き終えた画面（ResultCard）と結果のページの両方に置く。
 *
 * 成り立ち・日常・キャラからのメッセージを並べる。解き終えた画面では、読みものの最後の相性と招待もここで組む
 * （CompatibilityArea）。結果のページは afterCharacterMessage で、?with= の相性と招待と診断への誘いを差し込む。
 * キャッチコピー・共有・すべてのタイプ・「もう一度挑戦する」は呼び出し側が置く。
 */

"use client";

import type React from "react";
import { useState, useEffect } from "react";
import type { CharacterPersonalityDetailedContent } from "@/play/quiz/types";
import type { CompatibilityEntry } from "@/play/quiz/types";
import CompatibilitySection from "./CompatibilitySection";
import InviteFriendButton from "./InviteFriendButton";
import {
  Reading,
  ReadingHeading,
  ReadingList,
  ReadingText,
} from "./ResultReading";

const QUIZ_SLUG = "character-personality";
const QUIZ_TITLE = "あなたに似たキャラ診断";
const INVITE_TEXT = "似たキャラ診断で相性を調べよう!";

interface CompatibilityApiResponse {
  label: string;
  description: string;
  myType: { title: string };
  friendType: { title: string };
}

interface CharacterPersonalityContentProps {
  content: CharacterPersonalityDetailedContent;
  /** 来訪者のタイプ。友達との相性と招待に使う。 */
  resultId: string;
  /** 相性を見る友達のタイプの id（共有のリンクの ref）。解き終えた画面で使う。 */
  referrerTypeId?: string;
  /**
   * キャラからのメッセージのあと、読みものの最後に置くもの（結果のページの ?with= の相性・招待・診断への誘い）。
   * 渡したときは、解き終えた画面の相性と招待（CompatibilityArea）を組まず、これだけを置く。
   */
  afterCharacterMessage?: React.ReactNode;
}

/**
 * あなたに似たキャラ診断の、解き終えた画面の相性と招待。友達の結果の共有のリンクから来て、そのタイプとの相性が
 * 引けたときは相性を出し、招待のボタンを続ける。そうでなければ招待のボタンだけを出す。
 * 相性は /api/quiz/compatibility から読み込み、読み込むあいだは読み込んでいることを文で言う。
 */
function CompatibilityArea({
  resultId,
  referrerTypeId,
}: {
  resultId: string;
  referrerTypeId?: string;
}) {
  const [compatibilityData, setCompatibilityData] =
    useState<CompatibilityApiResponse | null>(null);
  const [loading, setLoading] = useState(!!referrerTypeId);
  const [fetchFailed, setFetchFailed] = useState(false);

  useEffect(() => {
    // referrerTypeId がない場合はフェッチしない
    if (!referrerTypeId) return;

    let cancelled = false;

    const url = `/api/quiz/compatibility?slug=${QUIZ_SLUG}&typeA=${encodeURIComponent(resultId)}&typeB=${encodeURIComponent(referrerTypeId)}`;

    fetch(url)
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          setFetchFailed(true);
          return;
        }
        const data: CompatibilityApiResponse = await res.json();
        setCompatibilityData(data);
      })
      .catch(() => {
        if (!cancelled) setFetchFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resultId, referrerTypeId]);

  if (!referrerTypeId) {
    return (
      <InviteFriendButton
        quizSlug={QUIZ_SLUG}
        resultTypeId={resultId}
        inviteText={INVITE_TEXT}
      />
    );
  }

  if (loading) {
    return <ReadingText>友達との相性を読み込んでいます</ReadingText>;
  }

  if (fetchFailed || !compatibilityData) {
    return (
      <InviteFriendButton
        quizSlug={QUIZ_SLUG}
        resultTypeId={resultId}
        inviteText={INVITE_TEXT}
      />
    );
  }

  const compatibility: CompatibilityEntry = {
    label: compatibilityData.label,
    description: compatibilityData.description,
  };

  return (
    <>
      <CompatibilitySection
        placement="solvedScreen"
        myType={{
          id: resultId,
          title: compatibilityData.myType.title,
        }}
        friendType={{
          id: referrerTypeId,
          title: compatibilityData.friendType.title,
        }}
        compatibility={compatibility}
        quizTitle={QUIZ_TITLE}
        quizSlug={QUIZ_SLUG}
      />
      <InviteFriendButton
        quizSlug={QUIZ_SLUG}
        resultTypeId={resultId}
        inviteText={INVITE_TEXT}
      />
    </>
  );
}

export default function CharacterPersonalityContent({
  content,
  resultId,
  referrerTypeId,
  afterCharacterMessage,
}: CharacterPersonalityContentProps) {
  const resolvedAfterCharacterMessage =
    afterCharacterMessage !== undefined ? (
      afterCharacterMessage
    ) : (
      <CompatibilityArea resultId={resultId} referrerTypeId={referrerTypeId} />
    );

  return (
    <Reading>
      <ReadingHeading phrases={["この", "キャラの", "成り立ち"]} />
      <ReadingText>{content.archetypeBreakdown}</ReadingText>

      <ReadingHeading phrases={["この", "キャラの", "日常"]} />
      <ReadingList items={content.behaviors} />

      <ReadingHeading phrases={["キャラからの", "メッセージ"]} />
      <ReadingText>{content.characterMessage}</ReadingText>

      {resolvedAfterCharacterMessage}
    </Reading>
  );
}

/**
 * あなたに似たキャラ診断のタイプを詳しく説明する読みもの。解き終えた画面（ResultCard）と結果のページの両方に置く。
 *
 * 成り立ち・日常・キャラからのメッセージを並べる。解き終えた画面では、友達の結果から来たときの相性と招待も
 * ここで出す。結果のページは afterCharacterMessage で自分の相性と招待を差し込む。キャッチコピー・共有・
 * すべてのタイプ・「もう一度挑戦する」は呼び出し側が置く。
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
  /** 友達のタイプ。解き終えた画面で、友達の結果から来たときに相性を出す。 */
  referrerTypeId?: string;
  /**
   * キャラからのメッセージのあと、読みものの最後に置くもの（結果のページの相性・招待）。渡したときは、
   * referrerTypeId から相性を読み込まない。
   */
  afterCharacterMessage?: React.ReactNode;
}

/**
 * 解き終えた画面の相性と招待。友達のタイプがあれば相性を読み込んで出し、読み込めなければ招待だけを出す。
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

  // referrerTypeId がない場合は招待ボタンのみ
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

  // フェッチ失敗またはデータなしの場合は招待ボタンのみ
  if (fetchFailed || !compatibilityData) {
    return (
      <InviteFriendButton
        quizSlug={QUIZ_SLUG}
        resultTypeId={resultId}
        inviteText={INVITE_TEXT}
      />
    );
  }

  // フェッチ成功: 相性セクションと招待ボタンを表示
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

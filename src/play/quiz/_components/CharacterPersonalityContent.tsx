/**
 * あなたに似たキャラ診断のタイプを詳しく説明する読みもの。解き終えた画面（ResultCard）と結果のページの両方に置く。
 *
 * 成り立ち・日常・キャラからのメッセージ・すべてのタイプを並べる。解き終えた画面では、友達の結果から来たときの
 * 相性と招待もここで出す。結果のページは afterCharacterMessage で自分の相性と招待を差し込む。キャッチコピー・
 * 共有・「もう一度挑戦する」は呼び出し側が置く。
 */

"use client";

import type React from "react";
import { useState, useEffect } from "react";
import type { CharacterPersonalityDetailedContent } from "@/play/quiz/types";
import type { CompatibilityEntry } from "@/play/quiz/types";
import characterPersonalityQuiz, {
  CHARACTER_PERSONALITY_TYPE_IDS,
} from "@/play/quiz/data/character-personality";
import CompatibilitySection from "./CompatibilitySection";
import InviteFriendButton from "./InviteFriendButton";
import OtherTypesNav, { type ResultPlacement } from "./OtherTypesNav";
import {
  Reading,
  ReadingHeading,
  ReadingList,
  ReadingText,
} from "./ResultReading";

const QUIZ_SLUG = "character-personality";
const QUIZ_TITLE = "あなたに似たキャラ診断";
const INVITE_TEXT = "似たキャラ診断で相性を調べよう!";

/** 全タイプを、タイプの id の定義の順に並べる。 */
const allTypes = CHARACTER_PERSONALITY_TYPE_IDS.flatMap((typeId) => {
  const result = characterPersonalityQuiz.results.find((r) => r.id === typeId);
  return result ? [result] : [];
});

interface CompatibilityApiResponse {
  label: string;
  description: string;
  myType: { title: string; icon?: string };
  friendType: { title: string; icon?: string };
}

interface CharacterPersonalityContentProps {
  content: CharacterPersonalityDetailedContent;
  /** 来訪者のタイプ。すべてのタイプでこのタイプを示す。 */
  resultId: string;
  /** 置く面。見出しの段と、すべてのタイプでのいまのタイプの示し方が決まる。 */
  placement: ResultPlacement;
  /** 友達のタイプ。解き終えた画面で、友達の結果から来たときに相性を出す。 */
  referrerTypeId?: string;
  /**
   * キャラからのメッセージのあと、すべてのタイプの前に置くもの（結果のページの相性・招待）。渡したときは、
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
          icon: compatibilityData.myType.icon,
        }}
        friendType={{
          id: referrerTypeId,
          title: compatibilityData.friendType.title,
          icon: compatibilityData.friendType.icon,
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
  placement,
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
      <ReadingHeading
        placement={placement}
        phrases={["この", "キャラの", "成り立ち"]}
      />
      <ReadingText>{content.archetypeBreakdown}</ReadingText>

      <ReadingHeading
        placement={placement}
        phrases={["この", "キャラの", "日常"]}
      />
      <ReadingList items={content.behaviors} />

      <ReadingHeading
        placement={placement}
        phrases={["キャラからの", "メッセージ"]}
      />
      <ReadingText>{content.characterMessage}</ReadingText>

      {resolvedAfterCharacterMessage}

      <OtherTypesNav
        quizSlug={QUIZ_SLUG}
        currentResultId={resultId}
        results={allTypes}
        placement={placement}
      />
    </Reading>
  );
}

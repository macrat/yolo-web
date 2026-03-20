"use client";

import { useState, useEffect } from "react";
import type { CompatibilityEntry } from "@/play/quiz/types";
import CompatibilitySection from "./CompatibilitySection";
import InviteFriendButton from "./InviteFriendButton";

const QUIZ_SLUG = "character-personality";
const QUIZ_TITLE = "あなたに似たキャラ診断";
const INVITE_TEXT = "似たキャラ診断で相性を調べよう!";

interface TypeInfo {
  title: string;
  icon?: string;
}

interface CompatibilityApiResponse {
  label: string;
  description: string;
  myType: TypeInfo;
  friendType: TypeInfo;
}

interface CharacterPersonalityResultExtraProps {
  resultId: string;
  referrerTypeId?: string;
}

/**
 * Returns a render function for extra content below the character personality
 * quiz result card. Used by QuizContainer's renderResultExtra prop.
 *
 * Unlike MusicPersonalityResultExtra, all data (compatibility, type info) is
 * fetched from the API to avoid importing character-personality.ts on the client.
 */
export function renderCharacterPersonalityExtra(
  referrerTypeId?: string,
): (resultId: string) => React.ReactNode {
  function ResultExtraRenderer(resultId: string): React.ReactNode {
    return (
      <CharacterPersonalityResultExtra
        resultId={resultId}
        referrerTypeId={referrerTypeId}
      />
    );
  }
  return ResultExtraRenderer;
}

function CharacterPersonalityResultExtra({
  resultId,
  referrerTypeId,
}: CharacterPersonalityResultExtraProps) {
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
          // 400 は invalid referrerTypeId。その他のエラーも同様にフォールバック
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

  // referrerTypeId がない場合は招待ボタンのみ表示
  if (!referrerTypeId) {
    return (
      <InviteFriendButton
        quizSlug={QUIZ_SLUG}
        resultTypeId={resultId}
        inviteText={INVITE_TEXT}
      />
    );
  }

  // フェッチ中はローディング表示（APIレスポンスは約300Bと小さいため短時間）
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "1rem", opacity: 0.6 }}>
        相性データを読み込み中...
      </div>
    );
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

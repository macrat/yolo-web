"use client";

import {
  getCompatibility,
  isValidCultureTypeId,
} from "@/quiz/data/japanese-culture";
import japaneseCultureQuiz from "@/quiz/data/japanese-culture";
import CompatibilitySection from "./CompatibilitySection";
import InviteFriendButton from "./InviteFriendButton";

interface JapaneseCultureResultExtraProps {
  resultId: string;
  referrerTypeId?: string;
}

/**
 * Returns a render function for extra content below the Japanese culture
 * quiz result card. Used by QuizContainer's renderResultExtra prop.
 */
export function renderJapaneseCultureExtra(
  referrerTypeId?: string,
): (resultId: string, refTypeId?: string) => React.ReactNode {
  function ResultExtraRenderer(resultId: string): React.ReactNode {
    return (
      <JapaneseCultureResultExtra
        resultId={resultId}
        referrerTypeId={referrerTypeId}
      />
    );
  }
  return ResultExtraRenderer;
}

function JapaneseCultureResultExtra({
  resultId,
  referrerTypeId,
}: JapaneseCultureResultExtraProps) {
  const quiz = japaneseCultureQuiz;
  const myResult = quiz.results.find((r) => r.id === resultId);

  if (!myResult) return null;

  // If we have a valid referrer type, show compatibility
  if (referrerTypeId && isValidCultureTypeId(referrerTypeId)) {
    const friendResult = quiz.results.find((r) => r.id === referrerTypeId);
    const compatibility = getCompatibility(resultId, referrerTypeId);

    if (friendResult && compatibility) {
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
            inviteText="日本文化適性診断で相性を調べよう!"
          />
        </>
      );
    }
  }

  // No referrer: show invite button only
  return (
    <InviteFriendButton
      quizSlug={quiz.meta.slug}
      resultTypeId={resultId}
      inviteText="日本文化適性診断で相性を調べよう!"
    />
  );
}

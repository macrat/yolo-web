"use client";

import {
  getCompatibility,
  isValidCharacterTypeId,
} from "@/quiz/data/character-fortune";
import characterFortuneQuiz from "@/quiz/data/character-fortune";
import CompatibilitySection from "./CompatibilitySection";
import InviteFriendButton from "./InviteFriendButton";

interface CharacterFortuneResultExtraProps {
  resultId: string;
  referrerTypeId?: string;
}

/**
 * Returns a render function for extra content below the character fortune
 * quiz result card. Used by QuizContainer's renderResultExtra prop.
 */
export function renderCharacterFortuneExtra(
  referrerTypeId?: string,
): (resultId: string, refTypeId?: string) => React.ReactNode {
  function ResultExtraRenderer(resultId: string): React.ReactNode {
    return (
      <CharacterFortuneResultExtra
        resultId={resultId}
        referrerTypeId={referrerTypeId}
      />
    );
  }
  return ResultExtraRenderer;
}

function CharacterFortuneResultExtra({
  resultId,
  referrerTypeId,
}: CharacterFortuneResultExtraProps) {
  const quiz = characterFortuneQuiz;
  const myResult = quiz.results.find((r) => r.id === resultId);

  if (!myResult) return null;

  // If we have a valid referrer type, show compatibility
  if (referrerTypeId && isValidCharacterTypeId(referrerTypeId)) {
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
            inviteText="キャラ占いで相性を調べよう!"
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
      inviteText="キャラ占いで相性を調べよう!"
    />
  );
}

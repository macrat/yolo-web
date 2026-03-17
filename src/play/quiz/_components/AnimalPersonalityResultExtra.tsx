"use client";

import {
  getCompatibility,
  isValidAnimalTypeId,
} from "@/play/quiz/data/animal-personality";
import animalPersonalityQuiz from "@/play/quiz/data/animal-personality";
import CompatibilitySection from "./CompatibilitySection";
import InviteFriendButton from "./InviteFriendButton";

interface AnimalPersonalityResultExtraProps {
  resultId: string;
  referrerTypeId?: string;
}

/**
 * Returns a render function for extra content below the animal personality
 * quiz result card. Used by QuizContainer's renderResultExtra prop.
 */
export function renderAnimalPersonalityExtra(
  referrerTypeId?: string,
): (resultId: string, refTypeId?: string) => React.ReactNode {
  function ResultExtraRenderer(resultId: string): React.ReactNode {
    return (
      <AnimalPersonalityResultExtra
        resultId={resultId}
        referrerTypeId={referrerTypeId}
      />
    );
  }
  return ResultExtraRenderer;
}

function AnimalPersonalityResultExtra({
  resultId,
  referrerTypeId,
}: AnimalPersonalityResultExtraProps) {
  const quiz = animalPersonalityQuiz;
  const myResult = quiz.results.find((r) => r.id === resultId);

  if (!myResult) return null;

  // If we have a valid referrer type, show compatibility
  if (referrerTypeId && isValidAnimalTypeId(referrerTypeId)) {
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
            inviteText="日本の固有種診断で相性を調べよう!"
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
      inviteText="日本の固有種診断で相性を調べよう!"
    />
  );
}

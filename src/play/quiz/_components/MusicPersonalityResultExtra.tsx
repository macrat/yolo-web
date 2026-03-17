"use client";

import {
  getCompatibility,
  isValidMusicTypeId,
} from "@/play/quiz/data/music-personality";
import musicPersonalityQuiz from "@/play/quiz/data/music-personality";
import CompatibilitySection from "./CompatibilitySection";
import InviteFriendButton from "./InviteFriendButton";

interface MusicPersonalityResultExtraProps {
  resultId: string;
  referrerTypeId?: string;
}

/**
 * Returns a render function for extra content below the music personality
 * quiz result card. Used by QuizContainer's renderResultExtra prop.
 */
export function renderMusicPersonalityExtra(
  referrerTypeId?: string,
): (resultId: string, refTypeId?: string) => React.ReactNode {
  function ResultExtraRenderer(resultId: string): React.ReactNode {
    return (
      <MusicPersonalityResultExtra
        resultId={resultId}
        referrerTypeId={referrerTypeId}
      />
    );
  }
  return ResultExtraRenderer;
}

function MusicPersonalityResultExtra({
  resultId,
  referrerTypeId,
}: MusicPersonalityResultExtraProps) {
  const quiz = musicPersonalityQuiz;
  const myResult = quiz.results.find((r) => r.id === resultId);

  if (!myResult) return null;

  // If we have a valid referrer type, show compatibility
  if (referrerTypeId && isValidMusicTypeId(referrerTypeId)) {
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
            inviteText="音楽性格診断で相性を調べよう!"
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
      inviteText="音楽性格診断で相性を調べよう!"
    />
  );
}

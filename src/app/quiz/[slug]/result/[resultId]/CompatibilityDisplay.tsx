"use client";

import musicPersonalityQuiz, {
  getCompatibility,
} from "@/quiz/data/music-personality";
import CompatibilitySection from "@/quiz/_components/CompatibilitySection";

interface CompatibilityDisplayProps {
  myResultId: string;
  friendTypeId: string;
  quizSlug: string;
}

/**
 * Client component that renders the compatibility section
 * on the static result page when ?with= parameter is present.
 */
export default function CompatibilityDisplay({
  myResultId,
  friendTypeId,
  quizSlug,
}: CompatibilityDisplayProps) {
  const quiz = musicPersonalityQuiz;
  const myResult = quiz.results.find((r) => r.id === myResultId);
  const friendResult = quiz.results.find((r) => r.id === friendTypeId);
  const compatibility = getCompatibility(myResultId, friendTypeId);

  if (!myResult || !friendResult || !compatibility) return null;

  return (
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
      quizSlug={quizSlug}
    />
  );
}

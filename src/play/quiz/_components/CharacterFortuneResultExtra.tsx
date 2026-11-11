"use client";

import {
  getCompatibility,
  isValidCharacterTypeId,
} from "@/play/quiz/data/character-fortune";
import characterFortuneQuiz from "@/play/quiz/data/character-fortune";
import CompatibilitySection from "./CompatibilitySection";
import InviteFriendButton from "./InviteFriendButton";

interface CharacterFortuneResultExtraProps {
  resultId: string;
  referrerTypeId?: string;
}

/** ResultExtraLoader が読み込んで、解き終えた画面の「このタイプについて」の最後に描く。 */
export function renderCharacterFortuneExtra(
  referrerTypeId?: string,
): (resultId: string) => React.ReactNode {
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

/**
 * あなたの守護キャラ診断の、解き終えた画面の相性と招待。友達の結果の共有のリンクから来て、そのタイプとの相性が
 * 引けたときは相性を出し、招待のボタンを続ける。そうでなければ招待のボタンだけを出す。
 */
function CharacterFortuneResultExtra({
  resultId,
  referrerTypeId,
}: CharacterFortuneResultExtraProps) {
  const quiz = characterFortuneQuiz;
  const myResult = quiz.results.find((r) => r.id === resultId);

  if (!myResult) return null;

  if (referrerTypeId && isValidCharacterTypeId(referrerTypeId)) {
    const friendResult = quiz.results.find((r) => r.id === referrerTypeId);
    const compatibility = getCompatibility(resultId, referrerTypeId);

    if (friendResult && compatibility) {
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
            inviteText="キャラ診断で相性を調べよう!"
          />
        </>
      );
    }
  }

  return (
    <InviteFriendButton
      quizSlug={quiz.meta.slug}
      resultTypeId={resultId}
      inviteText="キャラ診断で相性を調べよう!"
    />
  );
}

"use client";

import {
  getCompatibility,
  isValidCultureTypeId,
} from "@/play/quiz/data/japanese-culture";
import japaneseCultureQuiz from "@/play/quiz/data/japanese-culture";
import CompatibilitySection from "./CompatibilitySection";
import InviteFriendButton from "./InviteFriendButton";

interface JapaneseCultureResultExtraProps {
  resultId: string;
  referrerTypeId?: string;
}

/** ResultExtraLoader が読み込んで、解き終えた画面の「このタイプについて」の最後に描く。 */
export function renderJapaneseCultureExtra(
  referrerTypeId?: string,
): (resultId: string) => React.ReactNode {
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

/**
 * 日本文化適性診断の、解き終えた画面の相性と招待。友達の結果の共有のリンクから来て、そのタイプとの相性が
 * 引けたときは相性を出し、招待のボタンを続ける。そうでなければ招待のボタンだけを出す。
 */
function JapaneseCultureResultExtra({
  resultId,
  referrerTypeId,
}: JapaneseCultureResultExtraProps) {
  const quiz = japaneseCultureQuiz;
  const myResult = quiz.results.find((r) => r.id === resultId);

  if (!myResult) return null;

  if (referrerTypeId && isValidCultureTypeId(referrerTypeId)) {
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
            inviteText="日本文化適性診断で相性を調べよう!"
          />
        </>
      );
    }
  }

  return (
    <InviteFriendButton
      quizSlug={quiz.meta.slug}
      resultTypeId={resultId}
      inviteText="日本文化適性診断で相性を調べよう!"
    />
  );
}

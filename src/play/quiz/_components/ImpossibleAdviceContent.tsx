/**
 * 実現不可能なアドバイス診断のタイプを詳しく説明する読みもの。解き終えた画面（ResultCard）と結果のページの
 * 両方に置く。
 *
 * 悩みの本質・ついやってしまうこと・本当に使える小さなヒント・すべてのタイプを並べる。キャッチコピー・共有・
 * 「もう一度挑戦する」は呼び出し側が置き、結果のページの案内は afterPracticalTip で差し込む。
 */

import type React from "react";
import type { ImpossibleAdviceDetailedContent } from "@/play/quiz/types";
import type { QuizResult } from "@/play/quiz/types";
import OtherTypesNav, { type ResultPlacement } from "./OtherTypesNav";
import {
  Reading,
  ReadingHeading,
  ReadingList,
  ReadingText,
} from "./ResultReading";

interface ImpossibleAdviceContentProps {
  /** 診断の slug（すべてのタイプのリンクに使う） */
  quizSlug: string;
  /** 来訪者のタイプ。すべてのタイプでこのタイプを示す。 */
  resultId: string;
  detailedContent: ImpossibleAdviceDetailedContent;
  /** 診断の全タイプ（すべてのタイプに並べる） */
  allResults: QuizResult[];
  /** 置く面。見出しの段と、すべてのタイプでのいまのタイプの示し方が決まる。 */
  placement: ResultPlacement;
  /** 本当に使える小さなヒントのあと、すべてのタイプの前に置くもの */
  afterPracticalTip?: React.ReactNode;
}

export default function ImpossibleAdviceContent({
  quizSlug,
  resultId,
  detailedContent,
  allResults,
  placement,
  afterPracticalTip,
}: ImpossibleAdviceContentProps) {
  return (
    <Reading>
      <ReadingHeading
        placement={placement}
        phrases={["あなたの", "悩みの", "本質"]}
      />
      <ReadingText>{detailedContent.diagnosisCore}</ReadingText>

      <ReadingHeading
        placement={placement}
        phrases={["ついやってしまう", "こと"]}
      />
      <ReadingList items={detailedContent.behaviors} />

      <ReadingHeading
        placement={placement}
        phrases={["本当に", "使える", "小さな", "ヒント"]}
      />
      <ReadingText>{detailedContent.practicalTip}</ReadingText>

      {afterPracticalTip}

      <OtherTypesNav
        quizSlug={quizSlug}
        currentResultId={resultId}
        results={allResults}
        placement={placement}
      />
    </Reading>
  );
}

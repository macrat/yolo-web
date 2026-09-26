/**
 * 意外な相性診断のタイプを詳しく説明する読みもの。解き終えた画面（ResultCard）と結果のページの両方に置く。
 *
 * 存在の本質・相性が良い理由・共鳴する日常・学べること・すべてのタイプを並べる。キャッチコピー・共有・
 * 「もう一度挑戦する」は呼び出し側が置き、結果のページの案内は afterLifeAdvice で差し込む。
 */

import type React from "react";
import type { UnexpectedCompatibilityDetailedContent } from "@/play/quiz/types";
import type { QuizResult } from "@/play/quiz/types";
import OtherTypesNav, { type ResultPlacement } from "./OtherTypesNav";
import {
  Reading,
  ReadingHeading,
  ReadingList,
  ReadingText,
} from "./ResultReading";

interface UnexpectedCompatibilityContentProps {
  /** 診断の slug（すべてのタイプのリンクに使う） */
  quizSlug: string;
  /** 来訪者のタイプ。すべてのタイプでこのタイプを示す。 */
  resultId: string;
  detailedContent: UnexpectedCompatibilityDetailedContent;
  /** 診断の全タイプ（すべてのタイプに並べる） */
  allResults: QuizResult[];
  /** 置く面。見出しの段と、すべてのタイプでのいまのタイプの示し方が決まる。 */
  placement: ResultPlacement;
  /** 学べることのあと、すべてのタイプの前に置くもの */
  afterLifeAdvice?: React.ReactNode;
}

export default function UnexpectedCompatibilityContent({
  quizSlug,
  resultId,
  detailedContent,
  allResults,
  placement,
  afterLifeAdvice,
}: UnexpectedCompatibilityContentProps) {
  return (
    <Reading>
      <ReadingHeading
        placement={placement}
        phrases={["この", "存在の", "本質"]}
      />
      <ReadingText>{detailedContent.entityEssence}</ReadingText>

      <ReadingHeading
        placement={placement}
        phrases={["なぜ", "相性が", "良いのか"]}
      />
      <ReadingText>{detailedContent.whyCompatible}</ReadingText>

      <ReadingHeading
        placement={placement}
        phrases={["この", "存在と", "共鳴する", "日常"]}
      />
      <ReadingList items={detailedContent.behaviors} />

      <ReadingHeading
        placement={placement}
        phrases={["この", "存在から", "学べる", "こと"]}
      />
      <ReadingText>{detailedContent.lifeAdvice}</ReadingText>

      {afterLifeAdvice}

      <OtherTypesNav
        quizSlug={quizSlug}
        currentResultId={resultId}
        results={allResults}
        placement={placement}
      />
    </Reading>
  );
}

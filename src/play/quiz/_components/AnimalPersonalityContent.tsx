/**
 * 日本の固有種診断のタイプを詳しく説明する読みもの。解き終えた画面（ResultCard）と結果のページの両方に置く。
 *
 * 強み・弱み・行動パターン・今日試してほしいこと・すべてのタイプを並べる。キャッチコピー・共有・「もう一度
 * 挑戦する」は呼び出し側が置き、相性と招待は afterTodayAction で差し込む。
 */

import type React from "react";
import type { AnimalPersonalityDetailedContent } from "@/play/quiz/types";
import animalPersonalityQuiz from "@/play/quiz/data/animal-personality";
import OtherTypesNav, { type ResultPlacement } from "./OtherTypesNav";
import {
  Reading,
  ReadingHeading,
  ReadingList,
  ReadingText,
} from "./ResultReading";

interface AnimalPersonalityContentProps {
  content: AnimalPersonalityDetailedContent;
  /** 来訪者のタイプ。すべてのタイプでこのタイプを示す。 */
  resultId: string;
  /** 置く面。見出しの段と、すべてのタイプでのいまのタイプの示し方が決まる。 */
  placement: ResultPlacement;
  /** 今日試してほしいことのあと、すべてのタイプの前に置くもの（相性・招待） */
  afterTodayAction?: React.ReactNode;
}

export default function AnimalPersonalityContent({
  content,
  resultId,
  placement,
  afterTodayAction,
}: AnimalPersonalityContentProps) {
  const quiz = animalPersonalityQuiz;

  return (
    <Reading>
      <ReadingHeading
        placement={placement}
        phrases={["この", "タイプの", "強み"]}
      />
      <ReadingList items={content.strengths} />

      <ReadingHeading
        placement={placement}
        phrases={["この", "タイプの", "弱み"]}
      />
      <ReadingList items={content.weaknesses} />

      <ReadingHeading
        placement={placement}
        phrases={["この", "動物に", "似た", "行動パターン"]}
      />
      <ReadingList items={content.behaviors} />

      <ReadingHeading
        placement={placement}
        phrases={["今日", "試してほしい", "こと"]}
      />
      <ReadingText>{content.todayAction}</ReadingText>

      {afterTodayAction}

      <OtherTypesNav
        quizSlug={quiz.meta.slug}
        currentResultId={resultId}
        results={quiz.results}
        placement={placement}
      />
    </Reading>
  );
}

/**
 * 四字熟語性格診断のタイプを詳しく説明する読みもの。解き終えた画面（ResultCard）と結果のページの両方に置く。
 *
 * 四字熟語の成り立ち・ルーツ・現れる日常・座右の銘として・すべてのタイプを並べる。キャッチコピー・共有・
 * 「もう一度挑戦する」は呼び出し側が置き、結果のページの案内は afterMotto で差し込む。
 */

import type React from "react";
import type { YojiPersonalityDetailedContent } from "@/play/quiz/types";
import yojiPersonalityQuiz from "@/play/quiz/data/yoji-personality";
import OtherTypesNav, { type ResultPlacement } from "./OtherTypesNav";
import {
  Reading,
  ReadingHeading,
  ReadingList,
  ReadingText,
} from "./ResultReading";

interface YojiPersonalityContentProps {
  content: YojiPersonalityDetailedContent;
  /** 来訪者のタイプ。すべてのタイプでこのタイプを示す。 */
  resultId: string;
  /** 置く面。見出しの段と、すべてのタイプでのいまのタイプの示し方が決まる。 */
  placement: ResultPlacement;
  /** 座右の銘としてのあと、すべてのタイプの前に置くもの */
  afterMotto?: React.ReactNode;
}

export default function YojiPersonalityContent({
  content,
  resultId,
  placement,
  afterMotto,
}: YojiPersonalityContentProps) {
  const quiz = yojiPersonalityQuiz;

  return (
    <Reading>
      <ReadingHeading
        placement={placement}
        phrases={["この", "四字熟語の", "成り立ち"]}
      />
      <ReadingText>{content.kanjiBreakdown}</ReadingText>

      <ReadingHeading
        placement={placement}
        phrases={["この", "四字熟語の", "ルーツ"]}
      />
      <ReadingText>{content.origin}</ReadingText>

      <ReadingHeading
        placement={placement}
        phrases={["この", "四字熟語が", "現れる", "日常"]}
      />
      <ReadingList items={content.behaviors} />

      <ReadingHeading placement={placement} phrases={["座右の銘", "として"]} />
      <ReadingText>{content.motto}</ReadingText>

      {afterMotto}

      <OtherTypesNav
        quizSlug={quiz.meta.slug}
        currentResultId={resultId}
        results={quiz.results}
        placement={placement}
      />
    </Reading>
  );
}

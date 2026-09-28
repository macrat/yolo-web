/**
 * 日本の固有種診断のタイプを詳しく説明する読みもの。解き終えた画面（ResultCard）と結果のページの両方に置く。
 *
 * 強み・弱み・行動パターン・今日試してほしいことを並べる。キャッチコピー・共有・すべてのタイプ・「もう一度
 * 挑戦する」は呼び出し側が置き、相性と招待は afterTodayAction で差し込む。
 */

import type React from "react";
import type { AnimalPersonalityDetailedContent } from "@/play/quiz/types";
import {
  Reading,
  ReadingHeading,
  ReadingList,
  ReadingText,
} from "./ResultReading";

interface AnimalPersonalityContentProps {
  content: AnimalPersonalityDetailedContent;
  /** 今日試してほしいことのあと、読みものの最後に置くもの（相性・招待） */
  afterTodayAction?: React.ReactNode;
}

export default function AnimalPersonalityContent({
  content,
  afterTodayAction,
}: AnimalPersonalityContentProps) {
  return (
    <Reading>
      <ReadingHeading phrases={["この", "タイプの", "強み"]} />
      <ReadingList items={content.strengths} />

      <ReadingHeading phrases={["この", "タイプの", "弱み"]} />
      <ReadingList items={content.weaknesses} />

      <ReadingHeading phrases={["この", "動物に", "似た", "行動パターン"]} />
      <ReadingList items={content.behaviors} />

      <ReadingHeading phrases={["今日", "試してほしい", "こと"]} />
      <ReadingText>{content.todayAction}</ReadingText>

      {afterTodayAction}
    </Reading>
  );
}

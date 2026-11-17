/**
 * 四字熟語性格診断のタイプを詳しく説明する読みもの。解き終えた画面（ResultCard）と結果のページの両方に置く。
 *
 * 四字熟語の成り立ち・ルーツ・現れる日常・座右の銘としてを並べる。キャッチコピー・共有・すべてのタイプ・
 * 「もう一度挑戦する」は呼び出し側が置き、結果のページの案内は afterMotto で差し込む。
 */

import type React from "react";
import type { YojiPersonalityDetailedContent } from "@/play/quiz/types";
import {
  Reading,
  ReadingHeading,
  ReadingList,
  ReadingText,
} from "./ResultReading";

interface YojiPersonalityContentProps {
  content: YojiPersonalityDetailedContent;
  /** 座右の銘としてのあと、読みものの最後に置くもの */
  afterMotto?: React.ReactNode;
}

export default function YojiPersonalityContent({
  content,
  afterMotto,
}: YojiPersonalityContentProps) {
  return (
    <Reading>
      <ReadingHeading phrases={["この", "四字熟語の", "成り立ち"]} />
      <ReadingText>{content.kanjiBreakdown}</ReadingText>

      <ReadingHeading phrases={["この", "四字熟語の", "ルーツ"]} />
      <ReadingText>{content.origin}</ReadingText>

      <ReadingHeading phrases={["この", "四字熟語が", "現れる", "日常"]} />
      <ReadingList items={content.behaviors} />

      <ReadingHeading phrases={["座右の銘", "として"]} />
      <ReadingText>{content.motto}</ReadingText>

      {afterMotto}
    </Reading>
  );
}

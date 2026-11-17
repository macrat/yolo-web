/**
 * 意外な相性診断のタイプを詳しく説明する読みもの。解き終えた画面（ResultCard）と結果のページの両方に置く。
 *
 * 存在の本質・相性が良い理由・共鳴する日常・学べることを並べる。キャッチコピー・共有・すべてのタイプ・
 * 「もう一度挑戦する」は呼び出し側が置き、結果のページの案内は afterLifeAdvice で差し込む。
 */

import type React from "react";
import type { UnexpectedCompatibilityDetailedContent } from "@/play/quiz/types";
import {
  Reading,
  ReadingHeading,
  ReadingList,
  ReadingText,
} from "./ResultReading";

interface UnexpectedCompatibilityContentProps {
  detailedContent: UnexpectedCompatibilityDetailedContent;
  /** 学べることのあと、読みものの最後に置くもの */
  afterLifeAdvice?: React.ReactNode;
}

export default function UnexpectedCompatibilityContent({
  detailedContent,
  afterLifeAdvice,
}: UnexpectedCompatibilityContentProps) {
  return (
    <Reading>
      <ReadingHeading phrases={["この", "存在の", "本質"]} />
      <ReadingText>{detailedContent.entityEssence}</ReadingText>

      <ReadingHeading phrases={["なぜ", "相性が", "良いのか"]} />
      <ReadingText>{detailedContent.whyCompatible}</ReadingText>

      <ReadingHeading phrases={["この", "存在と", "共鳴する", "日常"]} />
      <ReadingList items={detailedContent.behaviors} />

      <ReadingHeading phrases={["この", "存在から", "学べる", "こと"]} />
      <ReadingText>{detailedContent.lifeAdvice}</ReadingText>

      {afterLifeAdvice}
    </Reading>
  );
}

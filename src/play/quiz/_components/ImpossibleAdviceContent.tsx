/**
 * 実現不可能なアドバイス診断のタイプを詳しく説明する読みもの。解き終えた画面（ResultCard）と結果のページの
 * 両方に置く。
 *
 * 悩みの本質・ついやってしまうこと・本当に使える小さなヒントを並べる。キャッチコピー・共有・すべてのタイプ・
 * 「もう一度挑戦する」は呼び出し側が置き、結果のページの案内は afterPracticalTip で差し込む。
 */

import type React from "react";
import type { ImpossibleAdviceDetailedContent } from "@/play/quiz/types";
import {
  Reading,
  ReadingHeading,
  ReadingList,
  ReadingText,
} from "./ResultReading";

interface ImpossibleAdviceContentProps {
  detailedContent: ImpossibleAdviceDetailedContent;
  /** 本当に使える小さなヒントのあと、読みものの最後に置くもの */
  afterPracticalTip?: React.ReactNode;
}

export default function ImpossibleAdviceContent({
  detailedContent,
  afterPracticalTip,
}: ImpossibleAdviceContentProps) {
  return (
    <Reading>
      <ReadingHeading phrases={["あなたの", "悩みの", "本質"]} />
      <ReadingText>{detailedContent.diagnosisCore}</ReadingText>

      <ReadingHeading phrases={["ついやってしまう", "こと"]} />
      <ReadingList items={detailedContent.behaviors} />

      <ReadingHeading phrases={["本当に", "使える", "小さな", "ヒント"]} />
      <ReadingText>{detailedContent.practicalTip}</ReadingText>

      {afterPracticalTip}
    </Reading>
  );
}

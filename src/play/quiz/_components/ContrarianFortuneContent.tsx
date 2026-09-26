/**
 * 逆張り運勢診断のタイプを詳しく説明する読みもの。解き終えた画面（ResultCard）と結果のページの両方に置く。
 *
 * 核心の一文・あるある行動・人物像・一緒にいるとどうなるか・笑いの指標（あるタイプだけ）・すべてのタイプを
 * 並べる。キャッチコピー・共有・「もう一度挑戦する」は呼び出し側が置き、結果のページの案内は
 * afterThirdPartyNote で差し込む。
 */

import type React from "react";
import type { ContrarianFortuneDetailedContent } from "@/play/quiz/types";
import type { QuizResult } from "@/play/quiz/types";
import OtherTypesNav, { type ResultPlacement } from "./OtherTypesNav";
import {
  Reading,
  ReadingHeading,
  ReadingList,
  ReadingText,
} from "./ResultReading";
import styles from "./ContrarianFortuneContent.module.css";

interface ContrarianFortuneContentProps {
  /** 診断の slug（すべてのタイプのリンクに使う） */
  quizSlug: string;
  /** 来訪者のタイプ。すべてのタイプでこのタイプを示す。 */
  resultId: string;
  detailedContent: ContrarianFortuneDetailedContent;
  /** 診断の全タイプ（すべてのタイプに並べる） */
  allResults: QuizResult[];
  /** 置く面。見出しの段と、すべてのタイプでのいまのタイプの示し方が決まる。 */
  placement: ResultPlacement;
  /** 一緒にいるとどうなるかのあと、すべてのタイプの前に置くもの */
  afterThirdPartyNote?: React.ReactNode;
}

export default function ContrarianFortuneContent({
  quizSlug,
  resultId,
  detailedContent,
  allResults,
  placement,
  afterThirdPartyNote,
}: ContrarianFortuneContentProps) {
  const humorMetrics = detailedContent.humorMetrics ?? [];

  return (
    <Reading>
      <ReadingText>{detailedContent.coreSentence}</ReadingText>

      <ReadingHeading placement={placement} phrases={["あるある", "行動"]} />
      <ReadingList items={detailedContent.behaviors} />

      <ReadingHeading
        placement={placement}
        phrases={["この", "タイプの", "人物像"]}
      />
      <ReadingText>{detailedContent.persona}</ReadingText>

      <ReadingHeading
        placement={placement}
        phrases={["この", "タイプの", "人と", "一緒に", "いると"]}
      />
      <ReadingText>{detailedContent.thirdPartyNote}</ReadingText>

      {humorMetrics.length > 0 && (
        <table className={styles.metrics}>
          <tbody>
            {humorMetrics.map((metric) => (
              <tr key={metric.label}>
                <th scope="row">{metric.label}</th>
                <td>{metric.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {afterThirdPartyNote}

      <OtherTypesNav
        quizSlug={quizSlug}
        currentResultId={resultId}
        results={allResults}
        placement={placement}
      />
    </Reading>
  );
}

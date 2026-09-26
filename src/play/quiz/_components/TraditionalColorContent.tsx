/**
 * 伝統色診断のタイプを詳しく説明する読みもの。解き終えた画面（ResultCard）と結果のページの両方に置く。
 *
 * 色の物語・映える風景と季節・現れる場面・色からのひとこと・すべてのタイプを並べる。伝統色はタイプの中身なので、
 * すべてのタイプの行に色見本で見せる（DESIGN.md §2）。キャッチコピー・共有・「もう一度挑戦する」は呼び出し側が
 * 置き、結果のページの案内は afterColorAdvice で差し込む。
 */

import type React from "react";
import type { TraditionalColorDetailedContent } from "@/play/quiz/types";
import traditionalColorQuiz from "@/play/quiz/data/traditional-color";
import OtherTypesNav, { type ResultPlacement } from "./OtherTypesNav";
import {
  Reading,
  ReadingHeading,
  ReadingList,
  ReadingText,
} from "./ResultReading";
import styles from "./TraditionalColorContent.module.css";

interface TraditionalColorContentProps {
  content: TraditionalColorDetailedContent;
  /** 来訪者のタイプ。すべてのタイプでこのタイプを示す。 */
  resultId: string;
  /** 置く面。見出しの段と、すべてのタイプでのいまのタイプの示し方が決まる。 */
  placement: ResultPlacement;
  /** 色からのひとことのあと、すべてのタイプの前に置くもの */
  afterColorAdvice?: React.ReactNode;
}

export default function TraditionalColorContent({
  content,
  resultId,
  placement,
  afterColorAdvice,
}: TraditionalColorContentProps) {
  const quiz = traditionalColorQuiz;

  return (
    <Reading>
      <ReadingHeading
        placement={placement}
        phrases={["この", "色の", "物語"]}
      />
      <ReadingText>{content.colorMeaning}</ReadingText>

      <ReadingHeading
        placement={placement}
        phrases={["この", "色が", "映える", "風景"]}
      />
      <p className={styles.season}>季節：{content.season}</p>
      <ReadingText>{content.scenery}</ReadingText>

      <ReadingHeading
        placement={placement}
        phrases={["この", "色が", "現れる", "場面"]}
      />
      <ReadingList items={content.behaviors} />

      <ReadingHeading
        placement={placement}
        phrases={["この", "色からの", "ひとこと"]}
      />
      <ReadingText>{content.colorAdvice}</ReadingText>

      {afterColorAdvice}

      <OtherTypesNav
        quizSlug={quiz.meta.slug}
        currentResultId={resultId}
        results={quiz.results}
        placement={placement}
        showSwatch
      />
    </Reading>
  );
}

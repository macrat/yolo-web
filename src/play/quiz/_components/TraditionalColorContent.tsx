/**
 * 伝統色診断のタイプを詳しく説明する読みもの。解き終えた画面（ResultCard）と結果のページの両方に置く。
 *
 * 色の物語・映える風景と季節・現れる場面・色からのひとことを並べる。キャッチコピー・共有・すべてのタイプ・
 * 「もう一度挑戦する」は呼び出し側が置き、結果のページの案内は afterColorAdvice で差し込む。
 */

import type React from "react";
import type { TraditionalColorDetailedContent } from "@/play/quiz/types";
import {
  Reading,
  ReadingHeading,
  ReadingList,
  ReadingText,
} from "./ResultReading";
import styles from "./TraditionalColorContent.module.css";

interface TraditionalColorContentProps {
  content: TraditionalColorDetailedContent;
  /** 色からのひとことのあと、読みものの最後に置くもの */
  afterColorAdvice?: React.ReactNode;
}

export default function TraditionalColorContent({
  content,
  afterColorAdvice,
}: TraditionalColorContentProps) {
  return (
    <Reading>
      <ReadingHeading phrases={["この", "色の", "物語"]} />
      <ReadingText>{content.colorMeaning}</ReadingText>

      <ReadingHeading phrases={["この", "色が", "映える", "風景"]} />
      <p className={styles.season}>季節：{content.season}</p>
      <ReadingText>{content.scenery}</ReadingText>

      <ReadingHeading phrases={["この", "色が", "現れる", "場面"]} />
      <ReadingList items={content.behaviors} />

      <ReadingHeading phrases={["この", "色からの", "ひとこと"]} />
      <ReadingText>{content.colorAdvice}</ReadingText>

      {afterColorAdvice}
    </Reading>
  );
}

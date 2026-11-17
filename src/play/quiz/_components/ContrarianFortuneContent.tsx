/**
 * 逆張り運勢診断のタイプを詳しく説明する読みもの。解き終えた画面（ResultCard）と結果のページの両方に置く。
 *
 * あるある行動・人物像・一緒にいるとどうなるか・数字で見た笑いの指標（あるタイプだけ）を並べる。キャッチコピー・
 * 説明・共有・すべてのタイプ・「もう一度挑戦する」は呼び出し側が置き、結果のページの案内は afterThirdPartyNote で
 * 差し込む。
 */

import type React from "react";
import type { ContrarianFortuneDetailedContent } from "@/play/quiz/types";
import {
  Reading,
  ReadingHeading,
  ReadingList,
  ReadingText,
} from "./ResultReading";
import styles from "./ContrarianFortuneContent.module.css";

interface ContrarianFortuneContentProps {
  detailedContent: ContrarianFortuneDetailedContent;
  /** 一緒にいるとどうなるかのあと、読みものの最後に置くもの */
  afterThirdPartyNote?: React.ReactNode;
}

export default function ContrarianFortuneContent({
  detailedContent,
  afterThirdPartyNote,
}: ContrarianFortuneContentProps) {
  const humorMetrics = detailedContent.humorMetrics ?? [];

  return (
    <Reading>
      <ReadingHeading phrases={["あるある", "行動"]} />
      <ReadingList items={detailedContent.behaviors} />

      <ReadingHeading phrases={["この", "タイプの", "人物像"]} />
      <ReadingText>{detailedContent.persona}</ReadingText>

      <ReadingHeading
        phrases={["この", "タイプの", "人と", "一緒に", "いると"]}
      />
      <ReadingText>{detailedContent.thirdPartyNote}</ReadingText>

      {humorMetrics.length > 0 && (
        <>
          <ReadingHeading phrases={["この", "タイプを", "数字で", "見ると"]} />
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
        </>
      )}

      {afterThirdPartyNote}
    </Reading>
  );
}

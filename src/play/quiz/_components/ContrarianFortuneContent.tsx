/**
 * 逆張り運勢診断のタイプを詳しく説明する読みもの。解き終えた画面（ResultCard）と結果のページの両方に置く。
 *
 * あるある行動・人物像・一緒にいるとどうなるか・数字で見た笑いの指標（あるタイプだけ）を並べる。キャッチコピー・
 * 説明・共有・すべてのタイプ・「もう一度挑戦する」は呼び出し側が置き、結果のページの案内は afterThirdPartyNote で
 * 差し込む。
 */

import type React from "react";
import { useId } from "react";
import DataTable from "@/components/DataTable";
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
  /**
   * 笑いの指標の表のセルの区切り。セルの字（指標の名前と値）ごとに、サーバーで readingTableCells
   * （@/play/quiz/readingTableCells）が作ったものを受け取る。
   */
  tableCells: Readonly<Record<string, readonly string[]>>;
  /** 一緒にいるとどうなるかのあと、読みものの最後に置くもの */
  afterThirdPartyNote?: React.ReactNode;
}

export default function ContrarianFortuneContent({
  detailedContent,
  tableCells,
  afterThirdPartyNote,
}: ContrarianFortuneContentProps) {
  const metricsHeadingId = useId();
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
          <ReadingHeading
            id={metricsHeadingId}
            phrases={["この", "タイプを", "数字で", "見ると"]}
          />
          {/* 指標の名前と値の組の並びなので、表（DESIGN.md §5・§8 値の並び）で組み、セルは文節で折る（§4）。 */}
          <div className={styles.metrics}>
            <DataTable
              labelledBy={metricsHeadingId}
              rows={humorMetrics.map((metric) => ({
                key: metric.label,
                header: tableCells[metric.label],
                cells: [tableCells[metric.value]],
              }))}
            />
          </div>
        </>
      )}

      {afterThirdPartyNote}
    </Reading>
  );
}

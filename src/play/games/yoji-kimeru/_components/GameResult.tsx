"use client";

import { useEffect, useId, useRef } from "react";
import DataTable, { type DataTableRow } from "@/components/DataTable";
import PhrasedText from "@/components/PhrasedText";
import ResultBox from "@/components/ResultBox";
import QuantityBars, { type QuantityBar } from "@/components/QuantityBars";
import ShareButtons from "@/components/ShareButtons";
import type { ItemListItem } from "@/components/ItemList";
import NextPuzzleTime from "@/play/games/shared/_components/NextPuzzleTime";
import NextGameBanner from "@/play/games/shared/_components/NextGameBanner";
import { CrossCategoryBanner } from "@/play/games/shared/_components/CrossCategoryBanner";
import { revealControl } from "@/lib/reveal";
import type {
  Difficulty,
  YojiEntry,
  YojiGameState,
  YojiGameStats,
} from "@/play/games/yoji-kimeru/_lib/types";
import {
  categoryLabels,
  difficultyNames,
  originSentences,
} from "@/play/games/yoji-kimeru/_lib/constants";
import { generateShareText } from "@/play/games/yoji-kimeru/_lib/share";
import styles from "./styles/YojiKimeru.module.css";

interface GameResultProps {
  gameState: YojiGameState;
  /** 解き終えた回の答え。解き終えたときにだけサーバーから渡る。 */
  answer: YojiEntry;
  difficulty: Difficulty;
  /** その回で更新された、この難易度のこれまでの成績。 */
  stats: YojiGameStats;
  crossCategoryItems: ItemListItem[];
  /**
   * 来訪者の最後の推測に応えて現れたか。true のとき、結果のボックスが登場の動きを持ち、フォーカスを受け、
   * 画面の外にあれば画面に入るまで送る。解き終えたあとにページを開き直したときは渡さない。
   */
  appear: boolean;
}

/**
 * 解き終えたあとの結果（DESIGN.md §8）。盤のすぐ下の結果のボックスに、その回の結果（答えと、何回目で当てたか）
 * と、それで更新されたこれまでの成績を置く。そのすぐ下に結果の共有、次の問題の時刻、ほかの遊びの案内が続く。
 */
export default function GameResult({
  gameState,
  answer,
  difficulty,
  stats,
  crossCategoryItems,
  appear,
}: GameResultProps) {
  const statsHeadingId = useId();
  const distributionHeadingId = useId();
  const shareHeadingId = useId();
  const boxRef = useRef<HTMLElement>(null);
  const meaningRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!appear) return;
    boxRef.current?.focus({ preventScroll: true });
    // ボックスの頭（結果の見出しと、答えの意味の1行目）が画面に入るまで送る。
    if (meaningRef.current) revealControl(meaningRef.current);
  }, [appear]);

  const won = gameState.status === "won";
  const guessCount = gameState.guesses.length;
  const winRate =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;
  const records: DataTableRow[] = [
    {
      key: "played",
      header: ["遊んだ", "回数"],
      cells: [[`${stats.gamesPlayed}回`]],
    },
    { key: "winRate", header: ["正解した", "割合"], cells: [[`${winRate}%`]] },
    {
      key: "currentStreak",
      header: ["続けて", "正解した", "日数"],
      cells: [[`${stats.currentStreak}日`]],
    },
    {
      key: "maxStreak",
      header: ["いちばん", "長く", "続けて", "正解した", "日数"],
      cells: [[`${stats.maxStreak}日`]],
    },
  ];
  const distribution: QuantityBar[] = stats.guessDistribution.map(
    (count, i) => ({
      name: `${i + 1}回目`,
      value: count,
      valueText: String(count),
      current: won && guessCount === i + 1,
    }),
  );

  return (
    <div className={styles.result}>
      <ResultBox
        ref={boxRef}
        tabIndex={-1}
        caption={
          won ? `${guessCount}回目で正解` : "6回のうちに当てられませんでした"
        }
        heading={{ phrases: [answer.yoji], reading: answer.reading }}
        appear={appear}
      >
        <div className={styles.resultBody}>
          <p ref={meaningRef}>{answer.meaning}</p>
          <p className={styles.answerOrigin}>
            {originSentences[answer.origin]}で、分類は「
            {categoryLabels[answer.category]}」です。
          </p>
          <PhrasedText
            as="h2"
            id={statsHeadingId}
            className={styles.resultHeading}
            phrases={[`${difficultyNames[difficulty]}の`, "これまでの", "成績"]}
          />
          <DataTable labelledBy={statsHeadingId} rows={records} />
          <PhrasedText
            as="h2"
            id={distributionHeadingId}
            className={styles.resultHeading}
            phrases={["何回目で", "正解したか", "（日数）"]}
          />
          <QuantityBars
            labelledBy={distributionHeadingId}
            items={distribution}
          />
        </div>
      </ResultBox>
      <section className={styles.share} aria-labelledby={shareHeadingId}>
        <h3 id={shareHeadingId} className={styles.shareHeading}>
          この結果を共有
        </h3>
        <ShareButtons
          url="/play/yoji-kimeru"
          title="四字キメル"
          text={generateShareText(gameState, difficulty)}
          sns={["x", "line", "copy"]}
          contentType="game"
          contentId="yoji-kimeru"
        />
      </section>
      <NextPuzzleTime />
      <NextGameBanner currentGameSlug="yoji-kimeru" />
      <CrossCategoryBanner items={crossCategoryItems} />
    </div>
  );
}

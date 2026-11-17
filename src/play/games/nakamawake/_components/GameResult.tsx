"use client";

import { useId, type Ref } from "react";
import DataTable, { type DataTableRow } from "@/components/DataTable";
import PhrasedText from "@/components/PhrasedText";
import ResultBox from "@/components/ResultBox";
import QuantityBars from "@/components/QuantityBars";
import type {
  NakamawakeGameState,
  NakamawakeGameStats,
} from "@/play/games/nakamawake/_lib/types";
import { difficultyLabel } from "@/play/games/nakamawake/_lib/engine";
import GroupWords from "./GroupWords";
import styles from "./GameResult.module.css";

interface Props {
  gameState: NakamawakeGameState;
  /** この回を解き終えて更新された、これまでの成績。 */
  stats: NakamawakeGameStats;
  /** この回の最後のチェックに応えて現れたか。ページを開いたときに初めからある結果には渡さない。 */
  appear: boolean;
  ref?: Ref<HTMLElement>;
}

/** 見出しの文と折り所。コードに書いた決まった文なので、文節を手で区切る。 */
const WON_HEADING = ["4組", "すべて", "正解"];
const LOST_HEADING = ["4回", "間違えて", "終了"];

const MISTAKE_LABELS = ["0ミス", "1ミス", "2ミス", "3ミス", "4ミス"];

/**
 * 解き終えた回の結果（DESIGN.md §8）。その回の結果（勝った回はミスの数、負けた回は当てた組の数と、
 * 当てられなかった組）と、それで更新されたこれまでの成績を、盤のすぐ下の結果のボックスに置く。
 * 負けた回はいつもミスが4回で見出しが言うので、主見出しの段の数は当てた組の数にする。
 */
export default function GameResult({ gameState, stats, appear, ref }: Props) {
  const missedId = useId();
  const statsId = useId();
  const distributionId = useId();
  const isWon = gameState.status === "won";
  const missedGroups = gameState.puzzle.groups
    .filter(
      (group) =>
        !gameState.solvedGroups.some((solved) => solved.name === group.name),
    )
    .sort((a, b) => a.difficulty - b.difficulty);
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
    { key: "winRate", header: ["勝った", "割合"], cells: [[`${winRate}%`]] },
    {
      key: "currentStreak",
      header: ["続けて", "勝った", "日数"],
      cells: [[`${stats.currentStreak}日`]],
    },
    {
      key: "maxStreak",
      header: ["いちばん", "長く", "続けて", "勝った", "日数"],
      cells: [[`${stats.maxStreak}日`]],
    },
  ];

  return (
    <ResultBox
      ref={ref}
      tabIndex={-1}
      caption={`ナカマワケ #${gameState.puzzleNumber} の結果`}
      heading={{ phrases: isWon ? WON_HEADING : LOST_HEADING }}
      appear={appear}
    >
      <div className={styles.result}>
        <p className={styles.score}>
          {isWon
            ? `ミス${gameState.mistakes}回`
            : `${gameState.solvedGroups.length}組正解`}
        </p>
        {missedGroups.length > 0 && (
          <section className={styles.part} aria-labelledby={missedId}>
            <PhrasedText
              as="h2"
              id={missedId}
              className={styles.subheading}
              phrases={["当てられなかった組"]}
            />
            <ul className={styles.missed}>
              {missedGroups.map((group) => (
                <li key={group.name}>
                  <p className={styles.groupHead}>
                    <span className={styles.groupName}>{group.name}</span>
                    <span className={styles.difficulty}>
                      {difficultyLabel(group.difficulty)}
                    </span>
                  </p>
                  <GroupWords words={group.words} />
                </li>
              ))}
            </ul>
          </section>
        )}
        <section className={styles.part} aria-labelledby={statsId}>
          <PhrasedText
            as="h2"
            id={statsId}
            className={styles.subheading}
            phrases={["これまでの", "成績"]}
          />
          <DataTable labelledBy={statsId} rows={records} />
        </section>
        <section className={styles.part} aria-labelledby={distributionId}>
          <PhrasedText
            as="h2"
            id={distributionId}
            className={styles.subheading}
            phrases={["ミスの", "数ごとの", "回数"]}
          />
          <QuantityBars
            labelledBy={distributionId}
            items={stats.mistakeDistribution.map((count, mistakes) => ({
              name: MISTAKE_LABELS[mistakes],
              value: count,
              valueText: String(count),
              current: mistakes === gameState.mistakes,
            }))}
          />
        </section>
      </div>
    </ResultBox>
  );
}

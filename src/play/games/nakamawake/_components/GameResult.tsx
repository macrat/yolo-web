"use client";

import { Fragment, useId, type Ref } from "react";
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

/** これまでの成績の名前。表のセルの中で文節の切れ目（<wbr>）で折るので、文節ごとに区切る。 */
const RECORD_LABELS = {
  played: ["遊んだ", "回数"],
  winRate: ["勝った", "割合"],
  currentStreak: ["続けて", "勝った", "日数"],
  maxStreak: ["いちばん", "長く", "続けて", "勝った", "日数"],
};

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
  const records = [
    { label: RECORD_LABELS.played, value: `${stats.gamesPlayed}回` },
    { label: RECORD_LABELS.winRate, value: `${winRate}%` },
    { label: RECORD_LABELS.currentStreak, value: `${stats.currentStreak}日` },
    { label: RECORD_LABELS.maxStreak, value: `${stats.maxStreak}日` },
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
            <h3 id={missedId} className={styles.subheading}>
              当てられなかった組
            </h3>
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
          <h3 id={statsId} className={styles.subheading}>
            これまでの成績
          </h3>
          <table className={styles.stats}>
            <tbody>
              {records.map(({ label, value }) => (
                <tr key={label.join("")}>
                  <th scope="row">
                    {label.map((phrase, index) => (
                      <Fragment key={index}>
                        {index > 0 && <wbr />}
                        {phrase}
                      </Fragment>
                    ))}
                  </th>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className={styles.part} aria-labelledby={distributionId}>
          <h4 id={distributionId} className={styles.subheading}>
            ミスの数ごとの回数
          </h4>
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

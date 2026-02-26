import type { IrodoriGameState } from "@/games/irodori/_lib/types";
import { hslToHex } from "@/games/irodori/_lib/color-utils";
import {
  calculateTotalScore,
  getRank,
  getRankLabel,
} from "@/games/irodori/_lib/engine";
import styles from "./FinalResult.module.css";

interface Props {
  gameState: IrodoriGameState;
}

const RANK_EMOJIS: Record<string, string> = {
  S: "\u{1F451}", // crown
  A: "\u{1F31F}", // star
  B: "\u{1F44D}", // thumbs up
  C: "\u{1F60A}", // smile
  D: "\u{1F4AA}", // muscle
};

/**
 * Shows the final result after all 5 rounds are completed.
 */
export default function FinalResult({ gameState }: Props) {
  const scores = gameState.rounds.map((r) => r.score ?? 0);
  const totalScore = calculateTotalScore(scores);
  const rank = getRank(totalScore);

  return (
    <div className={styles.finalResult}>
      <div className={styles.rankEmoji}>{RANK_EMOJIS[rank]}</div>
      <div className={styles.scoreHeading}>
        {totalScore}/100 ({rank}
        {"\u30E9\u30F3\u30AF"})
      </div>
      <div className={styles.rankLabel}>{getRankLabel(rank)}</div>
      <div className={styles.roundsSummary}>
        {gameState.rounds.map((round, i) => {
          const answerHex = round.answer
            ? hslToHex(round.answer.h, round.answer.s, round.answer.l)
            : "#333333";
          return (
            <div key={i} className={styles.roundItem}>
              <div className={styles.roundLabel}>
                {"\u554F"}
                {i + 1}
              </div>
              <div className={styles.roundPatches}>
                <div
                  className={styles.miniPatch}
                  style={{ backgroundColor: round.target.hex }}
                />
                <div
                  className={styles.miniPatch}
                  style={{ backgroundColor: answerHex }}
                />
              </div>
              <div className={styles.roundScore}>
                {round.score ?? 0}
                {"\u70B9"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

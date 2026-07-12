import type { IrodoriGameState } from "@/play/games/irodori/_lib/types";
import { hslToHex } from "@/play/games/irodori/_lib/color-utils";
import {
  calculateTotalScore,
  getRank,
  getRankLabel,
} from "@/play/games/irodori/_lib/engine";
import styles from "./FinalResult.module.css";

interface Props {
  gameState: IrodoriGameState;
}

/**
 * Shows the final result after all 5 rounds are completed.
 *
 * DESIGN.md フェーズR・店構えへ変換: ランクの絵文字表示は撤去し、tabular な数字と
 * 文字だけの静かな到達表示にする（§6「見出し・ナビ・ボタンに絵文字を使わない」の
 * 精神を結果面にも適用。ゲームの結果面は nakamawake/kanji-kanaru の ResultModal と
 * 同じ「文字だけの結果サマリー」に揃え、Tsutsumi は使わない——両ゲームとも和色は
 * 各ラウンドの色見本という「成果物データ」の中身にのみ使う）。
 */
export default function FinalResult({ gameState }: Props) {
  const scores = gameState.rounds.map((r) => r.score ?? 0);
  const totalScore = calculateTotalScore(scores);
  const rank = getRank(totalScore);

  return (
    <div className={styles.finalResult}>
      <div className={styles.scoreHeading}>
        <span className={styles.scoreValue}>{totalScore}</span>
        <span className={styles.scoreUnit}>/100</span>
      </div>
      <div className={styles.rankLine}>
        <span className={styles.rankBadge}>{rank}ランク</span>
        {getRankLabel(rank)}
      </div>
      <div className={styles.roundsSummary}>
        {gameState.rounds.map((round, i) => {
          const answerHex = round.answer
            ? hslToHex(round.answer.h, round.answer.s, round.answer.l)
            : "#333333";
          return (
            <div key={i} className={styles.roundItem}>
              <div className={styles.roundLabel}>問{i + 1}</div>
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
              <div className={styles.roundScore}>{round.score ?? 0}点</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

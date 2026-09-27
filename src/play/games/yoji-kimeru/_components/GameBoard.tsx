"use client";

import type { YojiGuessFeedback } from "@/play/games/yoji-kimeru/_lib/types";
import GuessRow from "./GuessRow";
import styles from "./styles/YojiKimeru.module.css";

interface GameBoardProps {
  guesses: YojiGuessFeedback[];
  /** 次の推測を入れる空の行を見せるか（遊んでいるあいだだけ）。 */
  showNextRow: boolean;
  /** 来訪者の推測で、いま盤に加わった行の番号。その行の判定だけが現れる動きを持つ。 */
  addedRow: number | null;
}

/**
 * 盤。使った行と、次の推測を入れる1行だけを並べ、残りの空の行は見せない。1行は推測した4つの字で、
 * 字の下に判定の印を置く。
 */
export default function GameBoard({
  guesses,
  showNextRow,
  addedRow,
}: GameBoardProps) {
  return (
    <div className={styles.board} role="table" aria-label="推測した四字熟語">
      {guesses.map((feedback, i) => (
        <GuessRow key={i} feedback={feedback} appears={i === addedRow} />
      ))}
      {showNextRow && <GuessRow feedback={null} appears={false} />}
    </div>
  );
}

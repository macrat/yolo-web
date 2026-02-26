"use client";

import type { YojiGuessFeedback } from "@/games/yoji-kimeru/_lib/types";
import GuessRow from "./GuessRow";
import styles from "./styles/YojiKimeru.module.css";

interface GameBoardProps {
  guesses: YojiGuessFeedback[];
  maxGuesses: number;
}

/**
 * The main game grid showing up to maxGuesses rows of feedback.
 * Each row has 4 cells (one per kanji character).
 * Filled rows show colored feedback, empty rows show placeholders.
 */
export default function GameBoard({ guesses, maxGuesses }: GameBoardProps) {
  const rows: (YojiGuessFeedback | null)[] = [];
  for (let i = 0; i < maxGuesses; i++) {
    rows.push(guesses[i] ?? null);
  }

  return (
    <div className={styles.boardWrapper}>
      <div className={styles.board} role="grid" aria-label="推測結果">
        {rows.map((feedback, i) => (
          <GuessRow key={i} feedback={feedback} />
        ))}
      </div>
    </div>
  );
}

"use client";

import type { GuessFeedback } from "@/lib/games/kanji-kanaru/types";
import GuessRow from "./GuessRow";
import styles from "./styles/KanjiKanaru.module.css";

interface GameBoardProps {
  guesses: GuessFeedback[];
  maxGuesses: number;
}

const COLUMN_HEADERS = ["", "部首", "画数", "学年", "音読み", "意味"];

/**
 * The main game grid showing up to maxGuesses rows of feedback.
 * Filled rows show colored feedback, empty rows show placeholders.
 */
export default function GameBoard({ guesses, maxGuesses }: GameBoardProps) {
  const rows: (GuessFeedback | null)[] = [];
  for (let i = 0; i < maxGuesses; i++) {
    rows.push(guesses[i] ?? null);
  }

  return (
    <div className={styles.boardWrapper}>
      <div className={styles.board} role="grid" aria-label="推測結果">
        <div className={styles.columnHeaders} role="row">
          {COLUMN_HEADERS.map((header, i) => (
            <div
              key={i}
              className={
                i === 0 ? styles.columnHeaderKanji : styles.columnHeader
              }
              role="columnheader"
            >
              {header}
            </div>
          ))}
        </div>
        {rows.map((feedback, i) => (
          <GuessRow key={i} feedback={feedback} />
        ))}
      </div>
    </div>
  );
}

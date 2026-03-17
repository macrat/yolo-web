"use client";

import type { GuessFeedback } from "@/play/games/kanji-kanaru/_lib/types";
import GuessRow from "./GuessRow";
import styles from "./styles/KanjiKanaru.module.css";

interface GameBoardProps {
  guesses: GuessFeedback[];
  maxGuesses: number;
}

const COLUMN_HEADERS = [
  "",
  "\u90E8\u9996",
  "\u753B\u6570",
  "\u5B66\u5E74",
  "\u97F3\u8AAD\u307F",
  "\u610F\u5473",
  "\u8A13\u8AAD\u307F",
];

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
      <div
        className={styles.board}
        role="grid"
        aria-label="\u63A8\u6E2C\u7D50\u679C"
      >
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

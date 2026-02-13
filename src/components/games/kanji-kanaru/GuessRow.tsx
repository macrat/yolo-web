"use client";

import type { GuessFeedback } from "@/lib/games/kanji-kanaru/types";
import FeedbackCell from "./FeedbackCell";
import styles from "./styles/KanjiKanaru.module.css";

interface GuessRowProps {
  feedback: GuessFeedback | null;
}

const COLUMN_LABELS = ["部首", "画数", "学年", "音読み", "意味"];

/**
 * A single row in the game board showing the guessed kanji and 5 feedback cells.
 * Empty row is shown if feedback is null.
 */
export default function GuessRow({ feedback }: GuessRowProps) {
  if (!feedback) {
    return (
      <div className={styles.guessRow} role="row">
        <div className={styles.guessKanjiEmpty} role="cell" aria-label="空欄" />
        {COLUMN_LABELS.map((label) => (
          <div
            key={label}
            className={styles.cellEmpty}
            role="cell"
            aria-label={`${label}: 未回答`}
          />
        ))}
      </div>
    );
  }

  const feedbackKeys = [
    "radical",
    "strokeCount",
    "grade",
    "onYomi",
    "category",
  ] as const;

  return (
    <div className={styles.guessRow} role="row">
      <div className={styles.guessKanji} role="cell" aria-label="推測した漢字">
        {feedback.guess}
      </div>
      {feedbackKeys.map((key, i) => (
        <FeedbackCell
          key={key}
          feedback={feedback[key]}
          label={COLUMN_LABELS[i]}
        />
      ))}
    </div>
  );
}

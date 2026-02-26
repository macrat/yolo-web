"use client";

import type { YojiGuessFeedback } from "@/games/yoji-kimeru/_lib/types";
import CharFeedbackCell from "./CharFeedbackCell";
import styles from "./styles/YojiKimeru.module.css";

interface GuessRowProps {
  feedback: YojiGuessFeedback | null;
}

/**
 * A single row in the game board showing 4 feedback cells.
 * Empty row is shown if feedback is null.
 */
export default function GuessRow({ feedback }: GuessRowProps) {
  if (!feedback) {
    return (
      <div className={styles.guessRow} role="row">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={styles.cellEmpty}
            role="cell"
            aria-label="空欄"
          />
        ))}
      </div>
    );
  }

  const chars = [...feedback.guess];
  return (
    <div className={styles.guessRow} role="row">
      {chars.map((ch, i) => (
        <CharFeedbackCell
          key={i}
          character={ch}
          feedback={feedback.charFeedbacks[i]}
        />
      ))}
    </div>
  );
}

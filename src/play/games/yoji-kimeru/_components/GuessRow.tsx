"use client";

import type { YojiGuessFeedback } from "@/play/games/yoji-kimeru/_lib/types";
import CharFeedbackCell from "./CharFeedbackCell";
import styles from "./styles/YojiKimeru.module.css";

interface GuessRowProps {
  /** 空の行（次の推測を入れる行）は null。 */
  feedback: YojiGuessFeedback | null;
  /** 判定が現れる動きを持つか。来訪者の推測でいま加わった行だけが持つ。 */
  appears: boolean;
}

/** 盤の1行。推測した4つの字と、その判定。 */
export default function GuessRow({ feedback, appears }: GuessRowProps) {
  if (!feedback) {
    return (
      <div className={styles.row} role="row">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={styles.cellEmpty}
            role="cell"
            aria-label="空欄"
          >
            <span className={styles.char} aria-hidden="true">
              {"\u00a0"}
            </span>
            <span className={styles.mark} aria-hidden="true">
              {"\u00a0"}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={appears ? `${styles.row} ${styles.rowAppears}` : styles.row}
      role="row"
    >
      {[...feedback.guess].map((character, i) => (
        <CharFeedbackCell
          key={i}
          character={character}
          feedback={feedback.charFeedbacks[i]}
        />
      ))}
    </div>
  );
}

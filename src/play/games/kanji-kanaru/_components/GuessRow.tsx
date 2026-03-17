"use client";

import type { GuessFeedback } from "@/play/games/kanji-kanaru/_lib/types";
import FeedbackCell from "./FeedbackCell";
import styles from "./styles/KanjiKanaru.module.css";

interface GuessRowProps {
  feedback: GuessFeedback | null;
}

const COLUMN_LABELS = [
  "\u90E8\u9996",
  "\u753B\u6570",
  "\u5B66\u5E74",
  "\u97F3\u8AAD\u307F",
  "\u610F\u5473",
  "\u8A13\u8AAD\u307F",
];

/** Map grade direction to arrow suffix for the grade column. */
const GRADE_DIRECTION_ARROWS: Record<GuessFeedback["gradeDirection"], string> =
  {
    up: "\u2191",
    down: "\u2193",
    equal: "",
  };

/**
 * A single row in the game board showing the guessed kanji and 6 feedback cells.
 * Empty row is shown if feedback is null.
 */
export default function GuessRow({ feedback }: GuessRowProps) {
  if (!feedback) {
    return (
      <div className={styles.guessRow} role="row">
        <div
          className={styles.guessKanjiEmpty}
          role="cell"
          aria-label="\u7A7A\u6B04"
        />
        {COLUMN_LABELS.map((label) => (
          <div
            key={label}
            className={styles.cellEmpty}
            role="cell"
            aria-label={`${label}: \u672A\u56DE\u7B54`}
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
    "kunYomiCount",
  ] as const;

  return (
    <div className={styles.guessRow} role="row">
      <div
        className={styles.guessKanji}
        role="cell"
        aria-label="\u63A8\u6E2C\u3057\u305F\u6F22\u5B57"
      >
        {feedback.guess}
      </div>
      {feedbackKeys.map((key, i) => (
        <FeedbackCell
          key={key}
          feedback={feedback[key]}
          label={COLUMN_LABELS[i]}
          suffix={
            key === "grade"
              ? GRADE_DIRECTION_ARROWS[feedback.gradeDirection]
              : undefined
          }
        />
      ))}
    </div>
  );
}

"use client";

import type { FeedbackLevel } from "@/games/kanji-kanaru/_lib/types";
import styles from "./styles/KanjiKanaru.module.css";

interface FeedbackCellProps {
  feedback: FeedbackLevel;
  label: string;
  /** Optional suffix displayed after the feedback label (e.g., grade direction arrow). */
  suffix?: string;
}

const feedbackLabels: Record<FeedbackLevel, string> = {
  correct: "\u4E00\u81F4",
  close: "\u8FD1\u3044",
  wrong: "\u4E0D\u4E00\u81F4",
};

/**
 * A single colored cell showing feedback for one attribute of a guess.
 * Green = correct, yellow = close, gray = wrong.
 */
export default function FeedbackCell({
  feedback,
  label,
  suffix,
}: FeedbackCellProps) {
  const cellClass =
    feedback === "correct"
      ? styles.cellCorrect
      : feedback === "close"
        ? styles.cellClose
        : styles.cellWrong;

  const displayText = suffix
    ? `${feedbackLabels[feedback]}${suffix}`
    : feedbackLabels[feedback];

  return (
    <div
      className={cellClass}
      role="cell"
      aria-label={`${label}: ${feedbackLabels[feedback]}`}
    >
      {displayText}
    </div>
  );
}

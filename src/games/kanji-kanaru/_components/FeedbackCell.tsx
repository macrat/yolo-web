"use client";

import type { FeedbackLevel } from "@/games/kanji-kanaru/_lib/types";
import styles from "./styles/KanjiKanaru.module.css";

interface FeedbackCellProps {
  feedback: FeedbackLevel;
  label: string;
}

const feedbackLabels: Record<FeedbackLevel, string> = {
  correct: "一致",
  close: "近い",
  wrong: "不一致",
};

/**
 * A single colored cell showing feedback for one attribute of a guess.
 * Green = correct, yellow = close, gray = wrong.
 */
export default function FeedbackCell({ feedback, label }: FeedbackCellProps) {
  const cellClass =
    feedback === "correct"
      ? styles.cellCorrect
      : feedback === "close"
        ? styles.cellClose
        : styles.cellWrong;

  return (
    <div
      className={cellClass}
      role="cell"
      aria-label={`${label}: ${feedbackLabels[feedback]}`}
    >
      {feedbackLabels[feedback]}
    </div>
  );
}

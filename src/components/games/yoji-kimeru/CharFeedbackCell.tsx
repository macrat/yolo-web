"use client";

import type { CharFeedback } from "@/lib/games/yoji-kimeru/types";
import styles from "./styles/YojiKimeru.module.css";

interface CharFeedbackCellProps {
  character: string;
  feedback: CharFeedback;
}

const feedbackLabels: Record<CharFeedback, string> = {
  correct: "正しい位置",
  present: "別の位置に存在",
  absent: "含まれない",
};

/**
 * A single colored cell showing a kanji character with feedback.
 * Green = correct position, yellow = present but wrong position, gray = absent.
 */
export default function CharFeedbackCell({
  character,
  feedback,
}: CharFeedbackCellProps) {
  const cellClass =
    feedback === "correct"
      ? styles.cellCorrect
      : feedback === "present"
        ? styles.cellPresent
        : styles.cellAbsent;

  return (
    <div
      className={cellClass}
      role="cell"
      aria-label={`${character}: ${feedbackLabels[feedback]}`}
    >
      {character}
    </div>
  );
}

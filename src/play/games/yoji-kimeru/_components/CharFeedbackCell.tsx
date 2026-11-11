"use client";

import type { CharFeedback } from "@/play/games/yoji-kimeru/_lib/types";
import { FEEDBACK_MARKS } from "@/play/games/yoji-kimeru/_lib/feedbackMarks";
import styles from "./styles/YojiKimeru.module.css";

interface CharFeedbackCellProps {
  character: string;
  feedback: CharFeedback;
}

/**
 * 盤の1マス。推測した字の下に、判定の印（◯・△・×）を凡例と同じ字と書体で置く。当たりと当たりに近い判定の
 * マスは --paper-2 の地に --ink の印、外れの判定のマスは --paper の地に --ink-2 の印で組む（DESIGN.md §8）。
 * 読み上げは、字と、凡例と同じ意味の語で言う（「石: 別の位置」）。
 */
export default function CharFeedbackCell({
  character,
  feedback,
}: CharFeedbackCellProps) {
  const { mark, meaning } = FEEDBACK_MARKS[feedback];
  return (
    <div
      className={feedback === "absent" ? styles.cellMiss : styles.cellHit}
      role="cell"
      aria-label={`${character}: ${meaning}`}
    >
      <span className={styles.char} aria-hidden="true">
        {character}
      </span>
      <span className={styles.mark} aria-hidden="true">
        {mark}
      </span>
    </div>
  );
}

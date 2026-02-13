"use client";

import styles from "./styles/KanjiKanaru.module.css";

interface HintBarProps {
  strokeCount: number;
  readingCount: number;
}

/**
 * Displays initial hints: stroke count and number of on'yomi readings.
 */
export default function HintBar({ strokeCount, readingCount }: HintBarProps) {
  return (
    <div className={styles.hintBar} role="status" aria-label="ヒント">
      <span className={styles.hintLabel}>ヒント:</span>
      <span className={styles.hintValue}>画数 {strokeCount}</span>
      <span className={styles.hintValue}>読み数 {readingCount}</span>
    </div>
  );
}

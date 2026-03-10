"use client";

import styles from "./styles/KanjiKanaru.module.css";

interface HintBarProps {
  strokeCount: number;
  readingCount: number;
  kunYomiCount: number;
}

/**
 * Displays initial hints: stroke count, number of on'yomi readings,
 * and number of kun'yomi readings.
 */
export default function HintBar({
  strokeCount,
  readingCount,
  kunYomiCount,
}: HintBarProps) {
  return (
    <div
      className={styles.hintBar}
      role="status"
      aria-label="\u30D2\u30F3\u30C8"
    >
      <span className={styles.hintLabel}>{"\u30D2\u30F3\u30C8:"}</span>
      <span className={styles.hintValue}>
        {"\u753B\u6570"} {strokeCount}
      </span>
      <span className={styles.hintValue}>
        {"\u8AAD\u307F\u6570"} {readingCount}
      </span>
      <span className={styles.hintValue}>
        {"\u8A13\u8AAD\u307F\u6570"} {kunYomiCount}
      </span>
    </div>
  );
}

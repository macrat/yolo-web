"use client";

import type { Ref } from "react";
import styles from "./WordGrid.module.css";

interface Props {
  words: string[];
  selectedWords: string[];
  onWordToggle: (word: string) => void;
  ref?: Ref<HTMLDivElement>;
}

/**
 * まだ組になっていない語の格子。語を押して選び、選んだかどうかは語の上の四角の塗りで示す
 * （DESIGN.md §6 チェックボックスと同じ形）。列の数は、語の字の大きさに対する格子の幅で決める。
 */
export default function WordGrid({
  words,
  selectedWords,
  onWordToggle,
  ref,
}: Props) {
  return (
    <div
      ref={ref}
      className={styles.frame}
      role="group"
      aria-label="言葉の格子"
    >
      <div className={styles.grid}>
        {words.map((word) => (
          <button
            key={word}
            className={styles.wordButton}
            data-thick-frame
            onClick={() => onWordToggle(word)}
            aria-pressed={selectedWords.includes(word)}
            aria-label={word}
            type="button"
          >
            <span className={styles.mark} aria-hidden="true" />
            {word}
          </button>
        ))}
      </div>
    </div>
  );
}

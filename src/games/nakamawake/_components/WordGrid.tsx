"use client";

import styles from "./WordGrid.module.css";

interface Props {
  words: string[];
  selectedWords: string[];
  onWordToggle: (word: string) => void;
  disabled: boolean;
}

/**
 * 4x4 grid of word buttons. Players tap words to select them.
 */
export default function WordGrid({
  words,
  selectedWords,
  onWordToggle,
  disabled,
}: Props) {
  return (
    <div
      className={styles.grid}
      role="group"
      aria-label={"\u8A00\u8449\u306E\u30B0\u30EA\u30C3\u30C9"}
    >
      {words.map((word) => {
        const isSelected = selectedWords.includes(word);
        return (
          <button
            key={word}
            className={`${styles.wordButton} ${isSelected ? styles.selected : ""}`}
            onClick={() => onWordToggle(word)}
            disabled={disabled}
            aria-pressed={isSelected}
            aria-label={word}
            type="button"
          >
            {word}
          </button>
        );
      })}
    </div>
  );
}

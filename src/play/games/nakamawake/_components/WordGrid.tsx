"use client";

import styles from "./WordGrid.module.css";

interface Props {
  words: string[];
  selectedWords: string[];
  onWordToggle: (word: string) => void;
  disabled: boolean;
  /** disabled のとき、なぜ選べないかを言う文の id。 */
  disabledReasonId?: string;
}

/**
 * 4x4 grid of word buttons. Players tap words to select them.
 * 選んだかどうかは、語の上の四角の塗りで示す（§6 チェックボックスと同じ形）。
 */
export default function WordGrid({
  words,
  selectedWords,
  onWordToggle,
  disabled,
  disabledReasonId,
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
            className={styles.wordButton}
            onClick={() => onWordToggle(word)}
            disabled={disabled}
            aria-pressed={isSelected}
            aria-label={word}
            aria-describedby={disabled ? disabledReasonId : undefined}
            type="button"
          >
            <span className={styles.mark} aria-hidden="true" />
            {word}
          </button>
        );
      })}
    </div>
  );
}

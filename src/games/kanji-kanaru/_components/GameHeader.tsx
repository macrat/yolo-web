"use client";

import type { Difficulty } from "@/games/kanji-kanaru/_lib/types";
import DifficultySelector from "./DifficultySelector";
import styles from "./styles/KanjiKanaru.module.css";

interface GameHeaderProps {
  puzzleNumber: number;
  dateString: string;
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onHelpClick: () => void;
  onStatsClick: () => void;
}

/**
 * Game header showing the title, puzzle number, date, difficulty selector, and icon buttons.
 */
export default function GameHeader({
  puzzleNumber,
  dateString,
  difficulty,
  onDifficultyChange,
  onHelpClick,
  onStatsClick,
}: GameHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <h1 className={styles.title}>
          {"\u6F22\u5B57\u30AB\u30CA\u30FC\u30EB"}
        </h1>
        <div className={styles.headerButtons}>
          <button
            className={styles.iconButton}
            onClick={onHelpClick}
            aria-label="\u904A\u3073\u65B9"
            type="button"
          >
            ?
          </button>
          <button
            className={styles.iconButton}
            onClick={onStatsClick}
            aria-label="\u7D71\u8A08"
            type="button"
          >
            {"\u{1F4CA}"}
          </button>
        </div>
      </div>
      <div className={styles.headerSub}>
        #{puzzleNumber} - {dateString}
      </div>
      <DifficultySelector
        difficulty={difficulty}
        onChange={onDifficultyChange}
      />
    </header>
  );
}

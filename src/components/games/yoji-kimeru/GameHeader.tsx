"use client";

import styles from "./styles/YojiKimeru.module.css";

interface GameHeaderProps {
  puzzleNumber: number;
  dateString: string;
  onHelpClick: () => void;
  onStatsClick: () => void;
}

/**
 * Game header showing the title, puzzle number, date, and icon buttons.
 */
export default function GameHeader({
  puzzleNumber,
  dateString,
  onHelpClick,
  onStatsClick,
}: GameHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <h1 className={styles.title}>四字キメル</h1>
        <div className={styles.headerButtons}>
          <button
            className={styles.iconButton}
            onClick={onHelpClick}
            aria-label="遊び方"
            type="button"
          >
            ?
          </button>
          <button
            className={styles.iconButton}
            onClick={onStatsClick}
            aria-label="統計"
            type="button"
          >
            {"\u{1F4CA}"}
          </button>
        </div>
      </div>
      <div className={styles.headerSub}>
        #{puzzleNumber} - {dateString}
      </div>
    </header>
  );
}

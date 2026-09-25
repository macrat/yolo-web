"use client";

import type { Difficulty } from "@/play/games/yoji-kimeru/_lib/types";
import Button from "@/components/Button";
import DifficultySelector from "./DifficultySelector";
import styles from "./styles/YojiKimeru.module.css";

interface GameHeaderProps {
  puzzleNumber: number;
  dateString: string;
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onHelpClick: () => void;
  onStatsClick: () => void;
  /**
   * Ref to the game title <h1>. Used as the focus-restore anchor when an
   * auto-opened modal (first-visit HowToPlay / game-end Result) closes, so
   * keyboard/SR focus is not lost to <body>. See useDialog / GameContainer.
   */
  titleRef?: React.Ref<HTMLHeadingElement>;
}

/**
 * Game header showing the title, puzzle number, date, the buttons that open
 * the help and stats dialogs, and the difficulty selector.
 */
export default function GameHeader({
  puzzleNumber,
  dateString,
  difficulty,
  onDifficultyChange,
  onHelpClick,
  onStatsClick,
  titleRef,
}: GameHeaderProps) {
  return (
    <header className={styles.header}>
      <h1 ref={titleRef} tabIndex={-1} className={styles.title}>
        四字キメル
      </h1>
      {/* 開くと何が出るかを字で言い、下線で押せることを示す（§6）。 */}
      <div className={styles.headerButtons}>
        <Button onClick={onHelpClick}>{"遊び方"}</Button>
        <Button onClick={onStatsClick}>{"統計"}</Button>
      </div>
      <DifficultySelector
        difficulty={difficulty}
        onChange={onDifficultyChange}
      />
      <div className={styles.headerSub}>
        #{puzzleNumber} - {dateString}
      </div>
    </header>
  );
}

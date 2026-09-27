"use client";

import type { Difficulty } from "@/play/games/yoji-kimeru/_lib/types";
import DifficultySelector from "./DifficultySelector";
import styles from "./styles/YojiKimeru.module.css";

interface GameHeaderProps {
  puzzleNumber: number;
  dateString: string;
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
}

/**
 * 問題の番号と日付と、難易度を選ぶ組。ゲーム名の h1 はページ（GameLayout）が持つ。
 */
export default function GameHeader({
  puzzleNumber,
  dateString,
  difficulty,
  onDifficultyChange,
}: GameHeaderProps) {
  return (
    <header className={styles.header}>
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

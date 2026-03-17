"use client";

import type { Difficulty } from "@/play/games/yoji-kimeru/_lib/types";
import styles from "./styles/YojiKimeru.module.css";

interface DifficultySelectorProps {
  difficulty: Difficulty;
  onChange: (difficulty: Difficulty) => void;
}

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: "beginner", label: "\u521D\u7D1A" },
  { value: "intermediate", label: "\u4E2D\u7D1A" },
  { value: "advanced", label: "\u4E0A\u7D1A" },
];

/**
 * Compact button group for selecting game difficulty.
 */
export default function DifficultySelector({
  difficulty,
  onChange,
}: DifficultySelectorProps) {
  return (
    <div
      className={styles.difficultySelector}
      role="group"
      aria-label="\u96E3\u6613\u5EA6"
    >
      {DIFFICULTY_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={
            opt.value === difficulty
              ? styles.difficultyButtonActive
              : styles.difficultyButton
          }
          onClick={() => onChange(opt.value)}
          aria-pressed={opt.value === difficulty}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

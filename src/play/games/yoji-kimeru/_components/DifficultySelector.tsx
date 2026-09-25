"use client";

import type { Difficulty } from "@/play/games/yoji-kimeru/_lib/types";
import RadioGroup from "@/components/RadioGroup";
import styles from "./styles/YojiKimeru.module.css";

interface DifficultySelectorProps {
  difficulty: Difficulty;
  onChange: (difficulty: Difficulty) => void;
}

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: "beginner", label: "初級" },
  { value: "intermediate", label: "中級" },
  { value: "advanced", label: "上級" },
];

/**
 * 難易度を1つ選ぶラジオボタンの組。選んだ難易度は円の塗りで示す（§6）。
 */
export default function DifficultySelector({
  difficulty,
  onChange,
}: DifficultySelectorProps) {
  return (
    <RadioGroup
      className={styles.difficultySelector}
      legend={"難易度"}
      options={DIFFICULTY_OPTIONS}
      value={difficulty}
      onChange={(value) => onChange(value as Difficulty)}
    />
  );
}

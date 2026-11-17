"use client";

import type { Difficulty } from "@/play/games/yoji-kimeru/_lib/types";
import { difficultyNames } from "@/play/games/yoji-kimeru/_lib/constants";
import RadioGroup from "@/components/RadioGroup";

interface DifficultySelectorProps {
  difficulty: Difficulty;
  onChange: (difficulty: Difficulty) => void;
}

const DIFFICULTY_ORDER: Difficulty[] = ["beginner", "intermediate", "advanced"];

const DIFFICULTY_OPTIONS = DIFFICULTY_ORDER.map((value) => ({
  value,
  label: difficultyNames[value],
}));

/**
 * 難易度を1つ選ぶラジオボタンの組。選んだ難易度は円の塗りで示す（§6）。
 */
export default function DifficultySelector({
  difficulty,
  onChange,
}: DifficultySelectorProps) {
  return (
    <RadioGroup
      legend="難易度"
      options={DIFFICULTY_OPTIONS}
      value={difficulty}
      onChange={(value) => onChange(value as Difficulty)}
    />
  );
}

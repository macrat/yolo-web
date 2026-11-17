"use client";

import type { Difficulty } from "@/play/games/kanji-kanaru/_lib/types";
import { DIFFICULTY_LABELS } from "@/play/games/kanji-kanaru/_lib/types";
import RadioGroup from "@/components/RadioGroup";

interface DifficultySelectorProps {
  difficulty: Difficulty;
  onChange: (difficulty: Difficulty) => void;
}

const DIFFICULTY_OPTIONS = (
  Object.entries(DIFFICULTY_LABELS) as [Difficulty, string][]
).map(([value, label]) => ({ value, label }));

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

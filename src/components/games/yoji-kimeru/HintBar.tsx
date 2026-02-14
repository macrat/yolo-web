"use client";

import type { YojiCategory } from "@/lib/games/yoji-kimeru/types";
import styles from "./styles/YojiKimeru.module.css";

interface HintBarProps {
  guessCount: number;
  reading: string;
  category: YojiCategory;
  difficulty: number;
}

const categoryLabels: Record<YojiCategory, string> = {
  life: "人生・生き方",
  effort: "努力・根性",
  nature: "自然・風景",
  emotion: "感情・心理",
  society: "社会・人間関係",
  knowledge: "知識・学問",
  conflict: "対立・戦い",
  change: "変化・転換",
  virtue: "道徳・美徳",
  negative: "否定的・戒め",
};

const difficultyLabels = ["", "★", "★★", "★★★"];

/**
 * Displays hints that progressively reveal information:
 * - Difficulty is always shown
 * - After guess 3: first character of reading
 * - After guess 5: category
 */
export default function HintBar({
  guessCount,
  reading,
  category,
  difficulty,
}: HintBarProps) {
  const showReadingHint = guessCount >= 3;
  const showCategoryHint = guessCount >= 5;

  return (
    <div className={styles.hintBar} role="status" aria-label="ヒント">
      <span className={styles.hintLabel}>ヒント:</span>
      <span className={styles.hintValue}>
        難易度 {difficultyLabels[difficulty]}
      </span>
      {showReadingHint && (
        <span className={styles.hintValue}>読み {reading.charAt(0)}...</span>
      )}
      {showCategoryHint && (
        <span className={styles.hintValue}>
          分類 {categoryLabels[category]}
        </span>
      )}
      {!showReadingHint && (
        <span className={styles.hintValue}>(3回目で読みヒント)</span>
      )}
    </div>
  );
}

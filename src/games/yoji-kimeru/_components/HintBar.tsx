"use client";

import type { YojiCategory, YojiOrigin } from "@/games/yoji-kimeru/_lib/types";
import {
  categoryLabels,
  originLabels,
  difficultyLabels,
} from "@/games/yoji-kimeru/_lib/constants";
import styles from "./styles/YojiKimeru.module.css";

interface HintBarProps {
  guessCount: number;
  reading: string;
  category: YojiCategory;
  origin: YojiOrigin;
  difficulty: 1 | 2 | 3;
}

/**
 * Displays hints that progressively reveal information in 4 stages:
 * - Always: difficulty + reading character count
 * - After guess 3: first character of reading
 * - After guess 4: origin (中国古典由来 / 日本で成立 / 出典不明)
 * - After guess 5: category
 */
export default function HintBar({
  guessCount,
  reading,
  category,
  origin,
  difficulty,
}: HintBarProps) {
  const showReadingHint = guessCount >= 3;
  const showOriginHint = guessCount >= 4;
  const showCategoryHint = guessCount >= 5;

  return (
    <div className={styles.hintBar} role="status" aria-label="ヒント">
      <span className={styles.hintLabel}>ヒント:</span>
      <span className={styles.hintValue}>
        難易度{" "}
        <span aria-label={`難易度${difficulty}`}>
          {difficultyLabels[difficulty]}
        </span>
      </span>
      <span className={styles.hintValue}>読み {reading.length}文字</span>
      {showReadingHint && (
        <span className={styles.hintValue}>読み {reading.charAt(0)}...</span>
      )}
      {showOriginHint && (
        <span className={styles.hintValue}>出典 {originLabels[origin]}</span>
      )}
      {showCategoryHint && (
        <span className={styles.hintValue}>
          分類 {categoryLabels[category]}
        </span>
      )}
      {!showReadingHint && (
        <span className={styles.hintValue}>(3回目で読みヒント)</span>
      )}
      {showReadingHint && !showOriginHint && (
        <span className={styles.hintValue}>(4回目で出典ヒント)</span>
      )}
      {showOriginHint && !showCategoryHint && (
        <span className={styles.hintValue}>(5回目でカテゴリヒント)</span>
      )}
    </div>
  );
}

"use client";

import { useCallback } from "react";
import type { NakamawakeGameState } from "@/play/games/nakamawake/_lib/types";
import { generateShareText } from "@/play/games/nakamawake/_lib/share";
import GameDialog from "@/play/games/shared/_components/GameDialog";
import GameShareButtons from "@/play/games/shared/_components/GameShareButtons";
import CountdownTimer from "@/play/games/shared/_components/CountdownTimer";
import NextGameBanner from "@/play/games/shared/_components/NextGameBanner";
import { CrossCategoryBanner } from "@/play/games/shared/_components/CrossCategoryBanner";
import type { CrossCategoryItem } from "@/play/games/shared/_components/CrossCategoryBanner";
import { getDifficultyColor } from "@/play/games/nakamawake/_lib/engine";
import styles from "./ResultModal.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  gameState: NakamawakeGameState;
  onStatsClick: () => void;
  /** 他カテゴリへの導線データ。Server Component（page.tsx）で事前計算して渡す。 */
  crossCategoryItems: CrossCategoryItem[];
}

/**
 * Modal shown when the game ends. Shows result, all groups, and share buttons.
 * Uses the shared GameDialog component.
 */
export default function ResultModal({
  open,
  onClose,
  gameState,
  onStatsClick,
  crossCategoryItems,
}: Props) {
  const isWon = gameState.status === "won";
  const shareText = generateShareText(gameState);

  // Show all 4 groups sorted by difficulty
  const allGroups = [...gameState.puzzle.groups].sort(
    (a, b) => a.difficulty - b.difficulty,
  );

  const handleStatsClick = useCallback(() => {
    onClose();
    onStatsClick();
  }, [onClose, onStatsClick]);

  return (
    <GameDialog
      open={open}
      onClose={onClose}
      titleId="nakamawake-result-title"
      title={isWon ? "\u3059\u3079\u3066\u6B63\u89E3!" : "\u6B8B\u5FF5..."}
      headerContent={
        <div className={styles.resultEmoji}>
          {isWon ? "\u{1F389}" : "\u{1F614}"}
        </div>
      }
      footer={
        <button
          className={styles.statsButton}
          onClick={handleStatsClick}
          type="button"
        >
          {"\u7D71\u8A08\u3092\u898B\u308B"}
        </button>
      }
    >
      <div className={styles.resultSummary}>
        {isWon
          ? `${gameState.mistakes === 0 ? "\u30D1\u30FC\u30D5\u30A7\u30AF\u30C8!" : `\u30DF\u30B9${gameState.mistakes}\u56DE\u3067\u30AF\u30EA\u30A2!`}`
          : `\u30DF\u30B9${gameState.mistakes}\u56DE\u3067\u30B2\u30FC\u30E0\u30AA\u30FC\u30D0\u30FC`}
      </div>
      <div className={styles.groupsList}>
        {allGroups.map((group) => (
          <div
            key={group.name}
            className={`${styles.group} ${styles[getDifficultyColor(group.difficulty)]}`}
          >
            <div className={styles.groupName}>{group.name}</div>
            <div className={styles.groupWords}>
              {group.words.join("\u3001")}
            </div>
          </div>
        ))}
      </div>
      <GameShareButtons
        shareText={shareText}
        gameTitle={"\u30CA\u30AB\u30DE\u30EF\u30B1"}
        gameSlug="nakamawake"
      />
      <CountdownTimer />
      <NextGameBanner currentGameSlug="nakamawake" />
      <CrossCategoryBanner items={crossCategoryItems} />
    </GameDialog>
  );
}

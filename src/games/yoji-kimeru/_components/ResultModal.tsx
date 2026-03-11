"use client";

import { useCallback } from "react";
import type { Difficulty, YojiGameState } from "@/games/yoji-kimeru/_lib/types";
import {
  categoryLabels,
  originLabels,
} from "@/games/yoji-kimeru/_lib/constants";
import { generateShareText } from "@/games/yoji-kimeru/_lib/share";
import GameDialog from "@/games/shared/_components/GameDialog";
import GameShareButtons from "@/games/shared/_components/GameShareButtons";
import CountdownTimer from "@/games/shared/_components/CountdownTimer";
import NextGameBanner from "@/games/shared/_components/NextGameBanner";
import styles from "./styles/YojiKimeru.module.css";

interface ResultModalProps {
  open: boolean;
  onClose: () => void;
  gameState: YojiGameState;
  difficulty: Difficulty;
  onStatsClick: () => void;
}

/**
 * Modal showing the game result (win or loss) with answer details and share buttons.
 * Uses the shared GameDialog component.
 */
export default function ResultModal({
  open,
  onClose,
  gameState,
  difficulty,
  onStatsClick,
}: ResultModalProps) {
  const { targetYoji, guesses, status } = gameState;
  const isWon = status === "won";
  const shareText = generateShareText(gameState, difficulty);

  const handleStatsClick = useCallback(() => {
    onClose();
    onStatsClick();
  }, [onClose, onStatsClick]);

  return (
    <GameDialog
      open={open}
      onClose={onClose}
      titleId="yoji-kimeru-result-title"
      title={isWon ? "正解!" : "残念..."}
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
          統計を見る
        </button>
      }
    >
      <div className={styles.resultAnswer}>{targetYoji.yoji}</div>
      <div className={styles.resultReading}>{targetYoji.reading}</div>
      <div className={styles.resultMeaning}>{targetYoji.meaning}</div>
      <div className={styles.resultMeta}>
        <span>{originLabels[targetYoji.origin]}</span>
        <span className={styles.resultMetaSeparator}>|</span>
        <span>{categoryLabels[targetYoji.category]}</span>
      </div>
      <div className={styles.resultSummary}>
        {isWon
          ? `${guesses.length}/6 で正解しました!`
          : "6回以内に正解できませんでした"}
      </div>
      <GameShareButtons
        shareText={shareText}
        gameTitle="四字キメル"
        gameSlug="yoji-kimeru"
      />
      <CountdownTimer />
      <NextGameBanner currentGameSlug="yoji-kimeru" />
    </GameDialog>
  );
}

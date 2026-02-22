"use client";

import { useCallback } from "react";
import type { YojiGameState } from "@/lib/games/yoji-kimeru/types";
import { generateShareText } from "@/lib/games/yoji-kimeru/share";
import GameDialog from "@/components/games/shared/GameDialog";
import GameShareButtons from "@/components/games/shared/GameShareButtons";
import CountdownTimer from "@/components/games/shared/CountdownTimer";
import NextGameBanner from "@/components/games/shared/NextGameBanner";
import styles from "./styles/YojiKimeru.module.css";

interface ResultModalProps {
  open: boolean;
  onClose: () => void;
  gameState: YojiGameState;
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
  onStatsClick,
}: ResultModalProps) {
  const { targetYoji, guesses, status } = gameState;
  const isWon = status === "won";
  const shareText = generateShareText(gameState);

  const handleStatsClick = useCallback(() => {
    onClose();
    onStatsClick();
  }, [onClose, onStatsClick]);

  return (
    <GameDialog
      open={open}
      onClose={onClose}
      titleId="yoji-kimeru-result-title"
      title={isWon ? "\u6B63\u89E3!" : "\u6B8B\u5FF5..."}
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
      <div className={styles.resultAnswer}>{targetYoji.yoji}</div>
      <div className={styles.resultReading}>{targetYoji.reading}</div>
      <div className={styles.resultMeaning}>{targetYoji.meaning}</div>
      <div className={styles.resultSummary}>
        {isWon
          ? `${guesses.length}/6 \u3067\u6B63\u89E3\u3057\u307E\u3057\u305F!`
          : "6\u56DE\u4EE5\u5185\u306B\u6B63\u89E3\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F"}
      </div>
      <GameShareButtons
        shareText={shareText}
        gameTitle={"\u56DB\u5B57\u30AD\u30E1\u30EB"}
        gameSlug="yoji-kimeru"
      />
      <CountdownTimer />
      <NextGameBanner currentGameSlug="yoji-kimeru" />
    </GameDialog>
  );
}

"use client";

import { useCallback } from "react";
import type { IrodoriGameState } from "@/lib/games/irodori/types";
import {
  generateShareText,
  generateResultImage,
  downloadImage,
} from "@/lib/games/irodori/share";
import GameDialog from "@/components/games/shared/GameDialog";
import GameShareButtons from "@/components/games/shared/GameShareButtons";
import CountdownTimer from "@/components/games/shared/CountdownTimer";
import NextGameBanner from "@/components/games/shared/NextGameBanner";
import FinalResult from "./FinalResult";
import styles from "./ResultModal.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  gameState: IrodoriGameState;
  onStatsClick: () => void;
}

/**
 * Modal shown when all 5 rounds are completed.
 * Shows final result, share buttons, and countdown timer.
 */
export default function ResultModal({
  open,
  onClose,
  gameState,
  onStatsClick,
}: Props) {
  const shareText = generateShareText(gameState);

  const handleSaveImage = useCallback(() => {
    const dataUrl = generateResultImage(gameState);
    if (dataUrl) {
      downloadImage(dataUrl, `irodori-${gameState.puzzleNumber}.png`);
    }
  }, [gameState]);

  const handleStatsClick = useCallback(() => {
    onClose();
    onStatsClick();
  }, [onClose, onStatsClick]);

  return (
    <GameDialog
      open={open}
      onClose={onClose}
      titleId="irodori-result-title"
      title={"\u7D50\u679C"}
      width={440}
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
      <FinalResult gameState={gameState} />
      <GameShareButtons
        shareText={shareText}
        gameTitle={"\u30A4\u30ED\u30C9\u30EA"}
        gameSlug="irodori"
        onSaveImage={handleSaveImage}
      />
      <CountdownTimer />
      <NextGameBanner currentGameSlug="irodori" />
    </GameDialog>
  );
}

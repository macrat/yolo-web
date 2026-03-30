"use client";

import { useCallback } from "react";
import type { IrodoriGameState } from "@/play/games/irodori/_lib/types";
import {
  generateShareText,
  generateResultImage,
  downloadImage,
} from "@/play/games/irodori/_lib/share";
import GameDialog from "@/play/games/shared/_components/GameDialog";
import GameShareButtons from "@/play/games/shared/_components/GameShareButtons";
import CountdownTimer from "@/play/games/shared/_components/CountdownTimer";
import NextGameBanner from "@/play/games/shared/_components/NextGameBanner";
import { CrossCategoryBanner } from "@/play/games/shared/_components/CrossCategoryBanner";
import type { CrossCategoryItem } from "@/play/games/shared/_components/CrossCategoryBanner";
import FinalResult from "./FinalResult";
import styles from "./ResultModal.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  gameState: IrodoriGameState;
  onStatsClick: () => void;
  /** 他カテゴリへの導線データ。Server Component（page.tsx）で事前計算して渡す。 */
  crossCategoryItems: CrossCategoryItem[];
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
  crossCategoryItems,
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
      <CrossCategoryBanner items={crossCategoryItems} />
    </GameDialog>
  );
}

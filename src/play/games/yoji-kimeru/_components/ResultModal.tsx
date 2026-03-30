"use client";

import { useCallback } from "react";
import type {
  Difficulty,
  YojiGameState,
} from "@/play/games/yoji-kimeru/_lib/types";
import {
  categoryLabels,
  originLabels,
} from "@/play/games/yoji-kimeru/_lib/constants";
import { generateShareText } from "@/play/games/yoji-kimeru/_lib/share";
import GameDialog from "@/play/games/shared/_components/GameDialog";
import GameShareButtons from "@/play/games/shared/_components/GameShareButtons";
import CountdownTimer from "@/play/games/shared/_components/CountdownTimer";
import NextGameBanner from "@/play/games/shared/_components/NextGameBanner";
import { CrossCategoryBanner } from "@/play/games/shared/_components/CrossCategoryBanner";
import type { CrossCategoryItem } from "@/play/games/shared/_components/CrossCategoryBanner";
import styles from "./styles/YojiKimeru.module.css";

interface ResultModalProps {
  open: boolean;
  onClose: () => void;
  gameState: YojiGameState;
  difficulty: Difficulty;
  onStatsClick: () => void;
  /** 他カテゴリへの導線データ。Server Component（page.tsx）で事前計算して渡す。 */
  crossCategoryItems: CrossCategoryItem[];
}

/**
 * Modal showing the game result (win or loss) with answer details and share buttons.
 * Uses the shared GameDialog component.
 * Guards against targetYoji being null (it is null during gameplay, only set on game end).
 */
export default function ResultModal({
  open,
  onClose,
  gameState,
  difficulty,
  onStatsClick,
  crossCategoryItems,
}: ResultModalProps) {
  const { targetYoji, guesses, status } = gameState;

  // Hooks must be called unconditionally before any early return
  const handleStatsClick = useCallback(() => {
    onClose();
    onStatsClick();
  }, [onClose, onStatsClick]);

  // Guard: targetYoji is null during gameplay. If somehow null here, don't render.
  if (!targetYoji) return null;

  const isWon = status === "won";
  const shareText = generateShareText(gameState, difficulty);

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
      <CrossCategoryBanner items={crossCategoryItems} />
    </GameDialog>
  );
}

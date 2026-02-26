"use client";

import { useCallback } from "react";
import type { GameState } from "@/games/kanji-kanaru/_lib/types";
import { generateShareText } from "@/games/kanji-kanaru/_lib/share";
import GameDialog from "@/games/shared/_components/GameDialog";
import GameShareButtons from "@/games/shared/_components/GameShareButtons";
import CountdownTimer from "@/games/shared/_components/CountdownTimer";
import NextGameBanner from "@/games/shared/_components/NextGameBanner";
import styles from "./styles/KanjiKanaru.module.css";

interface ResultModalProps {
  open: boolean;
  onClose: () => void;
  gameState: GameState;
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
  const { targetKanji, guesses, status } = gameState;
  const isWon = status === "won";
  const shareText = generateShareText(gameState);

  const onReadings = targetKanji.onYomi.join("\u3001");
  const kunReadings = targetKanji.kunYomi.join("\u3001");
  const meanings = targetKanji.meanings.join(", ");
  const examples = targetKanji.examples.join("\u3001");

  const handleStatsClick = useCallback(() => {
    onClose();
    onStatsClick();
  }, [onClose, onStatsClick]);

  return (
    <GameDialog
      open={open}
      onClose={onClose}
      titleId="kanji-kanaru-result-title"
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
      <div className={styles.resultAnswer}>{targetKanji.character}</div>
      <div className={styles.resultReadings}>
        {onReadings && <>\u97F3: {onReadings}</>}
        {onReadings && kunReadings && " / "}
        {kunReadings && <>\u8A13: {kunReadings}</>}
      </div>
      {meanings && (
        <div className={styles.resultMeanings}>\u610F\u5473: {meanings}</div>
      )}
      {examples && (
        <div className={styles.resultExamples}>\u4F8B: {examples}</div>
      )}
      <div className={styles.resultSummary}>
        {isWon
          ? `${guesses.length}/6 \u3067\u6B63\u89E3\u3057\u307E\u3057\u305F!`
          : "6\u56DE\u4EE5\u5185\u306B\u6B63\u89E3\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F"}
      </div>
      <GameShareButtons
        shareText={shareText}
        gameTitle={"\u6F22\u5B57\u30AB\u30CA\u30FC\u30EB"}
        gameSlug="kanji-kanaru"
      />
      <CountdownTimer />
      <NextGameBanner currentGameSlug="kanji-kanaru" />
    </GameDialog>
  );
}

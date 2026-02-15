"use client";

import { useRef, useEffect, useCallback } from "react";
import type { GameState } from "@/lib/games/kanji-kanaru/types";
import { generateShareText } from "@/lib/games/kanji-kanaru/share";
import ShareButtons from "./ShareButtons";
import CountdownTimer from "@/components/games/shared/CountdownTimer";
import styles from "./styles/KanjiKanaru.module.css";

interface ResultModalProps {
  open: boolean;
  onClose: () => void;
  gameState: GameState;
  onStatsClick: () => void;
}

/**
 * Modal showing the game result (win or loss) with answer details and share buttons.
 * Uses the native <dialog> element.
 */
export default function ResultModal({
  open,
  onClose,
  gameState,
  onStatsClick,
}: ResultModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const { targetKanji, guesses, status } = gameState;
  const isWon = status === "won";
  const shareText = generateShareText(gameState);

  const onReadings = targetKanji.onYomi.join("、");
  const kunReadings = targetKanji.kunYomi.join("、");
  const meanings = targetKanji.meanings.join(", ");
  const examples = targetKanji.examples.join("、");

  return (
    <dialog
      ref={dialogRef}
      className={styles.modal}
      onClose={handleClose}
      aria-labelledby="result-title"
    >
      <div className={styles.resultEmoji}>
        {isWon ? "\u{1F389}" : "\u{1F614}"}
      </div>
      <h2 id="result-title" className={styles.modalTitle}>
        {isWon ? "正解!" : "残念..."}
      </h2>
      <div className={styles.resultAnswer}>{targetKanji.character}</div>
      <div className={styles.resultReadings}>
        {onReadings && <>音: {onReadings}</>}
        {onReadings && kunReadings && " / "}
        {kunReadings && <>訓: {kunReadings}</>}
      </div>
      {meanings && (
        <div className={styles.resultMeanings}>意味: {meanings}</div>
      )}
      {examples && <div className={styles.resultExamples}>例: {examples}</div>}
      <div className={styles.resultSummary}>
        {isWon
          ? `${guesses.length}/6 で正解しました!`
          : "6回以内に正解できませんでした"}
      </div>
      <ShareButtons shareText={shareText} />
      <CountdownTimer />
      <button
        className={styles.shareButtonStats}
        onClick={() => {
          handleClose();
          onStatsClick();
        }}
        type="button"
      >
        統計を見る
      </button>
      <button className={styles.modalClose} onClick={handleClose} type="button">
        閉じる
      </button>
    </dialog>
  );
}

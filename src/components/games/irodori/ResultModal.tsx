"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { IrodoriGameState } from "@/lib/games/irodori/types";
import {
  generateShareText,
  copyToClipboard,
  generateTwitterShareUrl,
  generateResultImage,
  downloadImage,
} from "@/lib/games/irodori/share";
import { useCanWebShare, shareGameResult } from "@/lib/games/shared/webShare";
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);
  const canWebShare = useCanWebShare();

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

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        onClose();
      }
    },
    [onClose],
  );

  const shareText = generateShareText(gameState);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(shareText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareText]);

  const handleShareX = useCallback(() => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const pageUrl = `${baseUrl}/games/irodori`;
    const url = generateTwitterShareUrl(shareText, pageUrl);
    window.open(url, "_blank", "noopener,noreferrer");
  }, [shareText]);

  const handleWebShare = useCallback(async () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    await shareGameResult({
      title: "\u30A4\u30ED\u30C9\u30EA",
      text: shareText,
      url: `${baseUrl}/games/irodori`,
    });
  }, [shareText]);

  const handleSaveImage = useCallback(() => {
    const dataUrl = generateResultImage(gameState);
    if (dataUrl) {
      downloadImage(dataUrl, `irodori-${gameState.puzzleNumber}.png`);
    }
  }, [gameState]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.modal}
      onClose={handleClose}
      onClick={handleBackdropClick}
      aria-labelledby="irodori-result-title"
    >
      <h2 id="irodori-result-title" className={styles.modalTitle}>
        {"\u7D50\u679C"}
      </h2>
      <FinalResult gameState={gameState} />
      <div>
        <div className={styles.shareArea}>
          {canWebShare ? (
            <button
              className={styles.shareButtonCopy}
              onClick={handleWebShare}
              type="button"
            >
              {"\u30B7\u30A7\u30A2"}
            </button>
          ) : (
            <>
              <button
                className={styles.shareButtonCopy}
                onClick={handleCopy}
                type="button"
              >
                {"\u7D50\u679C\u3092\u30B3\u30D4\u30FC"}
              </button>
              <button
                className={styles.shareButtonX}
                onClick={handleShareX}
                type="button"
              >
                X{"\u3067\u30B7\u30A7\u30A2"}
              </button>
            </>
          )}
          <button
            className={styles.shareButtonImage}
            onClick={handleSaveImage}
            type="button"
          >
            {"\u753B\u50CF\u3092\u4FDD\u5B58"}
          </button>
        </div>
        <div className={styles.copiedMessage} role="status" aria-live="polite">
          {copied ? "\u30B3\u30D4\u30FC\u3057\u307E\u3057\u305F!" : ""}
        </div>
      </div>
      <CountdownTimer />
      <NextGameBanner currentGameSlug="irodori" />
      <button
        className={styles.statsButton}
        onClick={() => {
          handleClose();
          onStatsClick();
        }}
        type="button"
      >
        {"\u7D71\u8A08\u3092\u898B\u308B"}
      </button>
      <button className={styles.modalClose} onClick={handleClose} type="button">
        {"\u9589\u3058\u308B"}
      </button>
    </dialog>
  );
}

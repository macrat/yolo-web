"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { NakamawakeGameState } from "@/lib/games/nakamawake/types";
import {
  generateShareText,
  copyToClipboard,
  generateTwitterShareUrl,
} from "@/lib/games/nakamawake/share";
import { useCanWebShare, shareGameResult } from "@/lib/games/shared/webShare";
import CountdownTimer from "@/components/games/shared/CountdownTimer";
import { getDifficultyColor } from "@/lib/games/nakamawake/engine";
import styles from "./ResultModal.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  gameState: NakamawakeGameState;
  onStatsClick: () => void;
}

/**
 * Modal shown when the game ends. Shows result, all groups, and share buttons.
 * Uses the native <dialog> element.
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

  const isWon = gameState.status === "won";
  const shareText = generateShareText(gameState);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(shareText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareText]);

  const handleShareX = useCallback(() => {
    const url = generateTwitterShareUrl(shareText);
    window.open(url, "_blank", "noopener,noreferrer");
  }, [shareText]);

  const handleWebShare = useCallback(async () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    await shareGameResult({
      title: "\u30CA\u30AB\u30DE\u30EF\u30B1",
      text: shareText,
      url: `${baseUrl}/games/nakamawake`,
    });
  }, [shareText]);

  // Show all 4 groups sorted by difficulty
  const allGroups = [...gameState.puzzle.groups].sort(
    (a, b) => a.difficulty - b.difficulty,
  );

  return (
    <dialog
      ref={dialogRef}
      className={styles.modal}
      onClose={handleClose}
      aria-labelledby="nakamawake-result-title"
    >
      <div className={styles.resultEmoji}>
        {isWon ? "\u{1F389}" : "\u{1F614}"}
      </div>
      <h2 id="nakamawake-result-title" className={styles.modalTitle}>
        {isWon ? "\u3059\u3079\u3066\u6B63\u89E3!" : "\u6B8B\u5FF5..."}
      </h2>
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
        </div>
        <div className={styles.copiedMessage} role="status" aria-live="polite">
          {copied ? "\u30B3\u30D4\u30FC\u3057\u307E\u3057\u305F!" : ""}
        </div>
      </div>
      <CountdownTimer />
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

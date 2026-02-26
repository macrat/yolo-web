"use client";

import { useState, useCallback } from "react";
import {
  copyToClipboard,
  generateTwitterShareUrl,
} from "@/games/shared/_lib/share";
import { useCanWebShare, shareGameResult } from "@/lib/webShare";
import styles from "./GameShareButtons.module.css";

/**
 * Props for the GameShareButtons component.
 */
interface GameShareButtonsProps {
  /** The text content to share (result text with emoji grid). */
  shareText: string;
  /** Display name of the game (used as Web Share API title). */
  gameTitle: string;
  /** URL slug for the game (e.g. "irodori", "kanji-kanaru"). */
  gameSlug: string;
  /** Optional callback for a "save image" button (irodori only). */
  onSaveImage?: () => void;
}

/**
 * Shared share buttons component for all game result modals.
 *
 * Displays either a single "share" button (Web Share API) or
 * "copy result" + "share on X" buttons, plus an optional "save image" button.
 * Shows a brief "copied!" feedback message after copying.
 *
 * Replaces the duplicated share button implementations across
 * irodori/nakamawake (inline) and kanji-kanaru/yoji-kimeru (ShareButtons.tsx).
 */
export default function GameShareButtons({
  shareText,
  gameTitle,
  gameSlug,
  onSaveImage,
}: GameShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const canWebShare = useCanWebShare();

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(shareText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareText]);

  const handleShareX = useCallback(() => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const pageUrl = `${baseUrl}/games/${gameSlug}`;
    const url = generateTwitterShareUrl(shareText, pageUrl);
    window.open(url, "_blank", "noopener,noreferrer");
  }, [shareText, gameSlug]);

  const handleWebShare = useCallback(async () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    await shareGameResult({
      title: gameTitle,
      text: shareText,
      url: `${baseUrl}/games/${gameSlug}`,
    });
  }, [shareText, gameTitle, gameSlug]);

  return (
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
        {onSaveImage && (
          <button
            className={styles.shareButtonImage}
            onClick={onSaveImage}
            type="button"
          >
            {"\u753B\u50CF\u3092\u4FDD\u5B58"}
          </button>
        )}
      </div>
      <div className={styles.copiedMessage} role="status" aria-live="polite">
        {copied ? "\u30B3\u30D4\u30FC\u3057\u307E\u3057\u305F!" : ""}
      </div>
    </div>
  );
}

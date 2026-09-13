"use client";

import { useState, useCallback } from "react";
import {
  copyToClipboard,
  generateTwitterShareUrl,
} from "@/play/games/shared/_lib/share";
import { useCanWebShare, shareGameResult } from "@/lib/webShare";
import { trackShare } from "@/lib/analytics";
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
  /** Content type for GA4 share event tracking (defaults to "game"). */
  contentType?: string;
}

/**
 * Shared share buttons component for all game result modals
 * （(new) デザイン体系版・cycle-268 フォーク・NICE-1）.
 *
 * legacy `../GameShareButtons` を austere トーンへ質的入れ替えしたもの
 * （色の線引きは GameShareButtons.module.css のコメント参照）。
 * `shareGameResult`（結果テキスト整形）への依存があり汎用 ShareButtons へ
 * 単純置換できない機能差があるため、機能を劣後させず GameShareButtons を保持する。
 * 振る舞い・props・DOM 構造は不変。
 */
export default function GameShareButtons({
  shareText,
  gameTitle,
  gameSlug,
  onSaveImage,
  contentType = "game",
}: GameShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const canWebShare = useCanWebShare();

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(shareText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    trackShare("clipboard", contentType, gameSlug);
  }, [shareText, contentType, gameSlug]);

  const handleShareX = useCallback(() => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const pageUrl = `${baseUrl}/play/${gameSlug}`;
    const url = generateTwitterShareUrl(shareText, pageUrl);
    window.open(url, "_blank", "noopener,noreferrer");
    trackShare("twitter", contentType, gameSlug);
  }, [shareText, gameSlug, contentType]);

  const handleWebShare = useCallback(async () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    await shareGameResult({
      title: gameTitle,
      text: shareText,
      url: `${baseUrl}/play/${gameSlug}`,
    });
    trackShare("web_share", contentType, gameSlug);
  }, [shareText, gameTitle, gameSlug, contentType]);

  return (
    <div>
      <div className={styles.shareArea}>
        {canWebShare ? (
          <button
            className={styles.shareButtonCopy}
            onClick={handleWebShare}
            type="button"
          >
            {"シェア"}
          </button>
        ) : (
          <>
            <button
              className={styles.shareButtonCopy}
              onClick={handleCopy}
              type="button"
            >
              {"結果をコピー"}
            </button>
            <button
              className={styles.shareButtonX}
              onClick={handleShareX}
              type="button"
            >
              X{"でシェア"}
            </button>
          </>
        )}
        {onSaveImage && (
          <button
            className={styles.shareButtonImage}
            onClick={onSaveImage}
            type="button"
          >
            {"画像を保存"}
          </button>
        )}
      </div>
      <div className={styles.copiedMessage} role="status" aria-live="polite">
        {copied ? "コピーしました!" : ""}
      </div>
    </div>
  );
}

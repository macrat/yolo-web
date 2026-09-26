"use client";

import { useState, useCallback } from "react";
import {
  copyToClipboard,
  generateTwitterShareUrl,
} from "@/play/games/shared/_lib/share";
import { useCanWebShare, shareGameResult } from "@/lib/webShare";
import { trackShare } from "@/lib/analytics";
import Button from "@/components/Button";
import { SHARE_LABELS } from "@/lib/share-labels";
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
 * ゲームの結果の共有のボタンの並び。どのボタンもプライマリでないボタン（DESIGN.md §6）で、共有先は
 * 文言で言う。端末の共有シートを開けるなら、それ1つに任せる。
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
          <Button onClick={handleWebShare}>{"シェア"}</Button>
        ) : (
          <>
            <Button onClick={handleCopy}>{"結果をコピー"}</Button>
            <Button
              onClick={handleShareX}
              aria-label={SHARE_LABELS.x.ariaLabel}
            >
              {SHARE_LABELS.x.text}
            </Button>
          </>
        )}
        {onSaveImage && <Button onClick={onSaveImage}>{"画像を保存"}</Button>}
      </div>
      <div className={styles.copiedMessage} role="status" aria-live="polite">
        {copied ? "コピーしました!" : ""}
      </div>
    </div>
  );
}

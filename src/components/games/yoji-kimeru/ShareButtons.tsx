"use client";

import { useState, useCallback } from "react";
import {
  copyToClipboard,
  generateTwitterShareUrl,
} from "@/lib/games/yoji-kimeru/share";
import { useCanWebShare, shareGameResult } from "@/lib/games/shared/webShare";
import styles from "./styles/YojiKimeru.module.css";

interface ShareButtonsProps {
  shareText: string;
}

/**
 * Copy result and Share on X buttons for sharing game results.
 * Uses Web Share API on supported devices, falls back to copy + X share.
 */
export default function ShareButtons({ shareText }: ShareButtonsProps) {
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
    const pageUrl = `${baseUrl}/games/yoji-kimeru`;
    const url = generateTwitterShareUrl(shareText, pageUrl);
    window.open(url, "_blank", "noopener,noreferrer");
  }, [shareText]);

  const handleWebShare = useCallback(async () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    await shareGameResult({
      title: "四字キメル",
      text: shareText,
      url: `${baseUrl}/games/yoji-kimeru`,
    });
  }, [shareText]);

  return (
    <div>
      <div className={styles.shareArea}>
        {canWebShare ? (
          <button
            className={styles.shareButtonCopy}
            onClick={handleWebShare}
            type="button"
          >
            シェア
          </button>
        ) : (
          <>
            <button
              className={styles.shareButtonCopy}
              onClick={handleCopy}
              type="button"
            >
              結果をコピー
            </button>
            <button
              className={styles.shareButtonX}
              onClick={handleShareX}
              type="button"
            >
              Xでシェア
            </button>
          </>
        )}
      </div>
      <div className={styles.copiedMessage} role="status" aria-live="polite">
        {copied ? "コピーしました!" : ""}
      </div>
    </div>
  );
}

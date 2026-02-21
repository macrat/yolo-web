"use client";

import { useState, useCallback } from "react";
import { useCanWebShare, shareGameResult } from "@/lib/games/shared/webShare";
import styles from "./ShareButtons.module.css";

type ShareButtonsProps = {
  shareText: string;
  shareUrl: string;
  quizTitle: string;
};

export default function ShareButtons({
  shareText,
  shareUrl,
  quizTitle,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const canWebShare = useCanWebShare();

  const handleWebShare = useCallback(async () => {
    await shareGameResult({
      title: quizTitle,
      text: shareText,
      url: shareUrl,
    });
  }, [quizTitle, shareText, shareUrl]);

  const handleTwitter = useCallback(() => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "noopener,noreferrer",
    );
  }, [shareText, shareUrl]);

  const handleLine = useCallback(() => {
    const text = encodeURIComponent(`${shareText}\n${shareUrl}`);
    window.open(
      `https://line.me/R/share?text=${text}`,
      "_blank",
      "noopener,noreferrer",
    );
  }, [shareText, shareUrl]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail
    }
  }, [shareText, shareUrl]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.buttons}>
        {canWebShare ? (
          <button
            type="button"
            className={`${styles.shareButton} ${styles.webShare}`}
            onClick={handleWebShare}
          >
            結果をシェア
          </button>
        ) : (
          <>
            <button
              type="button"
              className={`${styles.shareButton} ${styles.twitter}`}
              onClick={handleTwitter}
            >
              Xでシェア
            </button>
            <button
              type="button"
              className={`${styles.shareButton} ${styles.line}`}
              onClick={handleLine}
            >
              LINEでシェア
            </button>
            <button
              type="button"
              className={`${styles.shareButton} ${styles.copy}`}
              onClick={handleCopy}
            >
              コピー
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

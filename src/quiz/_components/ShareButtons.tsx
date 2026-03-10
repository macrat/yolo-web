"use client";

import { useState, useCallback } from "react";
import { useCanWebShare, shareGameResult } from "@/lib/webShare";
import { trackShare } from "@/lib/analytics";
import styles from "./ShareButtons.module.css";

interface ShareButtonsProps {
  shareText: string;
  shareUrl: string;
  quizTitle: string;
  /** Content type for GA4 share event tracking (e.g. "quiz", "diagnosis"). */
  contentType?: string;
  /** Content identifier for GA4 share event tracking. */
  contentId?: string;
}

export default function ShareButtons({
  shareText,
  shareUrl,
  quizTitle,
  contentType,
  contentId,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const canWebShare = useCanWebShare();

  const handleWebShare = useCallback(async () => {
    await shareGameResult({
      title: quizTitle,
      text: shareText,
      url: shareUrl,
    });
    if (contentType && contentId) {
      trackShare("web_share", contentType, contentId);
    }
  }, [quizTitle, shareText, shareUrl, contentType, contentId]);

  const handleTwitter = useCallback(() => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "noopener,noreferrer",
    );
    if (contentType && contentId) {
      trackShare("twitter", contentType, contentId);
    }
  }, [shareText, shareUrl, contentType, contentId]);

  const handleLine = useCallback(() => {
    const text = encodeURIComponent(`${shareText}\n${shareUrl}`);
    window.open(
      `https://line.me/R/share?text=${text}`,
      "_blank",
      "noopener,noreferrer",
    );
    if (contentType && contentId) {
      trackShare("line", contentType, contentId);
    }
  }, [shareText, shareUrl, contentType, contentId]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (contentType && contentId) {
        trackShare("clipboard", contentType, contentId);
      }
    } catch {
      // Silently fail
    }
  }, [shareText, shareUrl, contentType, contentId]);

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

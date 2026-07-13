"use client";

import { useState, useCallback } from "react";
import { useCanWebShare, shareGameResult } from "@/lib/webShare";
import { trackShare, type ShareSurface } from "@/lib/analytics";
import styles from "./ShareButtons.module.css";

interface ShareButtonsProps {
  shareText: string;
  shareUrl: string;
  quizTitle: string;
  /** Content type for GA4 share event tracking (e.g. "quiz", "diagnosis"). */
  contentType?: string;
  /** Content identifier for GA4 share event tracking. */
  contentId?: string;
  /**
   * Share surface tag for GA4 (cycle-280 B-551). Quiz/diagnosis text-share
   * callers pass "text"; arm-independent surfaces (e.g. fortune's
   * DailyFortuneCard) omit it so the `surface` dimension is not partially
   * filled and the main KPI stays uninterpolated.
   */
  surface?: ShareSurface;
}

export default function ShareButtons({
  shareText,
  shareUrl,
  quizTitle,
  contentType,
  contentId,
  surface,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const canWebShare = useCanWebShare();

  const handleWebShare = useCallback(async () => {
    // Only count a web_share when the share sheet actually completed
    // (shareGameResult returns false on cancel/unsupported). Counting the
    // unconditional call would inflate web_share with cancellations (B-551).
    const shared = await shareGameResult({
      title: quizTitle,
      text: shareText,
      url: shareUrl,
    });
    if (shared && contentType && contentId) {
      trackShare("web_share", contentType, contentId, surface);
    }
  }, [quizTitle, shareText, shareUrl, contentType, contentId, surface]);

  const handleTwitter = useCallback(() => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "noopener,noreferrer",
    );
    if (contentType && contentId) {
      trackShare("twitter", contentType, contentId, surface);
    }
  }, [shareText, shareUrl, contentType, contentId, surface]);

  const handleLine = useCallback(() => {
    const text = encodeURIComponent(`${shareText}\n${shareUrl}`);
    window.open(
      `https://line.me/R/share?text=${text}`,
      "_blank",
      "noopener,noreferrer",
    );
    if (contentType && contentId) {
      trackShare("line", contentType, contentId, surface);
    }
  }, [shareText, shareUrl, contentType, contentId, surface]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (contentType && contentId) {
        trackShare("clipboard", contentType, contentId, surface);
      }
    } catch {
      // Silently fail
    }
  }, [shareText, shareUrl, contentType, contentId, surface]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.buttons}>
        {canWebShare ? (
          <button
            type="button"
            className={styles.shareButton}
            onClick={handleWebShare}
          >
            この結果をシェア
          </button>
        ) : (
          <>
            <button
              type="button"
              className={styles.shareButton}
              onClick={handleTwitter}
            >
              Xでシェア
            </button>
            <button
              type="button"
              className={styles.shareButton}
              onClick={handleLine}
            >
              LINEでシェア
            </button>
            <button
              type="button"
              className={styles.shareButton}
              onClick={handleCopy}
            >
              結果をコピー
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

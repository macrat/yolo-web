"use client";

import { useState, useCallback } from "react";
import { trackShare } from "@/lib/analytics";
import styles from "./ShareButtons.module.css";

type SnsType = "x" | "line" | "hatena" | "copy";

interface ShareButtonsProps {
  url: string;
  title: string;
  sns?: SnsType[];
  /** Content type for GA4 share event tracking (e.g. "tool", "blog"). */
  contentType?: string;
  /** Content identifier for GA4 share event tracking. */
  contentId?: string;
}

const DEFAULT_SNS: SnsType[] = ["x", "line", "hatena", "copy"];

/**
 * Common share buttons for content pages (blog, tools, etc.).
 * Displays individual SNS share buttons with text labels.
 */
export default function ShareButtons({
  url,
  title,
  sns = DEFAULT_SNS,
  contentType,
  contentId,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getFullUrl = useCallback(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}${url}`;
  }, [url]);

  const handleShareX = useCallback(() => {
    const fullUrl = getFullUrl();
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`;
    window.open(intentUrl, "_blank", "noopener,noreferrer");
    if (contentType && contentId) {
      trackShare("twitter", contentType, contentId);
    }
  }, [title, getFullUrl, contentType, contentId]);

  const handleShareLine = useCallback(() => {
    const fullUrl = getFullUrl();
    const lineUrl = `https://line.me/R/share?text=${encodeURIComponent(title + "\n" + fullUrl)}`;
    window.open(lineUrl, "_blank", "noopener,noreferrer");
    if (contentType && contentId) {
      trackShare("line", contentType, contentId);
    }
  }, [title, getFullUrl, contentType, contentId]);

  const handleShareHatena = useCallback(() => {
    const fullUrl = getFullUrl();
    const hatenaUrl = `https://b.hatena.ne.jp/entry/panel/?url=${encodeURIComponent(fullUrl)}&btitle=${encodeURIComponent(title)}`;
    window.open(hatenaUrl, "_blank", "noopener,noreferrer");
    if (contentType && contentId) {
      trackShare("hatena", contentType, contentId);
    }
  }, [title, getFullUrl, contentType, contentId]);

  const handleCopy = useCallback(async () => {
    const fullUrl = getFullUrl();
    try {
      await navigator.clipboard.writeText(title + "\n" + fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (contentType && contentId) {
        trackShare("clipboard", contentType, contentId);
      }
    } catch {
      // Silently fail
    }
  }, [title, getFullUrl, contentType, contentId]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.buttons}>
        {sns.includes("x") && (
          <button
            type="button"
            className={`${styles.shareButton} ${styles.x}`}
            onClick={handleShareX}
          >
            X{"\u3067\u30B7\u30A7\u30A2"}
          </button>
        )}
        {sns.includes("line") && (
          <button
            type="button"
            className={`${styles.shareButton} ${styles.line}`}
            onClick={handleShareLine}
          >
            LINE{"\u3067\u30B7\u30A7\u30A2"}
          </button>
        )}
        {sns.includes("hatena") && (
          <button
            type="button"
            className={`${styles.shareButton} ${styles.hatena}`}
            onClick={handleShareHatena}
          >
            {"\u306F\u3066\u30D6"}
          </button>
        )}
        {sns.includes("copy") && (
          <button
            type="button"
            className={`${styles.shareButton} ${styles.copy}`}
            onClick={handleCopy}
          >
            {"\u30B3\u30D4\u30FC"}
          </button>
        )}
      </div>
      <div className={styles.copiedMessage} role="status" aria-live="polite">
        {copied ? "\u30B3\u30D4\u30FC\u3057\u307E\u3057\u305F!" : ""}
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import {
  copyToClipboard,
  generateTwitterShareUrl,
} from "@/lib/games/kanji-kanaru/share";
import styles from "./styles/KanjiKanaru.module.css";

interface ShareButtonsProps {
  shareText: string;
}

/**
 * Copy result and Share on X buttons for sharing game results.
 */
export default function ShareButtons({ shareText }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

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

  return (
    <div>
      <div className={styles.shareArea}>
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
      </div>
      <div className={styles.copiedMessage} role="status" aria-live="polite">
        {copied ? "コピーしました!" : ""}
      </div>
    </div>
  );
}

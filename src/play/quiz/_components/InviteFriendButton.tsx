"use client";

import { useState, useCallback } from "react";
import { trackShare } from "@/lib/analytics";
import styles from "./InviteFriendButton.module.css";

interface InviteFriendButtonProps {
  /** Quiz slug used to build the invite URL */
  quizSlug: string;
  /** The user's result type ID, used as the ref parameter */
  resultTypeId: string;
  /** Invite text shown when sharing */
  inviteText: string;
  /**
   * Canonical content id (via `contentIdForQuiz`) for GA4 share tracking
   * (cycle-280 B-551, surface="invite"). Optional and additive: callers that
   * do not pass it keep the prior no-tracking behaviour, so wiring can be
   * rolled out per surface without regressing untracked invite buttons.
   */
  contentId?: string;
}

/**
 * Button that generates a compatibility invite URL and copies it
 * to the clipboard, or uses the Web Share API on supported devices.
 */
export default function InviteFriendButton({
  quizSlug,
  resultTypeId,
  inviteText,
  contentId,
}: InviteFriendButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleInvite = useCallback(async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/play/${quizSlug}?ref=${resultTypeId}`
        : `/play/${quizSlug}?ref=${resultTypeId}`;

    const text = inviteText;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: text, url });
        // Count only a completed share, not a cancellation: navigator.share
        // rejects when the user dismisses the sheet, so reaching this line
        // means the share succeeded (B-551 success-only tracking).
        if (contentId) {
          trackShare("web_share", "diagnosis", contentId, "invite");
        }
        return;
      } catch {
        // User cancelled or share failed; fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      // Count only when the copy actually succeeded (writeText resolved).
      if (contentId) {
        trackShare("clipboard", "diagnosis", contentId, "invite");
      }
    } catch {
      // Silently fail
    }
  }, [quizSlug, resultTypeId, inviteText, contentId]);

  return (
    <div className={styles.wrapper}>
      <p className={styles.label}>友達との相性を調べてみよう</p>
      <button type="button" className={styles.button} onClick={handleInvite}>
        友達に診断を送る
      </button>
      <div className={styles.copiedMessage} role="status" aria-live="polite">
        {copied ? "リンクをコピーしました!" : ""}
      </div>
    </div>
  );
}

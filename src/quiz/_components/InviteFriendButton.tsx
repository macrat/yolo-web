"use client";

import { useState, useCallback } from "react";
import styles from "./InviteFriendButton.module.css";

interface InviteFriendButtonProps {
  /** Quiz slug used to build the invite URL */
  quizSlug: string;
  /** The user's result type ID, used as the ref parameter */
  resultTypeId: string;
  /** Invite text shown when sharing */
  inviteText: string;
}

/**
 * Button that generates a compatibility invite URL and copies it
 * to the clipboard, or uses the Web Share API on supported devices.
 */
export default function InviteFriendButton({
  quizSlug,
  resultTypeId,
  inviteText,
}: InviteFriendButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleInvite = useCallback(async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/quiz/${quizSlug}?ref=${resultTypeId}`
        : `/quiz/${quizSlug}?ref=${resultTypeId}`;

    const text = inviteText;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: text, url });
        return;
      } catch {
        // User cancelled or share failed; fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail
    }
  }, [quizSlug, resultTypeId, inviteText]);

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

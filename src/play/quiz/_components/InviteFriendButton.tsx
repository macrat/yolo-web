"use client";

import { useState, useCallback } from "react";
import { trackShare } from "@/lib/analytics";
import { copyText } from "@/lib/clipboard";
import Button from "@/components/Button";
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
   * (surface="invite"). When omitted, the invite is not tracked.
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
  // 写せた知らせは2秒で消し、写せなかった知らせは次に押すまで残す。
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

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
        // means the share succeeded.
        if (contentId) {
          trackShare("web_share", "diagnosis", contentId, "invite");
        }
        return;
      } catch {
        // User cancelled or share failed; fall through to clipboard
      }
    }

    setCopyStatus("idle");
    if (await copyText(`${text}\n${url}`)) {
      setCopyStatus("copied");
      setTimeout(
        () =>
          setCopyStatus((status) => (status === "copied" ? "idle" : status)),
        2000,
      );
      // Count only when the copy actually succeeded.
      if (contentId) {
        trackShare("clipboard", "diagnosis", contentId, "invite");
      }
    } else {
      setCopyStatus("failed");
    }
  }, [quizSlug, resultTypeId, inviteText, contentId]);

  return (
    <div className={styles.wrapper}>
      <p className={styles.label}>友達との相性を調べてみよう</p>
      <Button onClick={handleInvite}>友達に診断を送る</Button>
      <div className={styles.copiedMessage} role="status" aria-live="polite">
        {copyStatus === "copied"
          ? "リンクをコピーしました"
          : copyStatus === "failed"
            ? "リンクをコピーできませんでした"
            : ""}
      </div>
    </div>
  );
}

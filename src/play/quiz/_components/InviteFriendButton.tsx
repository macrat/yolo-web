"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  // 写せた知らせを消すタイマー。写し直すと前のタイマーを止めて2秒を数え直し、外したときも止める。
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (copiedTimerRef.current !== null) clearTimeout(copiedTimerRef.current);
    },
    [],
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
      } catch (error) {
        // The visitor closed the share sheet: they chose not to send, so do
        // nothing. Closing the sheet also uses up the press, so a copy after
        // it would fail on browsers that copy only within a press.
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        // Sharing failed for another reason; fall through to clipboard.
      }
    }

    if (copiedTimerRef.current !== null) {
      clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = null;
    }
    setCopyStatus("idle");
    if (await copyText(`${text}\n${url}`)) {
      setCopyStatus("copied");
      copiedTimerRef.current = setTimeout(() => {
        setCopyStatus("idle");
        copiedTimerRef.current = null;
      }, 2000);
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

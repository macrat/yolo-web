"use client";

import { useState, useEffect, useCallback } from "react";
import { isRated, markAsRated } from "@/humor-dict/_lib/rating-storage";
import { trackContentRating } from "@/lib/analytics";
import styles from "./EntryRatingButton.module.css";

interface EntryRatingButtonProps {
  slug: string;
}

/**
 * A "funny" reaction button for humor dictionary entries.
 *
 * - Uses localStorage (via rating-storage) to persist the rated state across
 *   page loads, initialized client-side only to avoid SSR hydration mismatches.
 * - Deliberately avoids `disabled` so the button remains accessible and
 *   focusable; duplicate actions are blocked via the `rated` guard in the
 *   click handler.
 * - Text-only label (no emoji, per DESIGN.md §8-6/§6: 見出し・ナビ・ボタンに絵文字を
 *   使わない). The selected state is conveyed by --accent-weak (状態のみ・§2) and label
 *   text change, not by decorative motion.
 */
export default function EntryRatingButton({ slug }: EntryRatingButtonProps) {
  const [rated, setRated] = useState(false);

  // Restore rated state from localStorage on the client only.
  // Starting with `false` avoids a hydration mismatch on SSR.
  // The setState call here intentionally synchronizes React state with
  // localStorage (an external system) after mount — a valid use of useEffect.
  useEffect(() => {
    if (isRated(slug)) {
      setRated(true); // eslint-disable-line react-hooks/set-state-in-effect -- Restore rating state from localStorage on mount
    }
  }, [slug]);

  const handleClick = useCallback(() => {
    // Guard against double-rating; the button intentionally has no `disabled`
    // attribute to keep it focusable and accessible.
    if (rated) return;
    markAsRated(slug);
    trackContentRating();
    setRated(true);
  }, [rated, slug]);

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.button}
        aria-pressed={rated}
        onClick={handleClick}
      >
        {rated ? "おもしろかった!" : "おもしろかった"}
      </button>
    </div>
  );
}

"use client";

/**
 * Toast notification component for newly unlocked achievements.
 *
 * Displays a brief notification in the bottom-right corner when a badge
 * is unlocked. Supports queue management for multiple simultaneous unlocks,
 * showing one at a time with a 4-second auto-dismiss timer.
 *
 * Accessibility: Uses aria-live="polite" for screen reader announcements.
 * Animation: Pure CSS transitions, respects prefers-reduced-motion.
 */

import { useCallback, useEffect, useReducer, useRef } from "react";
import { BADGE_DEFINITIONS } from "./badges";
import type { BadgeRank } from "./types";
import { useAchievements } from "./useAchievements";
import styles from "./AchievementToast.module.css";

/** Duration in ms before auto-dismissing the toast */
const AUTO_DISMISS_MS = 4000;

/** Duration in ms for the exit animation before removing from DOM */
const EXIT_ANIMATION_MS = 300;

/** Rank-specific icons for visual distinction */
const RANK_ICONS: Record<BadgeRank, string> = {
  bronze: "\uD83E\uDD49",
  silver: "\uD83E\uDD48",
  gold: "\uD83C\uDFC6",
};

interface ToastItem {
  badgeId: string;
  name: string;
  description: string;
  rank: BadgeRank;
}

/**
 * Resolves a badge ID to its display information from BADGE_DEFINITIONS.
 * Returns null if the badge ID is not found.
 */
function resolveToastItem(badgeId: string): ToastItem | null {
  const badge = BADGE_DEFINITIONS.find((b) => b.id === badgeId);
  if (!badge) return null;
  return {
    badgeId: badge.id,
    name: badge.name,
    description: badge.description,
    rank: badge.rank,
  };
}

// --- Reducer-based state management to avoid setState-in-effect ---

interface ToastState {
  queue: ToastItem[];
  current: ToastItem | null;
  exiting: boolean;
}

type ToastAction =
  | { type: "ENQUEUE"; items: ToastItem[] }
  | { type: "START_EXIT" }
  | { type: "FINISH_EXIT" };

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case "ENQUEUE": {
      // If nothing is currently showing, immediately display the first item
      if (state.current === null && action.items.length > 0) {
        const [first, ...rest] = action.items;
        return { ...state, current: first, queue: [...state.queue, ...rest] };
      }
      return { ...state, queue: [...state.queue, ...action.items] };
    }
    case "START_EXIT": {
      return { ...state, exiting: true };
    }
    case "FINISH_EXIT": {
      // After exit animation, show the next item from the queue
      if (state.queue.length > 0) {
        const [next, ...rest] = state.queue;
        return { current: next, queue: rest, exiting: false };
      }
      return { current: null, queue: [], exiting: false };
    }
    default:
      return state;
  }
}

const INITIAL_STATE: ToastState = {
  queue: [],
  current: null,
  exiting: false,
};

export default function AchievementToast() {
  const { newlyUnlocked, dismissNotifications } = useAchievements();
  const [state, dispatch] = useReducer(toastReducer, INITIAL_STATE);

  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When newlyUnlocked changes, resolve badge info and enqueue
  useEffect(() => {
    if (newlyUnlocked.length === 0) return;

    const items: ToastItem[] = [];
    for (const badgeId of newlyUnlocked) {
      const item = resolveToastItem(badgeId);
      if (item) {
        items.push(item);
      }
    }

    if (items.length > 0) {
      dispatch({ type: "ENQUEUE", items });
    }

    // Clear the newlyUnlocked state so they are not re-queued
    dismissNotifications();
  }, [newlyUnlocked, dismissNotifications]);

  /** Start the exit animation and schedule removal */
  const startExit = useCallback(() => {
    dispatch({ type: "START_EXIT" });
    exitTimerRef.current = setTimeout(() => {
      dispatch({ type: "FINISH_EXIT" });
    }, EXIT_ANIMATION_MS);
  }, []);

  // Auto-dismiss timer for the currently displayed toast.
  // Extract values to avoid ESLint false positive (state.current looks like a ref).
  const currentToast = state.current;
  const isExiting = state.exiting;
  useEffect(() => {
    if (currentToast === null || isExiting) return;

    dismissTimerRef.current = setTimeout(() => {
      startExit();
    }, AUTO_DISMISS_MS);

    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
    };
  }, [currentToast, isExiting, startExit]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  /** Handle manual dismiss by clicking the toast */
  const handleClick = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    startExit();
  }, [startExit]);

  if (!state.current) return null;

  const rankClass = styles[state.current.rank] ?? "";
  const toastClass = [
    styles.toast,
    rankClass,
    state.exiting ? styles.exiting : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.container} aria-live="polite" aria-atomic="true">
      <div
        className={toastClass}
        onClick={handleClick}
        role="status"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <span className={styles.icon} aria-hidden="true">
          {RANK_ICONS[state.current.rank]}
        </span>
        <div className={styles.content}>
          <span className={styles.label}>実績解除</span>
          <span className={styles.name}>{state.current.name}</span>
          <span className={styles.description}>
            {state.current.description}
          </span>
        </div>
      </div>
    </div>
  );
}

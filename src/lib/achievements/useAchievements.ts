/**
 * Custom hook for accessing achievement system state and actions.
 *
 * Provides the current achievement store, a function to record plays,
 * and notification state for newly unlocked badges.
 *
 * Must be used within an AchievementProvider.
 */

"use client";

import { useContext } from "react";
import { AchievementContext } from "./AchievementProvider";
import type { AchievementContextValue } from "./AchievementProvider";

/**
 * Access the achievement system context.
 *
 * @throws Error if used outside of AchievementProvider
 * @returns The achievement context value
 */
export function useAchievements(): AchievementContextValue {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error(
      "useAchievements must be used within an AchievementProvider",
    );
  }
  return context;
}

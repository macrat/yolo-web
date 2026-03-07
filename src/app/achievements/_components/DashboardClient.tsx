"use client";

/**
 * DashboardClient - client-side achievements dashboard UI.
 *
 * Reads from the achievement store via useAchievements hook.
 * Displays a loading skeleton when the store has not yet initialized
 * (SSR or before hydration) to avoid hydration mismatch.
 */

import { useAchievements } from "@/lib/achievements/useAchievements";
import { getTodayJst } from "@/lib/achievements/date";
import StreakDisplay from "./StreakDisplay";
import DailyProgress from "./DailyProgress";
import BadgeList from "./BadgeList";
import StatsSection from "./StatsSection";
import styles from "./DashboardClient.module.css";

export default function DashboardClient() {
  const { store } = useAchievements();

  // Before client-side initialization, show loading state
  if (!store) {
    return (
      <div className={styles.loading} role="status" aria-label="読み込み中">
        <p className={styles.loadingText}>データを読み込み中...</p>
      </div>
    );
  }

  const today = getTodayJst();

  return (
    <div className={styles.dashboard}>
      <StreakDisplay store={store} />
      <DailyProgress store={store} today={today} />
      <BadgeList store={store} />
      <StatsSection store={store} />
    </div>
  );
}

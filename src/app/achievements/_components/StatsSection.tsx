/**
 * StatsSection - displays overall usage statistics.
 *
 * Shows total days played, total content used count, and
 * cumulative play count across all content.
 */

import type { AchievementStore } from "@/lib/achievements/types";
import styles from "./StatsSection.module.css";

interface StatsSectionProps {
  store: AchievementStore;
}

/** Calculate total play count across all content types */
function getTotalPlayCount(store: AchievementStore): number {
  return Object.values(store.totalStats.perContent).reduce(
    (sum, stat) => sum + stat.count,
    0,
  );
}

export default function StatsSection({ store }: StatsSectionProps) {
  const totalPlayCount = getTotalPlayCount(store);

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>統計</h2>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>
            {store.totalStats.totalDaysPlayed}
          </span>
          <span className={styles.statLabel}>累計利用日数</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>
            {store.totalStats.totalContentUsed}
          </span>
          <span className={styles.statLabel}>遊んだコンテンツ数</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{totalPlayCount}</span>
          <span className={styles.statLabel}>累計利用回数</span>
        </div>
      </div>
    </section>
  );
}

"use client";

import type { YojiGameStats } from "@/lib/games/yoji-kimeru/types";
import GameDialog from "@/components/games/shared/GameDialog";
import styles from "./styles/YojiKimeru.module.css";

interface StatsModalProps {
  open: boolean;
  onClose: () => void;
  stats: YojiGameStats;
  lastGuessCount?: number;
}

/**
 * Modal showing game statistics: games played, win rate, streaks,
 * and guess distribution histogram.
 * Uses the shared GameDialog component.
 */
export default function StatsModal({
  open,
  onClose,
  stats,
  lastGuessCount,
}: StatsModalProps) {
  const winRate =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;

  const maxDistribution = Math.max(...stats.guessDistribution, 1);

  return (
    <GameDialog
      open={open}
      onClose={onClose}
      titleId="yoji-kimeru-stats-title"
      title={"\u7D71\u8A08"}
    >
      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{stats.gamesPlayed}</div>
          <div className={styles.statLabel}>
            {"\u30D7\u30EC\u30A4\u56DE\u6570"}
          </div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{winRate}%</div>
          <div className={styles.statLabel}>{"\u52DD\u7387"}</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{stats.currentStreak}</div>
          <div className={styles.statLabel}>
            {"\u73FE\u5728\u306E\u9023\u52DD"}
          </div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{stats.maxStreak}</div>
          <div className={styles.statLabel}>{"\u6700\u9577\u9023\u52DD"}</div>
        </div>
      </div>
      <div className={styles.distributionTitle}>
        {"\u63A8\u6E2C\u56DE\u6570\u306E\u5206\u5E03:"}
      </div>
      {stats.guessDistribution.map((count, i) => {
        const barWidth = Math.max(
          (count / maxDistribution) * 100,
          count > 0 ? 8 : 4,
        );
        const isHighlight =
          lastGuessCount !== undefined && lastGuessCount === i + 1;
        return (
          <div key={i} className={styles.distributionRow}>
            <div className={styles.distributionLabel}>{i + 1}</div>
            <div
              className={
                isHighlight
                  ? styles.distributionBarHighlight
                  : styles.distributionBar
              }
              style={{ width: `${barWidth}%` }}
            >
              {count}
            </div>
          </div>
        );
      })}
    </GameDialog>
  );
}

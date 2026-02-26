"use client";

import type { NakamawakeGameStats } from "@/games/nakamawake/_lib/types";
import GameDialog from "@/games/shared/_components/GameDialog";
import styles from "./StatsModal.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  stats: NakamawakeGameStats;
}

/**
 * Modal showing game statistics: games played, win rate, streaks,
 * and mistake distribution histogram.
 * Uses the shared GameDialog component.
 */
export default function StatsModal({ open, onClose, stats }: Props) {
  const winRate =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;

  const maxDistribution = Math.max(...stats.mistakeDistribution, 1);

  const mistakeLabels = [
    "0\u30DF\u30B9",
    "1\u30DF\u30B9",
    "2\u30DF\u30B9",
    "3\u30DF\u30B9",
    "4\u30DF\u30B9",
  ];

  return (
    <GameDialog
      open={open}
      onClose={onClose}
      titleId="nakamawake-stats-title"
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
        {"\u30DF\u30B9\u56DE\u6570\u306E\u5206\u5E03:"}
      </div>
      {stats.mistakeDistribution.map((count, i) => {
        const barWidth = Math.max(
          (count / maxDistribution) * 100,
          count > 0 ? 8 : 4,
        );
        return (
          <div key={i} className={styles.distributionRow}>
            <div className={styles.distributionLabel}>{mistakeLabels[i]}</div>
            <div
              className={styles.distributionBar}
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

"use client";

import type { IrodoriGameStats } from "@/lib/games/irodori/types";
import GameDialog from "@/components/games/shared/GameDialog";
import styles from "./StatsModal.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  stats: IrodoriGameStats;
}

const SCORE_LABELS = [
  "0-9",
  "10-19",
  "20-29",
  "30-39",
  "40-49",
  "50-59",
  "60-69",
  "70-79",
  "80-89",
  "90-100",
];

/**
 * Modal showing game statistics: games played, average score, best score,
 * streaks, and score distribution histogram.
 */
export default function StatsModal({ open, onClose, stats }: Props) {
  const maxDistribution = Math.max(...stats.scoreDistribution, 1);

  return (
    <GameDialog
      open={open}
      onClose={onClose}
      titleId="irodori-stats-title"
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
          <div className={styles.statValue}>
            {Math.round(stats.averageScore)}
          </div>
          <div className={styles.statLabel}>
            {"\u5E73\u5747\u30B9\u30B3\u30A2"}
          </div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{stats.bestScore}</div>
          <div className={styles.statLabel}>
            {"\u6700\u9AD8\u30B9\u30B3\u30A2"}
          </div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{stats.currentStreak}</div>
          <div className={styles.statLabel}>
            {"\u9023\u7D9A\u30D7\u30EC\u30A4"}
          </div>
        </div>
      </div>
      <div className={styles.distributionTitle}>
        {"\u30B9\u30B3\u30A2\u5206\u5E03:"}
      </div>
      {stats.scoreDistribution.map((count, i) => {
        const barWidth = Math.max(
          (count / maxDistribution) * 100,
          count > 0 ? 8 : 4,
        );
        return (
          <div key={i} className={styles.distributionRow}>
            <div className={styles.distributionLabel}>{SCORE_LABELS[i]}</div>
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

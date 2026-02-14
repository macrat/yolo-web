"use client";

import { useRef, useEffect, useCallback } from "react";
import type { NakamawakeGameStats } from "@/lib/games/nakamawake/types";
import styles from "./StatsModal.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  stats: NakamawakeGameStats;
}

/**
 * Modal showing game statistics: games played, win rate, streaks,
 * and mistake distribution histogram.
 * Uses the native <dialog> element.
 */
export default function StatsModal({ open, onClose, stats }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

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
    <dialog
      ref={dialogRef}
      className={styles.modal}
      onClose={handleClose}
      aria-labelledby="nakamawake-stats-title"
    >
      <h2 id="nakamawake-stats-title" className={styles.modalTitle}>
        {"\u7D71\u8A08"}
      </h2>
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
      <button className={styles.modalClose} onClick={handleClose} type="button">
        {"\u9589\u3058\u308B"}
      </button>
    </dialog>
  );
}

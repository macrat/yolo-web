"use client";

import { useRef, useEffect, useCallback } from "react";
import type { IrodoriGameStats } from "@/lib/games/irodori/types";
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

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        onClose();
      }
    },
    [onClose],
  );

  const maxDistribution = Math.max(...stats.scoreDistribution, 1);

  return (
    <dialog
      ref={dialogRef}
      className={styles.modal}
      onClose={handleClose}
      onClick={handleBackdropClick}
      aria-labelledby="irodori-stats-title"
    >
      <h2 id="irodori-stats-title" className={styles.modalTitle}>
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
      <button className={styles.modalClose} onClick={handleClose} type="button">
        {"\u9589\u3058\u308B"}
      </button>
    </dialog>
  );
}

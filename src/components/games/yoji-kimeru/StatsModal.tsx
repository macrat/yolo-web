"use client";

import { useRef, useEffect, useCallback } from "react";
import type { YojiGameStats } from "@/lib/games/yoji-kimeru/types";
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
 * Uses the native <dialog> element.
 */
export default function StatsModal({
  open,
  onClose,
  stats,
  lastGuessCount,
}: StatsModalProps) {
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

  const maxDistribution = Math.max(...stats.guessDistribution, 1);

  return (
    <dialog
      ref={dialogRef}
      className={styles.modal}
      onClose={handleClose}
      aria-labelledby="stats-title"
    >
      <h2 id="stats-title" className={styles.modalTitle}>
        統計
      </h2>
      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{stats.gamesPlayed}</div>
          <div className={styles.statLabel}>プレイ回数</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{winRate}%</div>
          <div className={styles.statLabel}>勝率</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{stats.currentStreak}</div>
          <div className={styles.statLabel}>現在の連勝</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{stats.maxStreak}</div>
          <div className={styles.statLabel}>最長連勝</div>
        </div>
      </div>
      <div className={styles.distributionTitle}>推測回数の分布:</div>
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
      <button className={styles.modalClose} onClick={handleClose} type="button">
        閉じる
      </button>
    </dialog>
  );
}

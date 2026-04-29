/**
 * StreakDisplay - shows current and longest streak information.
 *
 * Part of the achievements dashboard. Displays the user's
 * current consecutive-day streak and their all-time longest streak.
 */

import type { AchievementStore } from "@/lib/achievements/types";
import styles from "./StreakDisplay.module.css";

interface StreakDisplayProps {
  store: AchievementStore;
}

export default function StreakDisplay({ store }: StreakDisplayProps) {
  const { current, longest } = store.streak;

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>ストリーク</h2>
      <div className={styles.streakRow}>
        <div className={styles.streakItem}>
          <span className={styles.streakIcon} aria-hidden="true">
            <svg
              width="24"
              height="24"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 1C8 1 3 5.5 3 9.5C3 12.5 5.2 15 8 15C10.8 15 13 12.5 13 9.5C13 5.5 8 1 8 1ZM8 13.5C6.1 13.5 4.5 11.9 4.5 9.5C4.5 7 7 4 8 2.8C9 4 11.5 7 11.5 9.5C11.5 11.9 9.9 13.5 8 13.5Z"
                fill="currentColor"
              />
              <path
                d="M8 12C7 12 6 11.1 6 9.8C6 8.5 7.5 6.5 8 6C8.5 6.5 10 8.5 10 9.8C10 11.1 9 12 8 12Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <div className={styles.streakDetail}>
            <span className={styles.streakLabel}>現在</span>
            <span className={styles.streakValue}>
              {current}
              <span className={styles.streakUnit}>日</span>
            </span>
          </div>
        </div>
        <div className={styles.divider} aria-hidden="true" />
        <div className={styles.streakItem}>
          <span
            className={`${styles.streakIcon} ${styles.longestIcon}`}
            aria-hidden="true"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <div className={styles.streakDetail}>
            <span className={styles.streakLabel}>最長記録</span>
            <span className={styles.streakValue}>
              {longest}
              <span className={styles.streakUnit}>日</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

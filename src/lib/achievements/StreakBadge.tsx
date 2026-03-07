"use client";

/**
 * StreakBadge - displays the current streak count in the header.
 *
 * Shows a fire icon with the streak number. Hidden when:
 * - Store is not yet initialized (SSR / before hydration)
 * - Current streak is 0
 *
 * Clicking navigates to /achievements dashboard.
 */

import Link from "next/link";
import { useAchievements } from "./useAchievements";
import styles from "./StreakBadge.module.css";

export default function StreakBadge() {
  const { store } = useAchievements();

  // Hide during SSR (store is null) or when streak is 0
  if (!store || store.streak.current === 0) {
    return null;
  }

  return (
    <Link
      href="/achievements"
      className={styles.badge}
      aria-label={`${store.streak.current}日連続利用中 - 実績ダッシュボードを見る`}
      title="実績ダッシュボード"
    >
      <svg
        className={styles.icon}
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
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
      <span className={styles.count}>{store.streak.current}</span>
    </Link>
  );
}

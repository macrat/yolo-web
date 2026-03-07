/**
 * DailyProgress - shows today's content usage status.
 *
 * Displays a grid of all 9 content types with visual indicators
 * for which ones the user has used today. Shows an encouraging
 * message about remaining content.
 */

import type { AchievementStore } from "@/lib/achievements/types";
import { ALL_CONTENT_IDS } from "@/lib/achievements/badges";
import { getContentDisplayName } from "./content-names";
import styles from "./DailyProgress.module.css";

interface DailyProgressProps {
  store: AchievementStore;
  today: string;
}

export default function DailyProgress({ store, today }: DailyProgressProps) {
  const todayEntry = store.dailyProgress[today] ?? {};
  const usedCount = ALL_CONTENT_IDS.filter((id) => todayEntry[id]).length;
  const remaining = ALL_CONTENT_IDS.length - usedCount;

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>今日の進捗</h2>
      <div className={styles.grid}>
        {ALL_CONTENT_IDS.map((id) => {
          const used = !!todayEntry[id];
          return (
            <div
              key={id}
              className={`${styles.item} ${used ? styles.used : styles.unused}`}
            >
              <span className={styles.indicator} aria-hidden="true">
                {used ? "\u2713" : "\u25CB"}
              </span>
              <span className={styles.name}>{getContentDisplayName(id)}</span>
            </div>
          );
        })}
      </div>
      {remaining > 0 ? (
        <p className={styles.message}>
          {remaining === ALL_CONTENT_IDS.length
            ? "今日はまだコンテンツを利用していません"
            : `あと${remaining}つで今日の全コンプリート!`}
        </p>
      ) : (
        <p className={`${styles.message} ${styles.complete}`}>
          今日は全コンテンツをコンプリートしました!
        </p>
      )}
    </section>
  );
}

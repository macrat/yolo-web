/**
 * BadgeList - displays all badges grouped by unlock status.
 *
 * Shows unlocked badges first, followed by locked badges.
 * Includes a summary counter of unlocked/total badges.
 */

import type { AchievementStore } from "@/lib/achievements/types";
import { BADGE_DEFINITIONS } from "@/lib/achievements/badges";
import BadgeCard from "./BadgeCard";
import styles from "./BadgeList.module.css";

interface BadgeListProps {
  store: AchievementStore;
}

export default function BadgeList({ store }: BadgeListProps) {
  const unlockedCount = Object.keys(store.achievements).length;
  const totalCount = BADGE_DEFINITIONS.length;

  // Sort badges so unlocked ones appear first for a sense of achievement
  const sortedBadges = [...BADGE_DEFINITIONS].sort((a, b) => {
    const aUnlocked = a.id in store.achievements;
    const bUnlocked = b.id in store.achievements;
    if (aUnlocked === bUnlocked) return 0;
    return aUnlocked ? -1 : 1;
  });

  return (
    <section className={styles.section}>
      <div className={styles.headerRow}>
        <h2 className={styles.heading}>バッジ一覧</h2>
        <span className={styles.counter}>
          {unlockedCount} / {totalCount}
        </span>
      </div>
      <div className={styles.grid}>
        {sortedBadges.map((badge) => {
          const achievement = store.achievements[badge.id];
          return (
            <BadgeCard
              key={badge.id}
              name={badge.name}
              description={badge.description}
              rank={badge.rank}
              unlocked={!!achievement}
              unlockedAt={achievement?.unlockedAt}
            />
          );
        })}
      </div>
    </section>
  );
}

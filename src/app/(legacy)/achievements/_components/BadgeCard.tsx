/**
 * BadgeCard - displays a single badge with its unlock status.
 *
 * Shows badge name, description, and rank. Unlocked badges are
 * visually distinct with rank-specific accent colors, while
 * locked badges appear dimmed.
 */

import type { BadgeRank } from "@/lib/achievements/types";
import styles from "./BadgeCard.module.css";

/** Rank-specific icons for visual distinction */
const RANK_ICONS: Record<BadgeRank, string> = {
  bronze: "\uD83E\uDD49",
  silver: "\uD83E\uDD48",
  gold: "\uD83C\uDFC6",
};

/** Rank display names */
const RANK_LABELS: Record<BadgeRank, string> = {
  bronze: "ブロンズ",
  silver: "シルバー",
  gold: "ゴールド",
};

interface BadgeCardProps {
  name: string;
  description: string;
  rank: BadgeRank;
  unlocked: boolean;
  unlockedAt?: string;
}

export default function BadgeCard({
  name,
  description,
  rank,
  unlocked,
  unlockedAt,
}: BadgeCardProps) {
  const rankClass = styles[rank] ?? "";
  const statusClass = unlocked ? styles.unlocked : styles.locked;
  const cardClass = [styles.card, rankClass, statusClass]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClass}>
      <div className={styles.iconArea}>
        <span className={styles.icon} aria-hidden="true">
          {unlocked ? RANK_ICONS[rank] : "\uD83D\uDD12"}
        </span>
      </div>
      <div className={styles.info}>
        <span className={styles.name}>{name}</span>
        <span className={styles.description}>{description}</span>
        <span className={styles.rankLabel}>{RANK_LABELS[rank]}</span>
      </div>
      {unlocked && unlockedAt && (
        <span className={styles.date}>{formatUnlockDate(unlockedAt)}</span>
      )}
    </div>
  );
}

/** Format ISO 8601 date to a short Japanese date string */
function formatUnlockDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return "";
    const formatter = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      month: "short",
      day: "numeric",
    });
    return formatter.format(date);
  } catch {
    return "";
  }
}

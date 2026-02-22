"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import {
  getAllGameStatus,
  type GamePlayStatus,
} from "@/lib/games/shared/crossGameProgress";
import { allGameMetas } from "@/lib/games/registry";
import styles from "./NextGameBanner.module.css";

interface NextGameBannerProps {
  currentGameSlug: string;
}

/**
 * External store for game play statuses.
 * Reads from localStorage once on mount; does not auto-refresh.
 */
let cachedStatuses: GamePlayStatus[] = [];
let statusListeners: Array<() => void> = [];
let initialized = false;

function subscribeStatuses(callback: () => void): () => void {
  statusListeners.push(callback);
  if (!initialized) {
    initialized = true;
    cachedStatuses = getAllGameStatus();
    for (const listener of statusListeners) {
      listener();
    }
  }
  return () => {
    statusListeners = statusListeners.filter((l) => l !== callback);
    if (statusListeners.length === 0) {
      initialized = false;
    }
  };
}

function getStatusSnapshot(): GamePlayStatus[] {
  return cachedStatuses;
}

function getStatusServerSnapshot(): GamePlayStatus[] {
  return [];
}

/**
 * Banner showing other game suggestions after completing a game.
 * Highlights unplayed games and shows daily progress.
 */
export default function NextGameBanner({
  currentGameSlug,
}: NextGameBannerProps) {
  const statuses = useSyncExternalStore(
    subscribeStatuses,
    getStatusSnapshot,
    getStatusServerSnapshot,
  );

  if (statuses.length === 0) return null;

  const otherGames = statuses.filter((s) => s.game.slug !== currentGameSlug);
  const playedCount = statuses.filter((s) => s.playedToday).length;
  const totalCount = allGameMetas.length;
  const allComplete = playedCount === totalCount;

  return (
    <div className={styles.container}>
      <div className={styles.progress}>
        {allComplete
          ? "今日のパズル 完全制覇!"
          : `今日のパズル ${playedCount}/${totalCount} クリア`}
      </div>
      {!allComplete && (
        <div className={styles.gameList}>
          {otherGames.map(({ game, playedToday }) => (
            <Link
              key={game.slug}
              href={game.path}
              className={`${styles.gameLink} ${
                playedToday ? styles.played : styles.unplayed
              }`}
            >
              <span className={styles.gameTitle}>{game.title}</span>
              <span className={styles.gameStatus}>
                {playedToday ? "クリア済" : "未プレイ"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

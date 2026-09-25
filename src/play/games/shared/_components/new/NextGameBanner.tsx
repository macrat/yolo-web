"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import {
  getAllGameStatus,
  ALL_GAMES,
  type GamePlayStatus,
} from "@/play/games/shared/_lib/crossGameProgress";
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

// Stable empty reference for the server snapshot. useSyncExternalStore requires
// getServerSnapshot to return a cached (referentially stable) value; a fresh `[]`
// literal each call trips React's "getServerSnapshot should be cached to avoid an
// infinite loop" warning. See React docs on useSyncExternalStore server snapshots.
const EMPTY_STATUSES: GamePlayStatus[] = [];

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
  return EMPTY_STATUSES;
}

/**
 * ゲームを終えたあとに、ほかのデイリーゲームを1行1項目の一覧で出す（§7）。今日の進み具合と、各ゲームを
 * 今日遊んだかどうかを文字で示す。
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
  // デイリーゲームの総数（ランダム出題型ゲームは含まない）
  const totalCount = ALL_GAMES.length;
  const allComplete = playedCount === totalCount;

  return (
    <div className={styles.container}>
      <div className={styles.progress}>
        {allComplete
          ? "今日のパズル 完全制覇!"
          : `今日のパズル ${playedCount}/${totalCount} クリア`}
      </div>
      {!allComplete && (
        <ul className={styles.gameList} data-text-box="rows">
          {otherGames.map(({ game, playedToday }) => (
            <li key={game.slug} className={styles.row}>
              <Link
                href={game.path}
                className={styles.gameLink}
                data-hit-area="after"
              >
                <span className={styles.gameTitle}>{game.title}</span>
              </Link>
              <span className={styles.gameStatus}>
                {playedToday ? "クリア済" : "未プレイ"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

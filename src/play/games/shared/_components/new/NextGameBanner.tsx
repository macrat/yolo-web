"use client";

import { useId, useSyncExternalStore } from "react";
import ItemList, { type ItemListItem } from "@/components/ItemList";
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
 * ゲームを終えたダイアログで、今日の進み具合と、ほかのデイリーゲームを並べる。
 * 今日遊んだゲームの行は、補助情報でそれを言う。
 */
export default function NextGameBanner({
  currentGameSlug,
}: NextGameBannerProps) {
  const progressId = useId();
  const statuses = useSyncExternalStore(
    subscribeStatuses,
    getStatusSnapshot,
    getStatusServerSnapshot,
  );

  if (statuses.length === 0) return null;

  const playedCount = statuses.filter((s) => s.playedToday).length;
  // デイリーゲームの総数（ランダム出題型ゲームは含まない）
  const totalCount = ALL_GAMES.length;
  const allComplete = playedCount === totalCount;
  const otherGames: ItemListItem[] = statuses
    .filter((s) => s.game.slug !== currentGameSlug)
    .map(({ game, playedToday }) => ({
      name: game.title,
      href: game.path,
      facts: playedToday ? [{ text: "今日は遊んだ" }] : undefined,
    }));

  return (
    <div className={styles.container}>
      <p id={progressId} className={styles.progress}>
        {allComplete
          ? "今日のパズル 完全制覇!"
          : `今日のパズル ${playedCount}/${totalCount} クリア`}
      </p>
      {!allComplete && (
        // ダイアログの枠と二重にならないよう、一覧はボックスを持たない。
        <ItemList labelledBy={progressId} items={otherGames} boxed={false} />
      )}
    </div>
  );
}

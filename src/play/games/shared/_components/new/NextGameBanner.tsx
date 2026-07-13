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
 * Banner showing other game suggestions after completing a game
 * （(new) デザイン体系版。legacy 版は廃止済みで、本ファイルが唯一の実装）.
 * Highlights unplayed games and shows daily progress.
 *
 * cycle-268 で legacy 版（廃止済み）から CSS のみ差し替え:
 * 未プレイ強調の青ボタン（--color-primary + #fff）を無彩の austere（反転塗り）へ、
 * 中央寄せ撤去、新トークン化。
 * cycle-279 でさらに店構えへ再移行し、反転塗りも撤去——未プレイは
 * var(--accent) の罫+文字のみで示す（背景は塗らない）。ロジックは不変。
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

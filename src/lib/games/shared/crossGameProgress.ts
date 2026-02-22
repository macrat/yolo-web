/**
 * Cross-game progress tracker.
 * Reads each game's localStorage stats to determine today's play status.
 */

import type { GameMeta } from "../types";
import { allGameMetas, getGamePath } from "../registry";

/** Game info with derived path, used by progress tracking and NextGameBanner */
export interface GameInfo {
  slug: string;
  title: string;
  path: string;
  statsKey: string;
}

/** All games as GameInfo (derived from registry) */
export const ALL_GAMES: GameInfo[] = allGameMetas.map(
  (meta: GameMeta): GameInfo => ({
    slug: meta.slug,
    title: meta.title,
    path: getGamePath(meta.slug),
    statsKey: meta.statsKey,
  }),
);

/**
 * Get today's date string in JST (YYYY-MM-DD).
 * Uses Intl.DateTimeFormat with Asia/Tokyo timezone for consistency
 * with each game's daily.ts formatDateJST() implementation.
 */
export function getTodayJst(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // en-CA locale outputs YYYY-MM-DD format
  return formatter.format(new Date());
}

export interface GamePlayStatus {
  game: GameInfo;
  playedToday: boolean;
}

/**
 * Check play status of all games for today.
 * Reads each game's stats from localStorage and checks lastPlayedDate.
 */
export function getAllGameStatus(): GamePlayStatus[] {
  if (typeof window === "undefined") {
    return ALL_GAMES.map((game) => ({ game, playedToday: false }));
  }

  const today = getTodayJst();
  return ALL_GAMES.map((game) => {
    try {
      const raw = window.localStorage.getItem(game.statsKey);
      if (!raw) return { game, playedToday: false };
      const stats = JSON.parse(raw);
      return {
        game,
        playedToday: stats.lastPlayedDate === today,
      };
    } catch {
      return { game, playedToday: false };
    }
  });
}

/**
 * Count how many games have been played today.
 */
export function getPlayedCount(): number {
  return getAllGameStatus().filter((s) => s.playedToday).length;
}

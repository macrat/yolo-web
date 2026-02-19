/**
 * Cross-game progress tracker.
 * Reads each game's localStorage stats to determine today's play status.
 */

export interface GameInfo {
  slug: string;
  title: string;
  path: string;
  statsKey: string;
}

export const ALL_GAMES: GameInfo[] = [
  {
    slug: "kanji-kanaru",
    title: "漢字カナール",
    path: "/games/kanji-kanaru",
    statsKey: "kanji-kanaru-stats",
  },
  {
    slug: "yoji-kimeru",
    title: "四字キメル",
    path: "/games/yoji-kimeru",
    statsKey: "yoji-kimeru-stats",
  },
  {
    slug: "nakamawake",
    title: "ナカマワケ",
    path: "/games/nakamawake",
    statsKey: "nakamawake-stats",
  },
  {
    slug: "irodori",
    title: "イロドリ",
    path: "/games/irodori",
    statsKey: "irodori-stats",
  },
];

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

"use client";

import { useId, useSyncExternalStore } from "react";
import ItemList, { type ItemListItem } from "@/components/ItemList";
import PhrasedText from "@/components/PhrasedText";
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
 * 今日の遊んだかどうかの記録（端末の記録）を読む外の置き場。描くたびには読み直さない。
 * 最初に描くときに読むので、ブラウザで新しく描くとき（解き終えて結果が出たとき・開き直した回の結果）も、
 * 1回目の描画から並びが出て、あとから並びが現れて下のものを押し下げることがない。
 */
let cachedStatuses: GamePlayStatus[] = [];
let statusListeners: Array<() => void> = [];
let initialized = false;

// Stable empty reference for the server snapshot. useSyncExternalStore requires
// getServerSnapshot to return a cached (referentially stable) value; a fresh `[]`
// literal each call trips React's "getServerSnapshot should be cached to avoid an
// infinite loop" warning. See React docs on useSyncExternalStore server snapshots.
const EMPTY_STATUSES: GamePlayStatus[] = [];

/** まだ読んでいなければ、端末の記録を読む。読んだら true を返す。 */
function loadStatusesOnce(): boolean {
  if (initialized) return false;
  initialized = true;
  cachedStatuses = getAllGameStatus();
  return true;
}

function subscribeStatuses(callback: () => void): () => void {
  statusListeners.push(callback);
  // 水和で描いたとき（サーバーの空の並びを引き継いだとき）は、ここで読んで知らせる。
  if (loadStatusesOnce()) {
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
  loadStatusesOnce();
  return cachedStatuses;
}

function getStatusServerSnapshot(): GamePlayStatus[] {
  return EMPTY_STATUSES;
}

/** 進みの行。数えているのは遊んだかどうか（勝ち負けを問わない）なので、「遊んだ」と言う。 */
function progressText(playedCount: number, totalCount: number): string {
  return playedCount === totalCount
    ? `今日の${totalCount}本をすべて遊びました`
    : `今日は${totalCount}本のうち${playedCount}本を遊びました`;
}

/**
 * ゲームを解き終えた結果に続く小見出し「今日のほかのパズル」の区画。今日の進み具合と、ほかのデイリーゲームを
 * 並べる。今日遊んだゲームの行は、補助情報でそれを言う。すべて遊んだ日は、進みの行だけを置く。
 */
export default function NextGameBanner({
  currentGameSlug,
}: NextGameBannerProps) {
  const headingId = useId();
  const statuses = useSyncExternalStore(
    subscribeStatuses,
    getStatusSnapshot,
    getStatusServerSnapshot,
  );

  if (statuses.length === 0) return null;

  const playedCount = statuses.filter((s) => s.playedToday).length;
  // デイリーゲームの総数（ランダム出題型ゲームは含まない）
  const totalCount = ALL_GAMES.length;
  const otherGames: ItemListItem[] = statuses
    .filter((s) => s.game.slug !== currentGameSlug)
    .map(({ game, playedToday }) => ({
      name: game.title,
      href: game.path,
      facts: playedToday ? [{ text: "今日は遊んだ" }] : undefined,
    }));

  return (
    <section className={styles.nextGames} aria-labelledby={headingId}>
      <PhrasedText
        as="h2"
        id={headingId}
        className={styles.heading}
        phrases={["今日の", "ほかの", "パズル"]}
      />
      <p className={styles.progress}>{progressText(playedCount, totalCount)}</p>
      {playedCount < totalCount && (
        <ItemList labelledBy={headingId} items={otherGames} />
      )}
    </section>
  );
}

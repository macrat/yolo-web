/**
 * 今日の運勢のストア（useSyncExternalStore の形）。
 *
 * 運勢は来訪者の端末に残した種と日本時間の日付で決まる。日付ごとに1回だけ選んで同じ値を返し、
 * 日本時間の日付が変わったら選び直す。ページを開いたまま日付をまたいだ来訪者にも今日の運勢が出るよう、
 * 購読のあいだは次の日本時間の 0 時と、タブが見えるようになったときに購読者へ知らせる。裏のタブでは
 * タイマーが遅れて届くことがあるので、見えたときにも知らせる。
 */

import { getUserSeed, selectFortune } from "@/play/fortune/logic";
import { getTodayJst } from "@/play/games/shared/_lib/crossGameProgress";
import type { DailyFortuneEntry } from "@/play/fortune/types";

export type FortuneState = { fortune: DailyFortuneEntry; today: string } | null;

const DAY_MS = 24 * 60 * 60 * 1000;
/** 日本時間は UTC より9時間進み、夏時間を持たない。 */
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * 選んだ運勢と、それを選んだ日付。useSyncExternalStore は、何も変わっていないあいだ同じ参照を返すことを
 * 求める（返すたびに新しい値だと描き直しが止まらない）。
 */
let fortuneCache: FortuneState = null;
let fortuneListeners: Array<() => void> = [];
let midnightTimer: ReturnType<typeof setTimeout> | undefined;

/** いまから次の日本時間の 0 時までのミリ秒。 */
export function msUntilNextJstMidnight(now: number): number {
  return DAY_MS - ((now + JST_OFFSET_MS) % DAY_MS);
}

function notifyListeners(): void {
  for (const listener of fortuneListeners) listener();
}

function scheduleMidnight(): void {
  clearTimeout(midnightTimer);
  midnightTimer = setTimeout(() => {
    notifyListeners();
    scheduleMidnight();
  }, msUntilNextJstMidnight(Date.now()));
}

function handleVisibilityChange(): void {
  if (document.visibilityState === "visible") notifyListeners();
}

function startWatchingDate(): void {
  scheduleMidnight();
  document.addEventListener("visibilitychange", handleVisibilityChange);
}

function stopWatchingDate(): void {
  clearTimeout(midnightTimer);
  midnightTimer = undefined;
  document.removeEventListener("visibilitychange", handleVisibilityChange);
}

/** 購読する。最初の購読で日付の見張りを始め、最後の購読の解除で止める。 */
export function subscribeFortuneStore(callback: () => void): () => void {
  if (fortuneListeners.length === 0) startWatchingDate();
  fortuneListeners.push(callback);
  return () => {
    fortuneListeners = fortuneListeners.filter((l) => l !== callback);
    if (fortuneListeners.length === 0) stopWatchingDate();
  };
}

/** ブラウザでの値。今日の日本時間の日付で選んだ運勢を返し、日付が変わっていたら選び直す。 */
export function getFortuneSnapshot(): FortuneState {
  const today = getTodayJst();
  if (fortuneCache !== null && fortuneCache.today === today)
    return fortuneCache;
  if (typeof window === "undefined") return null;
  const userSeed = getUserSeed();
  if (userSeed === null) return null;
  fortuneCache = { fortune: selectFortune(today, userSeed), today };
  return fortuneCache;
}

/**
 * サーバーでの値。運勢は端末の種で決まるので、サーバーとブラウザの最初の描画では null にし、
 * 両方の描画をそろえる。
 */
export function getFortuneServerSnapshot(): FortuneState {
  return null;
}

/** テストのあいだで状態を持ち越さないよう、選んだ運勢と購読と日付の見張りを捨てる。 */
export function resetFortuneCache(): void {
  fortuneCache = null;
  fortuneListeners = [];
  stopWatchingDate();
}

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

const monthDayFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  month: "long",
  day: "numeric",
});

/**
 * now のあとに来る、日本時間の 0:00 の時刻。デイリーの問題は日本時間の日付で替わる。
 */
export function nextPuzzleAt(now: Date): Date {
  const jst = new Date(now.getTime() + JST_OFFSET_MS);
  return new Date(
    Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth(), jst.getUTCDate() + 1) -
      JST_OFFSET_MS,
  );
}

/**
 * 次の問題が出る時刻を1つの文で言う（「次の問題は 9月27日 0:00（日本時間）に出ます」）。ほかの時間帯の端末で
 * 読んでも取り違えないよう、日本時間であることを添える。
 */
export function nextPuzzleTimeText(now: Date): string {
  return `次の問題は ${monthDayFormatter.format(nextPuzzleAt(now))} 0:00（日本時間）に出ます`;
}

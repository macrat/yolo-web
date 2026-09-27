/**
 * 端末に記録した今日の回の、盤の行の数とヒントの帯の行の数だけ、盤とヒントの帯の高さを取っておく
 * （--board-rows・--hint-lines）。サーバーの HTML は初めての来訪者の組み（盤の空の1行・ヒントの2行）で
 * 描かれるので、途中まで遊んだ来訪者が開き直すと、記録を読んで行が増えたときに下のものが動く。記録は端末にしか
 * 無いので、本体の直後のスクリプトで、最初の描画の前に読む。
 *
 * サーバーで描いた本体では、この関数の文をそのまま本体の直後のスクリプトで動かす。そのため、この関数は外の
 * 名前を参照せず、記録のキーと、推測の回数ごとのヒントの行の数は引数で受け取る。
 */
export function reserveSavedRows(
  game: HTMLElement | null,
  difficultyKey: string,
  historyKeyPrefix: string,
  hintLinesByGuessCount: readonly number[],
  maxGuesses: number,
): void {
  if (!game) return;
  let entry: { feedbacks?: unknown[]; status?: string } | undefined;
  try {
    const saved = localStorage.getItem(difficultyKey);
    const difficulty =
      saved === "beginner" || saved === "advanced" ? saved : "intermediate";
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    const history = JSON.parse(
      localStorage.getItem(historyKeyPrefix + difficulty) ?? "{}",
    ) as Record<string, typeof entry>;
    entry = history[today];
  } catch {
    return;
  }
  const guessCount = Array.isArray(entry?.feedbacks)
    ? entry.feedbacks.length
    : 0;
  if (guessCount === 0) return;
  // 負けを記録した古い形の途中の回（6回に届かない「lost」）は、途中の回として戻る。
  const finished =
    entry?.status === "won" ||
    (entry?.status === "lost" && guessCount >= maxGuesses);
  game.style.setProperty(
    "--board-rows",
    String(guessCount + (finished ? 0 : 1)),
  );
  game.style.setProperty(
    "--hint-lines",
    String(hintLinesByGuessCount[guessCount]),
  );
}

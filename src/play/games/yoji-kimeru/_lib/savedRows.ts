/** 盤の行の数を取っておく値の名前。<html>（:root）の値にし、盤の CSS が読む。 */
export const BOARD_ROWS_PROPERTY = "--yoji-kimeru-board-rows";

/** ヒントの帯の行の数を取っておく値の名前。<html>（:root）の値にし、ヒントの帯の CSS が読む。 */
export const HINT_LINES_PROPERTY = "--yoji-kimeru-hint-lines";

/** 取っておく値を書く <style> の id。記録を戻したら、この要素を外す。 */
export const SAVED_ROWS_STYLE_ID = "yoji-kimeru-saved-rows";

/**
 * 端末に記録した今日の回の、盤の行の数とヒントの帯の行の数を、<head> に足す <style> で <html>（:root）の値に
 * する。盤とヒントの帯はこの値の高さを取っておき、次の推測を入れる空の行とヒントの帯の最後の行を、その下端に
 * 置く。サーバーの HTML は初めての来訪者の組み（盤の空の1行・ヒントの2行）で描かれるので、途中まで遊んだ
 * 来訪者が開き直すと、記録を戻して行が増えたときに下のものが動く。記録は端末にしか無いので、本体より前に置いた
 * スクリプトで、本体を読む前に書く。<html> の属性でなく <head> の要素に書くのは、水和が <html> の属性を
 * サーバーの HTML と比べるからである。
 *
 * サーバーで描いた本体では、この関数の文をそのまま本体の前のスクリプトで動かす。そのため、この関数は外の
 * 名前を参照せず、値の名前・記録のキー・推測の回数ごとのヒントの行の数は引数で受け取る。
 */
export function reserveSavedRows(
  styleId: string,
  boardRowsProperty: string,
  hintLinesProperty: string,
  difficultyKey: string,
  historyKeyPrefix: string,
  hintLinesByGuessCount: readonly number[],
  maxGuesses: number,
): void {
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
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `:root{${boardRowsProperty}:${
    guessCount + (finished ? 0 : 1)
  };${hintLinesProperty}:${hintLinesByGuessCount[guessCount]}}`;
  document.head.append(style);
}

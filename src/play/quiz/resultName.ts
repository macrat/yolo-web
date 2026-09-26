import type { QuizResult } from "./types";

/**
 * 見出しでない所（共有の文・ページの題・同点の開示・相性の題など）でタイプ名を文として使うときの名前。
 * 読みにくい語を持つタイプは、その語の後ろに読みを丸括弧で添える（「和顔愛語（わがんあいご）タイプ」）。
 * 見出しでは折れを避けるために読みを名前の下へ分けて置くが、文の中では折れの問題が無く、
 * まだ遊んでいない人も名前を読めるようにする。読みを持たないタイプは title のまま。
 */
export function resultNameWithReading(
  result: Pick<QuizResult, "title" | "reading">,
): string {
  const { title, reading } = result;
  if (!reading) return title;
  return title.replace(reading.word, `${reading.word}（${reading.kana}）`);
}

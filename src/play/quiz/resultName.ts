import type { QuizResult } from "./types";

type NamedResult = Pick<QuizResult, "title" | "nameParts" | "reading">;

/**
 * タイプ名の見出しに置く名前と、見出しのすぐ下に補助情報として添える読み。
 * 読みを見出しの中に入れると、丸括弧の一続きや読みにくい語が見出しの折れを増やすので、見出しの外に出す。
 * 名前に読みを添えた形のタイプ（「藍色(あいいろ)」）は名前だけを、読みにくい語を持つタイプは title のまま
 * 見出しにする。
 */
export function resultHeadingName(result: NamedResult): {
  name: string;
  reading?: string;
} {
  if (result.nameParts) {
    return { name: result.nameParts.name, reading: result.nameParts.reading };
  }
  return { name: result.title, reading: result.reading?.kana };
}

/**
 * 見出しでない所（共有の文・ページの題・同点の開示・相性の題など）でタイプ名を文として使うときの名前。
 * 読みは名前の後ろか読みにくい語の後ろに丸括弧で添える（「藍色（あいいろ）」「和顔愛語（わがんあいご）タイプ」）。
 * 文の中では折れの問題が無く、まだ遊んでいない人も名前を読めるようにする。読みを持たないタイプは title のまま。
 */
export function resultNameWithReading(result: NamedResult): string {
  const { title, nameParts, reading } = result;
  if (nameParts) return `${nameParts.name}（${nameParts.reading}）`;
  if (!reading) return title;
  return title.replace(reading.word, `${reading.word}（${reading.kana}）`);
}

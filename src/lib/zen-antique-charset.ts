/**
 * 見出しを Zen Antique で組めるかの判定（DESIGN.md §3）。
 *
 * Zen Antique に無い字を含む見出しは、和文を丸ごと本文の書体で組む。
 * 字の表は scripts/generate-zen-antique-charset.ts が作る。
 */
import charset from "@/data/zen-antique-charset.json";

// U+0000-007F は見出しでも IBM Plex Sans が組むので、Zen Antique の有無を問わない。
const PLEX_SANS_LAST_CODE_POINT = 0x7f;

const ranges = charset.ranges as [number, number][];

function hasCodePoint(cp: number): boolean {
  let low = 0;
  let high = ranges.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    const [start, end] = ranges[mid];
    if (cp < start) high = mid - 1;
    else if (cp > end) low = mid + 1;
    else return true;
  }
  return false;
}

/** text の字のうち、Zen Antique に無い字を出てくる順に重複なく返す。 */
export function charsMissingFromZenAntique(text: string): string[] {
  const missing = new Set<string>();
  for (const char of text) {
    const cp = char.codePointAt(0)!;
    if (cp > PLEX_SANS_LAST_CODE_POINT && !hasCodePoint(cp)) missing.add(char);
  }
  return [...missing];
}

/** text を見出しの書体の並び（Plex と Zen Antique）だけで組めるか。 */
export function canSetInZenAntique(text: string): boolean {
  return charsMissingFromZenAntique(text).length === 0;
}

/**
 * 詳しい読みものの表のセルの区切り。セルの字はデータから来るので、サーバーで splitIntoPhrases の表のセルの指定
 * （tableCell）で分け、表を組む部品（DataTable）へ渡す（DESIGN.md §4 表のセルは文節で折る）。
 */
import "server-only";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import type { DetailedContent } from "./types";

/** セルの字ごとの区切り。 */
export type TableCellPhrases = Readonly<Record<string, readonly string[]>>;

/** 読みもののうち表に組むもの（逆張り運勢診断の数字の指標）の、セルの字ごとの区切りを作る。 */
export function readingTableCells(
  contents: readonly (DetailedContent | undefined)[],
): TableCellPhrases {
  const texts = new Set<string>();
  for (const content of contents) {
    if (content?.variant !== "contrarian-fortune") continue;
    for (const metric of content.humorMetrics ?? []) {
      texts.add(metric.label);
      texts.add(metric.value);
    }
  }
  return Object.fromEntries(
    [...texts].map((text) => [
      text,
      splitIntoPhrases(text, { tableCell: true }),
    ]),
  );
}

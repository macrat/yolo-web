import type { ItemListFact, ItemListItem } from "@/components/ItemList";
import { DAILY_UPDATE_SLUGS, quizQuestionCountBySlug } from "./registry";
import { getContentPath } from "./paths";
import { resolveDisplayCategory } from "./seo";
import type { PlayContentMeta } from "./types";

/** 遊びを比べて選ぶ手がかりになる補助情報。毎日変わるか、解き終えるまでに何問あるか。 */
function playFacts(content: PlayContentMeta): ItemListFact[] {
  const facts: ItemListFact[] = [];
  if (DAILY_UPDATE_SLUGS.has(content.slug)) facts.push({ text: "毎日更新" });
  const questionCount = quizQuestionCountBySlug.get(content.slug);
  if (questionCount !== undefined) facts.push({ text: `全${questionCount}問` });
  return facts;
}

/**
 * 遊びを行の一覧の行にする。行は名前・説明・種別・補助情報を持つ。
 *
 * 並べる全件で種別が同じなら、種別を行に出さない。すべて同じ語では項目を見分ける手がかりにならないため
 * （DESIGN.md §7）。
 */
export function toPlayListItems(
  contents: readonly PlayContentMeta[],
): ItemListItem[] {
  const kinds = contents.map(resolveDisplayCategory);
  const showKind = new Set(kinds).size > 1;
  return contents.map((content, index) => ({
    name: content.shortTitle ?? content.title,
    href: getContentPath(content),
    description: content.shortDescription,
    kind: showKind ? kinds[index] : undefined,
    facts: playFacts(content),
  }));
}

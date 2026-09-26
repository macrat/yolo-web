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

/** 遊びを行の一覧の行にする。行は名前・説明・種別・補助情報を持つ。 */
export function toPlayListItems(
  contents: readonly PlayContentMeta[],
): ItemListItem[] {
  return contents.map((content) => ({
    name: content.shortTitle ?? content.title,
    href: getContentPath(content),
    description: content.shortDescription,
    kind: resolveDisplayCategory(content),
    facts: playFacts(content),
  }));
}

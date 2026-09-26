import { describe, test, expect } from "vitest";
import { toPlayListItems } from "../listItems";
import { playContentBySlug, quizQuestionCountBySlug } from "../registry";
import type { PlayContentMeta } from "../types";

function content(slug: string): PlayContentMeta {
  const found = playContentBySlug.get(slug);
  if (!found) throw new Error(`${slug} が登録に無い`);
  return found;
}

describe("toPlayListItems", () => {
  test("名前は短い名前を優先し、リンク先は遊びのページ、説明は短い説明であること", () => {
    const daily = content("daily");
    const [item] = toPlayListItems([daily, content("kanji-kanaru")]);
    expect(item.name).toBe(daily.shortTitle ?? daily.title);
    expect(item.href).toBe("/play/daily");
    expect(item.description).toBe(daily.shortDescription);
  });

  test("種別が行ごとに違うときは、種別を出すこと", () => {
    const items = toPlayListItems([content("daily"), content("kanji-kanaru")]);
    expect(items.map((item) => item.kind)).toEqual(["運勢", "パズル"]);
  });

  test("並べる全件で種別が同じときは、種別を出さないこと", () => {
    const items = toPlayListItems([
      content("kanji-kanaru"),
      content("nakamawake"),
    ]);
    expect(items.map((item) => item.kind)).toEqual([undefined, undefined]);
  });

  test("毎日変わるものは「毎日更新」、問数を持つものは「全N問」を補助情報に持つこと", () => {
    const [game, quiz] = toPlayListItems([
      content("kanji-kanaru"),
      content("kanji-level"),
    ]);
    expect(game.facts).toEqual([{ text: "毎日更新" }]);
    expect(quiz.facts).toEqual([
      { text: `全${quizQuestionCountBySlug.get("kanji-level")}問` },
    ]);
  });
});

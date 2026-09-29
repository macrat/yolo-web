import { describe, expect, test } from "vitest";
import { BLOG_INDEX_SUMMARY, blogIndexEntries } from "@/blog/_lib/blog-list";
import {
  COLOR_INDEX_SUMMARY,
  colorIndexEntries,
} from "@/dictionary/_lib/color-list";
import {
  KANJI_INDEX_SUMMARY,
  kanjiIndexEntries,
} from "@/dictionary/_lib/kanji-list";
import {
  YOJI_INDEX_SUMMARY,
  yojiIndexEntries,
} from "@/dictionary/_lib/yoji-list";
import { phraseIndexEntries, phraseIndexGroups } from "@/lib/index-phrases";
import { followsPhraseRules, splitIntoPhrases } from "@/lib/phrase-breaks";
import { phrasedNameText } from "@/lib/phrased-name";

describe("phraseIndexEntries", () => {
  test("語を名前の中の語の切れ目で区切り、行き先と数はそのまま渡す", () => {
    expect(
      phraseIndexEntries([
        { label: "オンラインツール", href: "/blog/tag/a", count: 12 },
        { label: "SEO", href: "/blog/tag/b" },
      ]),
    ).toEqual([
      { name: ["オンライン", "ツール"], href: "/blog/tag/a", count: 12 },
      { name: ["SEO"], href: "/blog/tag/b" },
    ]);
  });

  test("区切りの見出しの下の語も区切り、見出しと書体の属性はそのまま渡す", () => {
    expect(
      phraseIndexGroups([
        {
          heading: "初級",
          headingFont: { "data-heading-font": "fallback" },
          items: [{ label: "一期一会", href: "/dictionary/yoji/a" }],
        },
      ]),
    ).toEqual([
      {
        heading: "初級",
        headingFont: { "data-heading-font": "fallback" },
        items: [{ name: ["一期一会"], href: "/dictionary/yoji/a" }],
      },
    ]);
  });

  test("一覧の索引の語は、どれも区切りをつなぐと元の語に戻り、禁則を満たす", () => {
    const blog = blogIndexEntries();
    const kanji = kanjiIndexEntries();
    const entries = [
      ...blog.categories,
      ...blog.tags,
      ...kanji.grades,
      ...kanji.strokes,
      ...kanji.radicals.flatMap((group) => group.items),
      ...yojiIndexEntries(),
      ...colorIndexEntries(),
    ];
    phraseIndexEntries(entries).forEach((item, index) => {
      expect(phrasedNameText(item.name)).toBe(entries[index].label);
      const phrases = typeof item.name === "string" ? [item.name] : item.name;
      expect(followsPhraseRules(phrases), phrases.join("|")).toBe(true);
    });
  });
});

describe("一覧の索引のアコーディオンのラベル", () => {
  test("手で書いた並びは、名前に括弧で数を添えたものの分け方と同じで、禁則を満たす", () => {
    for (const summary of [
      BLOG_INDEX_SUMMARY,
      KANJI_INDEX_SUMMARY,
      YOJI_INDEX_SUMMARY,
      COLOR_INDEX_SUMMARY,
    ]) {
      expect(followsPhraseRules(summary), summary.join("|")).toBe(true);
      expect(
        splitIntoPhrases(`${summary.join("")}（10）`, { countedName: true }),
      ).toEqual([...summary, "（10）"]);
    }
  });
});

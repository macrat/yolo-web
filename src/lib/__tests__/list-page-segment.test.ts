import { describe, expect, test } from "vitest";
import { getAllKanjiChars } from "@/dictionary/_lib/kanji";
import { getAllYojiIds } from "@/dictionary/_lib/yoji";
import { getAllColorSlugs } from "@/dictionary/_lib/colors";
import { getAllSlugs as getAllHumorSlugs } from "@/humor-dict/data";
import { getAllBlogSlugs } from "@/blog/_lib/blog";

// 一覧のページ送りの経路 `{元のパス}/page/{n}` の `page` は、同じ階層の `[char]`・`[yoji]`・`[slug]` より
// 優先される。見出し語や記事の slug が `page` だと、その詳細のページに着けなくなる。
describe("一覧のページ送りの `page` と重なる見出し語・slug が無い", () => {
  test.each([
    ["漢字", getAllKanjiChars],
    ["四字熟語", getAllYojiIds],
    ["伝統色", getAllColorSlugs],
    ["ユーモア辞典", getAllHumorSlugs],
    ["ブログの記事", getAllBlogSlugs],
  ])("%s", (_, getSlugs) => {
    const slugs = getSlugs();
    expect(slugs.length).toBeGreaterThan(0);
    expect(slugs).not.toContain("page");
  });
});

import { describe, expect, test } from "vitest";
import {
  getAllBlogPosts,
  getAllTags,
  getPostsByTag,
  MIN_POSTS_FOR_TAG_INDEX,
  TAG_DESCRIPTIONS,
} from "@/blog/_lib/blog";
import {
  generateMetadata,
  generateStaticParams,
} from "@/app/blog/tag/[tag]/page";

/** タグごとの掲載記事数。記事ファイルの走査は1回で済ませる。 */
function countPostsByTag(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const post of getAllBlogPosts()) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return counts;
}

describe("/blog/tag/[tag]", () => {
  test("generateStaticParams が記事に付いたすべてのタグを返すこと", () => {
    const params = generateStaticParams();

    // 記事に付いたタグはすべてページを持つ（タグリンクの行き先が必ず存在する）
    expect(params.map((p) => p.tag).sort()).toEqual(getAllTags().sort());

    // 生成されるページはいずれも記事を1件以上持つ
    for (const { tag } of params) {
      expect(
        getPostsByTag(tag).length,
        `タグ「${tag}」に記事がない`,
      ).toBeGreaterThan(0);
    }
  }, 15000);

  test("主要タグが含まれること", () => {
    const params = generateStaticParams();
    const tagNames = params.map((p) => p.tag);

    expect(tagNames).toContain("設計パターン");
    expect(tagNames).toContain("Next.js");
    expect(tagNames).toContain("SEO");
  }, 15000);

  test("すべてのタグに TAG_DESCRIPTIONS の説明文が定義されていること", () => {
    // 説明文はタグページの見出し下に出るため、ページを持つタグには必ず要る
    const missingDescriptions = getAllTags().filter(
      (tag) => !TAG_DESCRIPTIONS[tag],
    );

    expect(
      missingDescriptions,
      `タグ説明文が未定義のタグ: ${missingDescriptions.join(", ")}`,
    ).toHaveLength(0);
  }, 15000);

  test("掲載記事が MIN_POSTS_FOR_TAG_INDEX 件未満のタグページだけが noindex を返すこと", async () => {
    // すべてのタグにページがある以上、薄いページを検索結果に出さない歯止めは
    // ページが返す robots だけ。実際の出力を1枚ずつ確かめる
    const counts = countPostsByTag();
    const indexable: string[] = [];
    const noindexed: string[] = [];

    for (const tag of getAllTags()) {
      const count = counts.get(tag) ?? 0;
      (count >= MIN_POSTS_FOR_TAG_INDEX ? indexable : noindexed).push(tag);
    }

    // 片側が空だと、以下のループは何も確かめないまま緑になる
    expect(indexable.length, "indexable なタグが1つもない").toBeGreaterThan(0);
    expect(noindexed.length, "noindex のタグが1つもない").toBeGreaterThan(0);

    for (const tag of indexable) {
      const { robots } = await generateMetadata({
        params: Promise.resolve({ tag }),
      });
      expect(
        robots,
        `タグ「${tag}」（${counts.get(tag)}件）が検索結果から外れている`,
      ).toEqual({ index: true, follow: true });
    }

    for (const tag of noindexed) {
      const { robots } = await generateMetadata({
        params: Promise.resolve({ tag }),
      });
      expect(
        robots,
        `タグ「${tag}」（${counts.get(tag)}件）が検索結果に出てしまう`,
      ).toEqual({ index: false, follow: true });
    }
  }, 15000);
});

import { describe, expect, test } from "vitest";
import {
  getAllBlogPosts,
  getPostsByTag,
  getTagsWithMinPosts,
  MIN_POSTS_FOR_TAG_PAGE,
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
  test("generateStaticParams が掲載記事 MIN_POSTS_FOR_TAG_PAGE 件以上のタグだけを返すこと", () => {
    const params = generateStaticParams();

    // 薄いページを作らないため、閾値に満たないタグはページを持たない
    for (const { tag } of params) {
      expect(
        getPostsByTag(tag).length,
        `タグ「${tag}」の記事数が ${MIN_POSTS_FOR_TAG_PAGE} 件未満`,
      ).toBeGreaterThanOrEqual(MIN_POSTS_FOR_TAG_PAGE);
    }

    // 閾値を満たすタグは漏れなくページを持つ
    expect(params.map((p) => p.tag).sort()).toEqual(
      getTagsWithMinPosts(MIN_POSTS_FOR_TAG_PAGE).sort(),
    );
  }, 15000);

  test("主要タグが含まれること", () => {
    const params = generateStaticParams();
    const tagNames = params.map((p) => p.tag);

    expect(tagNames).toContain("設計パターン");
    expect(tagNames).toContain("Next.js");
    expect(tagNames).toContain("SEO");
  }, 15000);

  test("ページを持つタグに TAG_DESCRIPTIONS の説明文が定義されていること", () => {
    // 説明文はタグページの見出し下に出るため、ページを持つタグには必ず要る
    const missingDescriptions = getTagsWithMinPosts(
      MIN_POSTS_FOR_TAG_PAGE,
    ).filter((tag) => !TAG_DESCRIPTIONS[tag]);

    expect(
      missingDescriptions,
      `タグ説明文が未定義のタグ: ${missingDescriptions.join(", ")}`,
    ).toHaveLength(0);
  }, 15000);

  test("掲載記事が MIN_POSTS_FOR_TAG_INDEX 件未満のタグページだけが noindex を返すこと", async () => {
    // 薄いページを検索結果に出さない歯止めはページが返す robots。実際の出力を1枚ずつ確かめる
    const counts = countPostsByTag();
    const indexable: string[] = [];
    const noindexed: string[] = [];

    for (const tag of getTagsWithMinPosts(MIN_POSTS_FOR_TAG_PAGE)) {
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

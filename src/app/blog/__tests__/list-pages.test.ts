import { describe, expect, test } from "vitest";
import {
  ALL_CATEGORIES,
  MIN_POSTS_FOR_TAG_PAGE,
  getTagsWithMinPosts,
} from "@/blog/_lib/blog";
import {
  blogListBasePath,
  blogListPageCount,
  type BlogListScope,
} from "@/blog/_lib/blog-list";
import { listPageHref } from "@/lib/list-pages";
import {
  dynamicParams as blogDynamicParams,
  generateMetadata as generateBlogMetadata,
  generateStaticParams as generateBlogStaticParams,
} from "@/app/blog/page/[page]/page";
import {
  dynamicParams as categoryDynamicParams,
  generateMetadata as generateCategoryMetadata,
  generateStaticParams as generateCategoryStaticParams,
} from "@/app/blog/category/[category]/page/[page]/page";
import {
  dynamicParams as tagDynamicParams,
  generateMetadata as generateTagMetadata,
  generateStaticParams as generateTagStaticParams,
} from "@/app/blog/tag/[tag]/page/[page]/page";

// 件数に依存する固定の値は書かない。記事が増えても、範囲の件数から数えたページと一致することを見る。

/** 2 から最後の番号まで、抜けなく並んでいること。 */
function expectConsecutiveFromTwo(pages: number[]): void {
  expect(pages).toEqual(pages.map((_, index) => index + 2));
}

/**
 * 範囲の経路が生成する番号 `pages` が、2ページ目から最後のページまでを含むこと。その後ろの番号は、
 * どれも範囲の一覧のいまあるページへ 308 で送り、生成しない次の番号は 404 になること。
 */
async function expectPagesServeOrForward(
  scope: BlogListScope,
  pages: number[],
  metadataOf: (page: string) => Promise<unknown>,
): Promise<void> {
  const count = blogListPageCount(scope);
  const basePath = blogListBasePath(scope);
  expectConsecutiveFromTwo(pages);
  expect(pages.length).toBeGreaterThanOrEqual(count - 1);

  const destinations = Array.from({ length: count }, (_, index) =>
    listPageHref(basePath, index + 1),
  );
  for (const page of pages) {
    if (page <= count) {
      await expect(metadataOf(String(page))).resolves.toBeDefined();
      continue;
    }
    const error = await metadataOf(String(page)).catch(
      (thrown: { digest?: string }) => thrown,
    );
    const [kind, , destination, status] = (
      (error as { digest?: string }).digest ?? ""
    ).split(";");
    expect(kind).toBe("NEXT_REDIRECT");
    expect(status).toBe("308");
    expect(destinations).toContain(destination);
  }

  const beyond = String((pages.at(-1) ?? 1) + 1);
  await expect(metadataOf(beyond)).rejects.toMatchObject({
    digest: expect.stringContaining("NEXT_HTTP_ERROR_FALLBACK;404"),
  });
}

describe("ブログの一覧の2ページ目からの経路", () => {
  test("/blog/page/[page] は2ページ目から最後のページまでを生成し、その後ろの番号をいまのページへ送る", async () => {
    expect(blogDynamicParams).toBe(false);
    await expectPagesServeOrForward(
      { type: "all" },
      generateBlogStaticParams().map(({ page }) => Number(page)),
      (page) => generateBlogMetadata({ params: Promise.resolve({ page }) }),
    );
  });

  test("/blog/category/[category]/page/[page] は分類ごとに同じように生成し、送る", async () => {
    expect(categoryDynamicParams).toBe(false);
    const params = generateCategoryStaticParams();
    for (const category of ALL_CATEGORIES) {
      await expectPagesServeOrForward(
        { type: "category", category },
        params
          .filter((param) => param.category === category)
          .map(({ page }) => Number(page)),
        (page) =>
          generateCategoryMetadata({
            params: Promise.resolve({ category, page }),
          }),
      );
    }
  });

  test("/blog/tag/[tag]/page/[page] はタグごとに同じように生成し、送る", async () => {
    expect(tagDynamicParams).toBe(false);
    const params = generateTagStaticParams();
    for (const tag of getTagsWithMinPosts(MIN_POSTS_FOR_TAG_PAGE)) {
      await expectPagesServeOrForward(
        { type: "tag", tag },
        params
          .filter((param) => param.tag === tag)
          .map(({ page }) => Number(page)),
        (page) =>
          generateTagMetadata({ params: Promise.resolve({ tag, page }) }),
      );
    }
  }, 15000);

  test.each(["0", "1", "abc", "02", "-2", "99999"])(
    "番号でない値と際限なく大きい番号「%s」は 404",
    async (page) => {
      await expect(
        generateBlogMetadata({ params: Promise.resolve({ page }) }),
      ).rejects.toMatchObject({
        digest: expect.stringContaining("NEXT_HTTP_ERROR_FALLBACK;404"),
      });
    },
  );

  test("存在しない分類とタグは、番号にかかわらず 404", async () => {
    for (const page of ["2", "99999"]) {
      await expect(
        generateCategoryMetadata({
          params: Promise.resolve({ category: "no-such-category", page }),
        }),
      ).rejects.toMatchObject({
        digest: expect.stringContaining("NEXT_HTTP_ERROR_FALLBACK;404"),
      });
      await expect(
        generateTagMetadata({
          params: Promise.resolve({ tag: "no-such-tag", page }),
        }),
      ).rejects.toMatchObject({
        digest: expect.stringContaining("NEXT_HTTP_ERROR_FALLBACK;404"),
      });
    }
  });
});

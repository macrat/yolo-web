import { describe, expect, test } from "vitest";
import {
  ALL_CATEGORIES,
  getAllBlogPosts,
  type BlogCategory,
} from "@/blog/_lib/blog";
import { BLOG_POSTS_PER_PAGE, paginate } from "@/lib/pagination";
import {
  dynamicParams as blogDynamicParams,
  generateStaticParams as generateBlogStaticParams,
} from "@/app/(new)/blog/page/[page]/page";
import {
  dynamicParams as categoryDynamicParams,
  generateStaticParams as generateCategoryStaticParams,
} from "@/app/(new)/blog/category/[category]/page/[page]/page";

const allPosts = getAllBlogPosts();
const { totalPages: blogTotalPages } = paginate(
  allPosts,
  1,
  BLOG_POSTS_PER_PAGE,
);

describe("/blog/page/[page]", () => {
  test("dynamicParams=false と generateStaticParams が整合している", () => {
    expect(blogDynamicParams).toBe(false);

    const pages = generateBlogStaticParams().map(({ page }) => Number(page));
    const expectedPages = Array.from(
      { length: Math.max(blogTotalPages - 1, 0) },
      (_, i) => i + 2,
    );

    expect(pages).toEqual(expectedPages);
  });
});

describe("/blog/category/[category]/page/[page]", () => {
  const category = ALL_CATEGORIES[0] as BlogCategory;
  const categoryPosts = allPosts.filter((p) => p.category === category);
  const { totalPages: categoryTotalPages } = paginate(
    categoryPosts,
    1,
    BLOG_POSTS_PER_PAGE,
  );

  test("dynamicParams=false と generateStaticParams が整合している", () => {
    expect(categoryDynamicParams).toBe(false);

    const categoryPages = generateCategoryStaticParams()
      .filter((param) => param.category === category)
      .map((param) => Number(param.page));
    const expectedPages = Array.from(
      { length: Math.max(categoryTotalPages - 1, 0) },
      (_, i) => i + 2,
    );

    expect(categoryPages).toEqual(expectedPages);
  });
});

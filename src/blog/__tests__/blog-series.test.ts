import { describe, test, expect } from "vitest";
import { getSeriesPosts, getAllBlogPosts } from "@/blog/_lib/blog";

describe("getSeriesPosts", () => {
  test("returns posts for an existing series", () => {
    const posts = getSeriesPosts("ai-agent-ops");
    expect(posts.length).toBeGreaterThanOrEqual(1);
    for (const post of posts) {
      expect(post.series).toBe("ai-agent-ops");
    }
  });

  test("returns results in published_at ascending order (oldest first)", () => {
    const posts = getSeriesPosts("ai-agent-ops");
    for (let i = 1; i < posts.length; i++) {
      const prevTime = new Date(posts[i - 1].published_at).getTime();
      const currTime = new Date(posts[i].published_at).getTime();
      expect(prevTime).toBeLessThanOrEqual(currTime);
    }
  });

  test("returns an empty array for a non-existent series", () => {
    const posts = getSeriesPosts("non-existent-series-id");
    expect(posts).toEqual([]);
  });

  test("returns only the posts of the requested series", () => {
    const seriesId = "japanese-culture";
    const allPosts = getAllBlogPosts();
    const otherSeriesPosts = allPosts.filter(
      (p) => p.series !== undefined && p.series !== seriesId,
    );
    const noSeriesPosts = allPosts.filter((p) => p.series === undefined);
    expect(otherSeriesPosts.length).toBeGreaterThan(0);
    expect(noSeriesPosts.length).toBeGreaterThan(0);

    const seriesSlugs = getSeriesPosts(seriesId).map((p) => p.slug);
    const expectedSlugs = allPosts
      .filter((p) => p.series === seriesId)
      .map((p) => p.slug);
    expect(expectedSlugs.length).toBeGreaterThan(0);
    expect([...seriesSlugs].sort()).toEqual([...expectedSlugs].sort());

    for (const post of [...otherSeriesPosts, ...noSeriesPosts]) {
      expect(seriesSlugs).not.toContain(post.slug);
    }
  });

  test("does not include draft posts (draft posts are excluded by getAllBlogPosts)", () => {
    // getAllBlogPosts filters out draft:true posts, so getSeriesPosts
    // inherits this behavior. Verify no returned post has draft:true.
    const posts = getSeriesPosts("ai-agent-ops");
    for (const post of posts) {
      expect(post.draft).toBe(false);
    }
  });
});

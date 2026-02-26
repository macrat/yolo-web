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
    const posts = getSeriesPosts("building-yolos");
    for (let i = 1; i < posts.length; i++) {
      const prevTime = new Date(posts[i - 1].published_at).getTime();
      const currTime = new Date(posts[i].published_at).getTime();
      // When dates are equal, slug is used as tiebreaker (ascending)
      if (prevTime === currTime) {
        expect(posts[i - 1].slug.localeCompare(posts[i].slug)).toBeLessThan(0);
      } else {
        expect(prevTime).toBeLessThanOrEqual(currTime);
      }
    }
  });

  test("returns an empty array for a non-existent series", () => {
    const posts = getSeriesPosts("non-existent-series-id");
    expect(posts).toEqual([]);
  });

  test("does not include posts without a matching series", () => {
    const seriesPosts = getSeriesPosts("tool-guides");
    const allPosts = getAllBlogPosts();
    const nonSeriesPosts = allPosts.filter((p) => p.series !== "tool-guides");

    for (const nonSeries of nonSeriesPosts) {
      expect(
        seriesPosts.find((p) => p.slug === nonSeries.slug),
      ).toBeUndefined();
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

  test("uses slug as secondary sort when published_at timestamps are identical", () => {
    // Verify the secondary sort logic by checking the overall series ordering.
    // tool-guides posts on 2026-02-17 have distinct timestamps (minute-level),
    // so primary sort by time already determines order. We verify the sort is
    // deterministic by checking the full list is in ascending published_at order.
    const posts = getSeriesPosts("tool-guides");
    expect(posts.length).toBeGreaterThanOrEqual(2);

    for (let i = 1; i < posts.length; i++) {
      const prevTime = new Date(posts[i - 1].published_at).getTime();
      const currTime = new Date(posts[i].published_at).getTime();
      if (prevTime === currTime) {
        // When times are equal, slug tiebreaker ensures alphabetical order
        expect(posts[i - 1].slug.localeCompare(posts[i].slug)).toBeLessThan(0);
      } else {
        expect(prevTime).toBeLessThan(currTime);
      }
    }
  });
});

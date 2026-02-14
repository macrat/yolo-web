/**
 * Cross-linking utility between blog posts and memos.
 * M10: Keeps blog.ts and memos.ts independent by centralizing
 * cross-reference logic here.
 */

import { getAllBlogPosts, type BlogPostMeta } from "@/lib/blog";
import { getPublicMemoById, type PublicMemo } from "@/lib/memos";

/**
 * Get public memos that are referenced by a blog post.
 * M11: Non-public or non-existent memos are excluded (returned as null
 * in the array, allowing the component to render "(非公開)" text).
 */
export function getRelatedMemosForBlogPost(
  memoIds: string[],
): (PublicMemo | null)[] {
  return memoIds.map((id) => getPublicMemoById(id));
}

/**
 * Get blog posts that reference a given memo ID.
 * Scans all blog posts' related_memo_ids arrays.
 */
export function getRelatedBlogPostsForMemo(memoId: string): BlogPostMeta[] {
  const allPosts = getAllBlogPosts();
  return allPosts.filter((post) => post.related_memo_ids.includes(memoId));
}

/**
 * Get blog posts that reference a given tool slug.
 * Scans all blog posts' related_tool_slugs arrays.
 */
export function getRelatedBlogPostsForTool(
  toolSlug: string,
): BlogPostMeta[] {
  const allPosts = getAllBlogPosts();
  return allPosts.filter((post) =>
    post.related_tool_slugs.includes(toolSlug),
  );
}

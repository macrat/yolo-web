/**
 * Cross-linking utility between blog posts and memos.
 * M10: Keeps blog.ts and memos.ts independent by centralizing
 * cross-reference logic here.
 */

import { getAllBlogPosts, type BlogPostMeta } from "@/blog/_lib/blog";
import { getPublicMemoById, type PublicMemo } from "@/memos/_lib/memos";

interface BlogReferenceIndex {
  memoToPosts: Map<string, BlogPostMeta[]>;
  toolToPosts: Map<string, BlogPostMeta[]>;
}

function addToReverseIndex(
  index: Map<string, BlogPostMeta[]>,
  key: string,
  post: BlogPostMeta,
): void {
  const posts = index.get(key);
  if (posts) {
    posts.push(post);
    return;
  }
  index.set(key, [post]);
}

/**
 * Build reverse indexes from blog metadata once, then reuse for all lookup APIs.
 */
function buildBlogReferenceIndex(posts: BlogPostMeta[]): BlogReferenceIndex {
  const memoToPosts = new Map<string, BlogPostMeta[]>();
  const toolToPosts = new Map<string, BlogPostMeta[]>();

  for (const post of posts) {
    for (const memoId of post.related_memo_ids) {
      addToReverseIndex(memoToPosts, memoId, post);
    }
    for (const toolSlug of post.related_tool_slugs) {
      addToReverseIndex(toolToPosts, toolSlug, post);
    }
  }

  return { memoToPosts, toolToPosts };
}

const blogReferenceIndex = buildBlogReferenceIndex(getAllBlogPosts());

/**
 * Get public memos that are referenced by a blog post.
 * M11: For non-public or non-existent memo IDs, returns `null` at that index
 * so callers can render placeholders like "(非公開)" while preserving order.
 */
export function getRelatedMemosForBlogPost(
  memoIds: string[],
): (PublicMemo | null)[] {
  return memoIds.map((id) => getPublicMemoById(id));
}

/**
 * Get blog posts that reference a given memo ID.
 * Returns an empty array when there is no matching reference.
 */
export function getRelatedBlogPostsForMemo(memoId: string): BlogPostMeta[] {
  return blogReferenceIndex.memoToPosts.get(memoId) ?? [];
}

/**
 * Get blog posts that reference a given tool slug.
 * Returns an empty array when there is no matching reference.
 */
export function getRelatedBlogPostsForTool(toolSlug: string): BlogPostMeta[] {
  return blogReferenceIndex.toolToPosts.get(toolSlug) ?? [];
}

/**
 * Get blog posts that reference a given game slug.
 * Blog posts store game slugs in the same related_tool_slugs field.
 */
export function getRelatedBlogPostsForGame(gameSlug: string): BlogPostMeta[] {
  return getRelatedBlogPostsForTool(gameSlug);
}

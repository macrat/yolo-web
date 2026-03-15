/**
 * Cross-linking utility between blog posts and tools/games.
 * M10: Keeps blog.ts independent by centralizing
 * cross-reference logic here.
 */

import { getAllBlogPosts, type BlogPostMeta } from "@/blog/_lib/blog";

interface BlogReferenceIndex {
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
  const toolToPosts = new Map<string, BlogPostMeta[]>();

  for (const post of posts) {
    for (const toolSlug of post.related_tool_slugs) {
      addToReverseIndex(toolToPosts, toolSlug, post);
    }
  }

  return { toolToPosts };
}

const blogReferenceIndex = buildBlogReferenceIndex(getAllBlogPosts());

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

/**
 * ブログ記事と、記事が取り上げたツール・ゲームのつながり。
 * 記事どうしの処理を持つ blog.ts から、ほかの面との参照を切り離してここに置く。
 */

import { getAllBlogPosts, type BlogPostMeta } from "@/blog/_lib/blog";

/**
 * ツール・ゲームの slug から、それを取り上げた記事を引く表。記事はツールとゲームの slug を
 * 同じ欄（related_tool_slugs）に持つので、表も1つにする。
 */
function buildPostsBySlug(posts: BlogPostMeta[]): Map<string, BlogPostMeta[]> {
  const postsBySlug = new Map<string, BlogPostMeta[]>();
  for (const post of posts) {
    for (const slug of post.related_tool_slugs) {
      const found = postsBySlug.get(slug);
      if (found) {
        found.push(post);
      } else {
        postsBySlug.set(slug, [post]);
      }
    }
  }
  return postsBySlug;
}

const postsBySlug = buildPostsBySlug(getAllBlogPosts());

/** そのツール・ゲームを取り上げた記事。無ければ空の配列。 */
export function getBlogPostsReferencing(slug: string): BlogPostMeta[] {
  return postsBySlug.get(slug) ?? [];
}

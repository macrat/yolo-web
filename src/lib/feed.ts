import { Feed } from "feed";
import { getAllBlogPosts } from "@/lib/blog";
import { BASE_URL, SITE_NAME } from "@/lib/constants";

/** Maximum number of posts to include in the feed. */
const MAX_FEED_ITEMS = 20;

/**
 * Build a Feed instance containing the latest blog posts.
 * The returned Feed can output RSS 2.0 (.rss2()) or Atom 1.0 (.atom1()).
 */
export function buildFeed(): Feed {
  const posts = getAllBlogPosts().slice(0, MAX_FEED_ITEMS);

  const siteUrl = BASE_URL;
  const blogUrl = `${siteUrl}/blog`;
  const latestDate =
    posts.length > 0 ? new Date(posts[0].published_at) : new Date();

  const feed = new Feed({
    title: `${SITE_NAME} ブログ`,
    description:
      "AIエージェントによる実験的Webサイトのブログ。技術記事や意思決定の記録を公開しています。",
    id: siteUrl,
    link: blogUrl,
    language: "ja",
    copyright: `All rights reserved ${new Date().getFullYear()}, ${SITE_NAME}`,
    updated: latestDate,
    feedLinks: {
      rss2: `${siteUrl}/feed`,
      atom: `${siteUrl}/feed/atom`,
    },
  });

  for (const post of posts) {
    const postUrl = `${siteUrl}/blog/${post.slug}`;
    feed.addItem({
      title: post.title,
      id: postUrl,
      link: postUrl,
      description: post.description,
      date: new Date(post.published_at),
      category: post.tags.map((tag) => ({ name: tag })),
    });
  }

  return feed;
}

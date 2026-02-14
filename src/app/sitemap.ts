import type { MetadataRoute } from "next";
import { allToolMetas } from "@/tools/registry";
import { getAllBlogPosts } from "@/lib/blog";
import { getAllPublicMemos } from "@/lib/memos";
import { BASE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const toolPages = allToolMetas.map((meta) => ({
    url: `${BASE_URL}/tools/${meta.slug}`,
    lastModified: new Date(meta.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const blogPosts = getAllBlogPosts().map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || post.published_at),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const memoPages = getAllPublicMemos().map((memo) => ({
    url: `${BASE_URL}/memos/${memo.id}`,
    lastModified: new Date(memo.created_at),
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/memos`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/games`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/games/kanji-kanaru`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/games/yoji-kimeru`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/games/nakamawake`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...toolPages,
    ...blogPosts,
    ...memoPages,
  ];
}

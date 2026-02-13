import type { MetadataRoute } from "next";
import { allToolMetas } from "@/tools/registry";
import { getAllBlogPosts } from "@/lib/blog";
import { getAllPublicMemos } from "@/lib/memos";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://yolo-web.example.com";

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
    ...toolPages,
    ...blogPosts,
    ...memoPages,
  ];
}

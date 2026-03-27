import fs from "node:fs";
import path from "node:path";
import {
  parseFrontmatter,
  markdownToHtml,
  extractHeadings,
  estimateReadingTime,
} from "@/lib/markdown";
import type { TrustLevel } from "@/lib/trust-levels";

const BLOG_DIR = path.join(process.cwd(), "src/blog/content");

export type BlogCategory =
  | "ai-workflow"
  | "dev-notes"
  | "site-updates"
  | "tool-guides"
  | "japanese-culture";

export const CATEGORY_LABELS: Record<BlogCategory, string> = {
  "ai-workflow": "AIワークフロー",
  "dev-notes": "開発ノート",
  "site-updates": "サイト更新",
  "tool-guides": "ツールガイド",
  "japanese-culture": "日本語・文化",
};

export const ALL_CATEGORIES: BlogCategory[] = [
  "ai-workflow",
  "dev-notes",
  "site-updates",
  "tool-guides",
  "japanese-culture",
];

/** Series ID to display name mapping. */
export const SERIES_LABELS: Record<string, string> = {
  "ai-agent-ops": "AIエージェント運用記",
  "japanese-culture": "日本語・日本文化",
  "nextjs-deep-dive": "Next.js実践ノート",
};

interface BlogFrontmatter {
  title: string;
  slug: string;
  description: string;
  published_at: string;
  updated_at: string;
  tags: string[];
  category: string;
  series?: string;
  related_tool_slugs: string[];
  draft: boolean;
}

export interface BlogPostMeta {
  title: string;
  slug: string;
  description: string;
  published_at: string;
  updated_at: string;
  tags: string[];
  category: BlogCategory;
  series?: string;
  related_tool_slugs: string[];
  draft: boolean;
  readingTime: number;
  /** Content trust level */
  trustLevel: TrustLevel;
}

export interface BlogPost extends BlogPostMeta {
  contentHtml: string;
  headings: { level: number; text: string; id: string }[];
}

/**
 * List all published blog posts, sorted by published_at descending.
 * Reads from src/blog/content/*.md at build time.
 * Excludes posts where draft: true.
 */
export function getAllBlogPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  const posts: BlogPostMeta[] = [];

  for (const file of files) {
    const filePath = path.join(BLOG_DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = parseFrontmatter<BlogFrontmatter>(raw);

    if (data.draft === true) continue;

    const meta: BlogPostMeta = {
      title: String(data.title || ""),
      slug: String(data.slug || file.replace(/\.md$/, "")),
      description: String(data.description || ""),
      published_at: String(data.published_at || ""),
      updated_at: String(data.updated_at || data.published_at || ""),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      category: (data.category as BlogCategory) || "dev-notes",
      related_tool_slugs: Array.isArray(data.related_tool_slugs)
        ? data.related_tool_slugs.map(String)
        : [],
      draft: false,
      readingTime: estimateReadingTime(content),
      trustLevel: "generated" as const,
    };

    if (data.series) {
      meta.series = String(data.series);
    }

    posts.push(meta);
  }

  posts.sort(
    (a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
  );

  return posts;
}

/** Get a single blog post by slug, with rendered HTML and headings. */
export function getBlogPostBySlug(slug: string): BlogPost | null {
  if (!fs.existsSync(BLOG_DIR)) return null;

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));

  for (const file of files) {
    const filePath = path.join(BLOG_DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = parseFrontmatter<BlogFrontmatter>(raw);

    const postSlug = String(data.slug || file.replace(/\.md$/, ""));
    if (postSlug !== slug) continue;
    if (data.draft === true) continue;

    const post: BlogPost = {
      title: String(data.title || ""),
      slug: postSlug,
      description: String(data.description || ""),
      published_at: String(data.published_at || ""),
      updated_at: String(data.updated_at || data.published_at || ""),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      category: (data.category as BlogCategory) || "dev-notes",
      related_tool_slugs: Array.isArray(data.related_tool_slugs)
        ? data.related_tool_slugs.map(String)
        : [],
      draft: false,
      readingTime: estimateReadingTime(content),
      trustLevel: "generated" as const,
      contentHtml: markdownToHtml(content),
      headings: extractHeadings(content),
    };

    if (data.series) {
      post.series = String(data.series);
    }

    return post;
  }

  return null;
}

/**
 * Get all published posts belonging to a given series, sorted by
 * published_at ascending (oldest first).
 */
export function getSeriesPosts(seriesId: string): BlogPostMeta[] {
  const all = getAllBlogPosts();
  const filtered = all.filter((p) => p.series === seriesId);

  filtered.sort(
    (a, b) =>
      new Date(a.published_at).getTime() - new Date(b.published_at).getTime(),
  );

  return filtered;
}

/** Get all slugs for generateStaticParams. */
export function getAllBlogSlugs(): string[] {
  return getAllBlogPosts().map((p) => p.slug);
}

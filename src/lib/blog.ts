import fs from "node:fs";
import path from "node:path";
import {
  parseFrontmatter,
  markdownToHtml,
  extractHeadings,
  estimateReadingTime,
} from "@/lib/markdown";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

export type BlogCategory =
  | "guide"
  | "technical"
  | "ai-ops"
  | "release"
  | "behind-the-scenes";

export const CATEGORY_LABELS: Record<BlogCategory, string> = {
  guide: "ガイド",
  technical: "技術",
  "ai-ops": "AI運用",
  release: "リリース",
  "behind-the-scenes": "舞台裏",
};

export const ALL_CATEGORIES: BlogCategory[] = [
  "guide",
  "technical",
  "ai-ops",
  "release",
  "behind-the-scenes",
];

/** Series ID to display name mapping. */
export const SERIES_LABELS: Record<string, string> = {
  "ai-agent-ops": "AIエージェント運用記",
  "tool-guides": "ツール使い方ガイド",
  "building-yolos": "yolos.net構築の舞台裏",
  "japanese-culture": "日本語・日本文化",
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
  related_memo_ids: string[];
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
  related_memo_ids: string[];
  related_tool_slugs: string[];
  draft: boolean;
  readingTime: number;
}

export interface BlogPost extends BlogPostMeta {
  contentHtml: string;
  headings: { level: number; text: string; id: string }[];
}

/**
 * List all published blog posts, sorted by published_at descending.
 * Reads from src/content/blog/*.md at build time.
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
      category: (data.category as BlogCategory) || "technical",
      related_memo_ids: Array.isArray(data.related_memo_ids)
        ? data.related_memo_ids.map(String)
        : [],
      related_tool_slugs: Array.isArray(data.related_tool_slugs)
        ? data.related_tool_slugs.map(String)
        : [],
      draft: false,
      readingTime: estimateReadingTime(content),
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
      category: (data.category as BlogCategory) || "technical",
      related_memo_ids: Array.isArray(data.related_memo_ids)
        ? data.related_memo_ids.map(String)
        : [],
      related_tool_slugs: Array.isArray(data.related_tool_slugs)
        ? data.related_tool_slugs.map(String)
        : [],
      draft: false,
      readingTime: estimateReadingTime(content),
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

/** Get all unique tags across published posts. */
export function getAllBlogTags(): string[] {
  const posts = getAllBlogPosts();
  const tagSet = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}

/** Get all slugs for generateStaticParams. */
export function getAllBlogSlugs(): string[] {
  return getAllBlogPosts().map((p) => p.slug);
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicMemoById } from "@/memos/_lib/memos";
import { getAllBlogPosts } from "@/blog/_lib/blog";
import {
  generateMemoPageMetadata,
  generateMemoPageJsonLd,
  safeJsonLdStringify,
} from "@/lib/seo";
import Breadcrumb from "@/components/common/Breadcrumb";
import MemoDetail from "@/memos/_components/MemoDetail";
import RelatedBlogPosts from "@/memos/_components/RelatedBlogPosts";
import styles from "./page.module.css";

interface Props {
  params: Promise<{ id: string }>;
}

// Maximum number of memo pages to pre-generate at build time.
// Each page adds ~154KB to the build output; this cap keeps the total
// well within Vercel's 75MB deployment limit (~5MB for 30 pages).
const MAX_STATIC_MEMO_PAGES = 30;

// Pre-generate memo pages that are linked from recent blog posts for fast
// navigation. Only a limited subset is statically generated; the rest are
// generated on-demand to stay within Vercel's 75MB build output limit.
// Blog posts are sorted newest-first, so we prioritize recent posts' memos.
export function generateStaticParams() {
  const blogPosts = getAllBlogPosts();
  const linkedMemoIds: string[] = [];
  const seen = new Set<string>();

  // blogPosts are already sorted by published_at descending (newest first).
  // Collect memo IDs from recent posts first, stopping at the cap.
  for (const post of blogPosts) {
    for (const id of post.related_memo_ids ?? []) {
      if (!seen.has(id)) {
        seen.add(id);
        linkedMemoIds.push(id);
        if (linkedMemoIds.length >= MAX_STATIC_MEMO_PAGES) {
          return linkedMemoIds.map((memoId) => ({ id: memoId }));
        }
      }
    }
  }

  return linkedMemoIds.map((id) => ({ id }));
}

// Memos are immutable once created, so permanent caching is appropriate.
export const revalidate = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const memo = getPublicMemoById(id);
  if (!memo) return {};
  return generateMemoPageMetadata(memo);
}

export default async function MemoPage({ params }: Props) {
  const { id } = await params;
  const memo = getPublicMemoById(id);
  if (!memo) notFound();

  const jsonLd = generateMemoPageJsonLd(memo);

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
      />

      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "メモ", href: "/memos" },
          { label: memo.subject },
        ]}
      />

      <MemoDetail memo={memo} />
      <RelatedBlogPosts memoId={memo.id} />
    </div>
  );
}

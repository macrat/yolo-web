import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicMemoById } from "@/memos/_lib/memos";
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

// Memo pages are not pre-generated at build time because there are no longer
// any blog posts that reference memo IDs. Pages are generated on-demand.
export function generateStaticParams() {
  return [];
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
      <RelatedBlogPosts />
    </div>
  );
}

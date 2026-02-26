import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPublicMemoIds, getPublicMemoById } from "@/memos/_lib/memos";
import { generateMemoPageMetadata, generateMemoPageJsonLd } from "@/lib/seo";
import Breadcrumb from "@/components/common/Breadcrumb";
import MemoDetail from "@/memos/_components/MemoDetail";
import RelatedBlogPosts from "@/memos/_components/RelatedBlogPosts";
import styles from "./page.module.css";

interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return getAllPublicMemoIds().map((id) => ({ id }));
}

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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

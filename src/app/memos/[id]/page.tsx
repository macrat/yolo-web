import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPublicMemoIds, getPublicMemoById } from "@/lib/memos";
import { generateMemoPageMetadata, generateMemoPageJsonLd } from "@/lib/seo";
import Breadcrumb from "@/components/common/Breadcrumb";
import MemoDetail from "@/components/memos/MemoDetail";
import RelatedBlogPosts from "@/components/memos/RelatedBlogPosts";
import AiDisclaimer from "@/components/common/AiDisclaimer";
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
    <main className={styles.container}>
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
      <AiDisclaimer />
    </main>
  );
}

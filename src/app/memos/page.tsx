import type { Metadata } from "next";
import {
  getFilteredMemoSummaries,
  getAllMemoTags,
  getAllMemoRoles,
} from "@/memos/_lib/memos";
import { MEMOS_PER_PAGE } from "@/lib/pagination";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import MemoFilter from "@/memos/_components/MemoFilter";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `エージェントメモアーカイブ | ${SITE_NAME}`,
  description:
    "AIエージェント間の実際のやりとりを公開。プロジェクトの意思決定過程を透明に記録します。",
  openGraph: {
    title: `エージェントメモアーカイブ | ${SITE_NAME}`,
    description:
      "AIエージェント間の実際のやりとりを公開。プロジェクトの意思決定過程を透明に記録します。",
    type: "website",
    url: `${BASE_URL}/memos`,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `エージェントメモアーカイブ | ${SITE_NAME}`,
    description:
      "AIエージェント間の実際のやりとりを公開。プロジェクトの意思決定過程を透明に記録します。",
  },
  alternates: {
    canonical: `${BASE_URL}/memos`,
    types: {
      "application/rss+xml": "/memos/feed",
      "application/atom+xml": "/memos/feed/atom",
    },
  },
  robots: { index: false, follow: true },
};

interface MemosPageProps {
  searchParams: Promise<{ page?: string; role?: string; tag?: string }>;
}

export default async function MemosPage({ searchParams }: MemosPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const role = params.role ?? "all";
  const tag = params.tag ?? "all";

  const { items, totalItems, totalPages, currentPage } =
    getFilteredMemoSummaries({
      role,
      tag,
      page,
      perPage: MEMOS_PER_PAGE,
    });
  const allTags = getAllMemoTags();
  const allRoles = getAllMemoRoles();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>エージェントメモアーカイブ</h1>
        <p className={styles.description}>
          AIエージェント間の実際のやりとりを公開。プロジェクトの意思決定過程を透明に記録します。
        </p>
      </header>

      <MemoFilter
        memos={items}
        allTags={allTags}
        allRoles={allRoles}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        currentRole={role}
        currentTag={tag}
      />
    </div>
  );
}

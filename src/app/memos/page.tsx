import type { Metadata } from "next";
import {
  getAllPublicMemos,
  getAllMemoTags,
  getAllMemoRoles,
} from "@/memos/_lib/memos";
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
};

export default function MemosPage() {
  const memos = getAllPublicMemos();
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

      {memos.length === 0 ? (
        <p className={styles.empty}>公開メモはまだありません。</p>
      ) : (
        <MemoFilter memos={memos} allTags={allTags} allRoles={allRoles} />
      )}
    </div>
  );
}

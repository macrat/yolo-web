import { Suspense } from "react";
import Link from "next/link";
import type { ToolMeta } from "@/tools/types";
import Panel from "@/components/Panel";
import ToolsFilterableList from "./ToolsFilterableList";
import styles from "./ToolsListView.module.css";

interface ToolsListViewProps {
  tools: ToolMeta[];
}

/** NEW ラベルを表示する閾値（ミリ秒）: 90日 */
const NEW_BADGE_THRESHOLD_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * ツール一覧ページのビュー (Server Component)。
 * ページヘッダーとフィルター付きツール一覧を表示する。
 * useSearchParams を使う ToolsFilterableList は Suspense でラップする（Next.js 要件）。
 *
 * Date.now() は react-hooks/purity 制約により Client Component 内で使用できないため、
 * Server Component のここで計算して newSlugs として渡す。
 */
export default function ToolsListView({ tools }: ToolsListViewProps) {
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const newSlugs: ReadonlySet<string> = new Set(
    tools
      .filter(
        (tool) =>
          now - new Date(tool.publishedAt).getTime() < NEW_BADGE_THRESHOLD_MS,
      )
      .map((tool) => tool.slug),
  );

  return (
    <div className={styles.container}>
      <Panel as="section" className={styles.header}>
        <h1 className={styles.title}>無料オンラインツール</h1>
        <p className={styles.description}>
          仕事や日常に役立つ便利ツールを集めました。すべて無料・登録不要でブラウザ上ですぐにお使いいただけます。
        </p>
      </Panel>
      <Suspense>
        <ToolsFilterableList tools={tools} newSlugs={newSlugs} />
      </Suspense>
      {/* ヘッダーナビからチートシートを除外した分の導線を補完 */}
      <div className={styles.cheatsheetBanner}>
        <Link href="/cheatsheets" className={styles.cheatsheetLink}>
          正規表現・Git・Markdownなどのチートシートもチェック →
        </Link>
      </div>
    </div>
  );
}

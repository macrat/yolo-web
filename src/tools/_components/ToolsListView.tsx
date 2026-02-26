import type { ToolMeta } from "@/tools/types";
import ToolsGrid from "./ToolsGrid";
import Pagination from "@/components/common/Pagination";
import styles from "./ToolsListView.module.css";

interface ToolsListViewProps {
  /** Tools for the current page */
  tools: ToolMeta[];
  /** Current 1-based page number */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
}

/**
 * Shared view for the tools list page.
 * Renders the page header, tool grid, and pagination controls.
 * Used by both /tools (page 1) and /tools/page/[page] (page 2+).
 */
export default function ToolsListView({
  tools,
  currentPage,
  totalPages,
}: ToolsListViewProps) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {currentPage > 1
            ? `無料オンラインツール（${currentPage}ページ目）`
            : "無料オンラインツール"}
        </h1>
        <p className={styles.description}>
          仕事や日常に役立つ便利ツールを集めました。文字数カウント・日付計算から、JSON整形・正規表現テストまで、すべて無料・登録不要でブラウザ上ですぐにお使いいただけます。
        </p>
      </header>
      <ToolsGrid tools={tools} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/tools"
      />
    </div>
  );
}

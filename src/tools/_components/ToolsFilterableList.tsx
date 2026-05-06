"use client";

import { useSearchParams, useRouter } from "next/navigation";
import type { ToolMeta } from "@/tools/types";
import ToolsGrid from "./ToolsGrid";
import { CATEGORIES } from "./categoryLabels";
import type { CategoryValue } from "./categoryLabels";
import styles from "./ToolsFilterableList.module.css";

interface ToolsFilterableListProps {
  tools: ToolMeta[];
}

/**
 * カテゴリ絞り込みフィルター付きツール一覧 (Client Component)。
 * URL の ?category= パラメータでフィルター状態を管理する。
 * ブラウザの戻る/進むに対応するため router.replace() で URL を更新する。
 */
export default function ToolsFilterableList({
  tools,
}: ToolsFilterableListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeCategory = searchParams.get("category") as CategoryValue | null;

  const filteredTools = activeCategory
    ? tools.filter((tool) => tool.category === activeCategory)
    : tools;

  function setFilter(value: CategoryValue): void {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("category") === value) {
      // 同じカテゴリを押したら解除
      params.delete("category");
    } else {
      params.set("category", value);
    }
    const query = params.toString();
    router.replace(query ? `?${query}` : "?");
  }

  function clearFilter(): void {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    const query = params.toString();
    router.replace(query ? `?${query}` : "?");
  }

  return (
    <div className={styles.wrapper}>
      <nav aria-label="カテゴリで絞り込む" className={styles.filterNav}>
        <button
          className={styles.filterButton}
          data-active={!activeCategory || undefined}
          aria-pressed={!activeCategory}
          onClick={() => clearFilter()}
        >
          すべて
        </button>
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            className={styles.filterButton}
            data-active={activeCategory === value || undefined}
            aria-pressed={activeCategory === value}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </nav>
      <ToolsGrid tools={filteredTools} />
    </div>
  );
}

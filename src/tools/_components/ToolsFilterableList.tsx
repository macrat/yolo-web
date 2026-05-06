"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { ToolMeta } from "@/tools/types";
import Input from "@/components/Input";
import Button from "@/components/Button";
import ToolsGrid from "./ToolsGrid";
import { CATEGORIES } from "./categoryLabels";
import type { CategoryValue } from "./categoryLabels";
import styles from "./ToolsFilterableList.module.css";

interface ToolsFilterableListProps {
  tools: ToolMeta[];
  /**
   * NEW ラベルを表示するツールのスラッグ集合。
   * 呼び出し元の Server Component（ToolsListView）で計算して渡す。
   * Date.now() は react-hooks/purity 制約により Client Component 内で使用できないため。
   */
  newSlugs: ReadonlySet<string>;
}

/**
 * カテゴリ絞り込みフィルター付きツール一覧 (Client Component)。
 * URL の ?category= パラメータでフィルター状態を管理する。
 * ブラウザの戻る/進むに対応するため router.push() で URL を更新する。
 * 表示順: publishedAt 降順（新しい順）
 */
export default function ToolsFilterableList({
  tools,
  newSlugs,
}: ToolsFilterableListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  const activeCategory = searchParams.get("category") as CategoryValue | null;

  // カテゴリフィルター → キーワードフィルター → ソート の順に適用
  let filtered = activeCategory
    ? tools.filter((tool) => tool.category === activeCategory)
    : tools;

  if (keyword.trim()) {
    const lower = keyword.trim().toLowerCase();
    filtered = filtered.filter(
      (tool) =>
        tool.name.toLowerCase().includes(lower) ||
        tool.shortDescription.toLowerCase().includes(lower),
    );
  }

  // publishedAt 降順（新しい順）でソート
  const sortedTools = [...filtered].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  function setFilter(value: CategoryValue): void {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("category") === value) {
      // 同じカテゴリを押したら解除
      params.delete("category");
    } else {
      params.set("category", value);
    }
    const query = params.toString();
    router.push(query ? `/tools?${query}` : "/tools");
  }

  function clearFilter(): void {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    const query = params.toString();
    router.push(query ? `/tools?${query}` : "/tools");
  }

  return (
    <div className={styles.wrapper}>
      <Input
        type="search"
        className={styles.searchInput}
        placeholder="ツールを検索…"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        aria-label="ツールをキーワードで検索"
      />
      <nav aria-label="カテゴリで絞り込む" className={styles.filterNav}>
        <Button
          className={styles.filterButton}
          variant={!activeCategory ? "primary" : "default"}
          aria-pressed={!activeCategory}
          onClick={() => clearFilter()}
        >
          すべて
        </Button>
        {CATEGORIES.map(({ value, label }) => (
          <Button
            key={value}
            className={styles.filterButton}
            variant={activeCategory === value ? "primary" : "default"}
            aria-pressed={activeCategory === value}
            onClick={() => setFilter(value)}
          >
            {label}
          </Button>
        ))}
      </nav>
      {sortedTools.length > 0 ? (
        <ToolsGrid tools={sortedTools} newSlugs={newSlugs} />
      ) : (
        <p className={styles.noResults} role="status">
          該当するツールが見つかりませんでした。
        </p>
      )}
    </div>
  );
}

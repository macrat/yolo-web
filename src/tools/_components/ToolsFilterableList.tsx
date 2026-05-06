"use client";

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
 * キーワード検索とカテゴリの絞り込み付きツール一覧 (Client Component)。
 *
 * すべてのフィルター状態を URL search params で管理する:
 * - ?q=キーワード — キーワード検索
 * - ?category=text — カテゴリ絞り込み
 *
 * URL に状態を持つことで、リンク共有・ブラウザ戻る/進むに対応する。
 * 表示順: publishedAt 降順（新しい順）
 */
export default function ToolsFilterableList({
  tools,
  newSlugs,
}: ToolsFilterableListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeCategory = searchParams.get("category") as CategoryValue | null;
  const keyword = searchParams.get("q") ?? "";

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

  /**
   * URL search params を更新するヘルパー。
   * method: "push" は履歴に追加（カテゴリボタン押下など明示的な操作用）、
   *         "replace" は履歴を置き換え（キーストロークごとの入力など連続操作用）。
   */
  function updateParams(
    updater: (params: URLSearchParams) => void,
    method: "push" | "replace" = "push",
  ): void {
    const params = new URLSearchParams(searchParams.toString());
    updater(params);
    const query = params.toString();
    const url = query ? `/tools?${query}` : "/tools";
    if (method === "replace") {
      router.replace(url);
    } else {
      router.push(url);
    }
  }

  function setFilter(value: CategoryValue): void {
    updateParams((params) => {
      if (params.get("category") === value) {
        params.delete("category");
      } else {
        params.set("category", value);
      }
    });
  }

  function clearFilter(): void {
    updateParams((params) => {
      params.delete("category");
    });
  }

  function setKeyword(value: string): void {
    updateParams((params) => {
      if (value.trim()) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
    }, "replace");
  }

  return (
    <div className={styles.wrapper}>
      <Input
        type="search"
        className={styles.searchInput}
        placeholder="ツールを検索…"
        defaultValue={keyword}
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

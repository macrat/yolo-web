"use client";

import { useEffect, useState } from "react";
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

/** キーワード検索の URL 反映を遅延させるミリ秒。連続入力中は URL を更新せず、入力が止まってから反映する */
const KEYWORD_DEBOUNCE_MS = 300;

const VALID_CATEGORY_VALUES = new Set<string>(CATEGORIES.map((c) => c.value));

/**
 * キーワード検索とカテゴリの絞り込み付きツール一覧 (Client Component)。
 *
 * フィルター状態の管理:
 * - キーワード: ローカル state (即座に反映) + URL の `?q=` (debounce で遅延反映)
 *   高速タイピング時のキーストローク取りこぼしと、navigation の連続発生による
 *   ブラウザ/Playwright のデッドロックを防ぐため。
 * - カテゴリ: URL の `?category=` (即座に反映、ブラウザ戻る/進む対応)
 *
 * 表示順: publishedAt 降順（新しい順）
 */
export default function ToolsFilterableList({
  tools,
  newSlugs,
}: ToolsFilterableListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 不正なカテゴリ値（URL のタイポ等）は null として扱う
  const rawCategory = searchParams.get("category");
  const activeCategory: CategoryValue | null =
    rawCategory && VALID_CATEGORY_VALUES.has(rawCategory)
      ? (rawCategory as CategoryValue)
      : null;
  const urlKeyword = searchParams.get("q") ?? "";

  // キーワードはローカル state で管理し、URL は debounce で遅延更新する
  const [keyword, setKeywordLocal] = useState(urlKeyword);

  // URL から開かれた / ブラウザ戻るで URL が変わった場合、ローカル state も追従する
  useEffect(() => {
    setKeywordLocal(urlKeyword);
  }, [urlKeyword]);

  // ローカル state の keyword を debounce して URL に反映
  useEffect(() => {
    if (keyword === urlKeyword) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (keyword.trim()) {
        params.set("q", keyword);
      } else {
        params.delete("q");
      }
      const query = params.toString();
      router.replace(query ? `/tools?${query}` : "/tools");
    }, KEYWORD_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- searchParams の更新で再起動しない（urlKeyword で代用）
  }, [keyword, urlKeyword, router]);

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

  /** カテゴリフィルターは即座に URL に反映する（明示的な操作なので履歴も追加） */
  function updateCategoryParams(
    updater: (params: URLSearchParams) => void,
  ): void {
    const params = new URLSearchParams(searchParams.toString());
    updater(params);
    const query = params.toString();
    router.push(query ? `/tools?${query}` : "/tools");
  }

  function setFilter(value: CategoryValue): void {
    updateCategoryParams((params) => {
      if (params.get("category") === value) {
        params.delete("category");
      } else {
        params.set("category", value);
      }
    });
  }

  function clearFilter(): void {
    updateCategoryParams((params) => {
      params.delete("category");
    });
  }

  return (
    <div className={styles.wrapper}>
      <Input
        type="search"
        className={styles.searchInput}
        placeholder="ツールを検索…"
        value={keyword}
        onChange={(e) => setKeywordLocal(e.target.value)}
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
          該当するツールが見つかりませんでした。キーワードを変えるか、カテゴリを切り替えてみてください。
        </p>
      )}
    </div>
  );
}

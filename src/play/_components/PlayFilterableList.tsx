"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { PlayContentMeta } from "@/play/types";
import Input from "@/components/Input";
import PlayGrid from "./PlayGrid";
import { PLAY_CATEGORIES } from "./categoryLabels";
import type { PlayCategoryValue } from "./categoryLabels";
import styles from "./PlayFilterableList.module.css";

interface PlayFilterableListProps {
  contents: PlayContentMeta[];
  /**
   * NEW ラベルを表示するコンテンツのスラッグ集合。
   * 呼び出し元の Server Component（PlayListView）で計算して渡す。
   * Date.now() は react-hooks/purity 制約により Client Component 内で使用できないため。
   */
  newSlugs: ReadonlySet<string>;
}

/** キーワード検索の URL 反映を遅延させるミリ秒。連続入力中は URL を更新せず、入力が止まってから反映する */
const KEYWORD_DEBOUNCE_MS = 300;

const VALID_CATEGORY_VALUES = new Set<string>(
  PLAY_CATEGORIES.map((c) => c.value),
);

/**
 * キーワード検索とカテゴリの絞り込み付き遊びコンテンツ一覧 (Client Component)。
 *
 * フィルター状態の管理:
 * - キーワード: ローカル state (即座に反映) + URL の `?q=` (debounce で遅延反映)
 *   高速タイピング時のキーストローク取りこぼしと、navigation の連続発生による
 *   ブラウザ/Playwright のデッドロックを防ぐため。
 * - カテゴリ: URL の `?category=` (即座に反映、ブラウザ戻る/進む対応)
 *
 * 表示順: publishedAt 降順（新しい順）
 */
export default function PlayFilterableList({
  contents,
  newSlugs,
}: PlayFilterableListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 不正なカテゴリ値（URL のタイポ等）は null として扱う
  const rawCategory = searchParams.get("category");
  const activeCategory: PlayCategoryValue | null =
    rawCategory && VALID_CATEGORY_VALUES.has(rawCategory)
      ? (rawCategory as PlayCategoryValue)
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
      router.replace(query ? `/play?${query}` : "/play");
    }, KEYWORD_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- searchParams の更新で再起動しない（urlKeyword で代用）
  }, [keyword, urlKeyword, router]);

  // カテゴリフィルター → キーワードフィルター → ソート の順に適用
  let filtered = activeCategory
    ? contents.filter((content) => content.category === activeCategory)
    : contents;

  if (keyword.trim()) {
    const lower = keyword.trim().toLowerCase();
    filtered = filtered.filter((content) => {
      const targets = [
        content.title,
        content.shortTitle ?? "",
        content.shortDescription,
        ...(content.keywords ?? []),
      ];
      return targets.some((t) => t.toLowerCase().includes(lower));
    });
  }

  // publishedAt 降順（新しい順）でソート
  const sortedContents = [...filtered].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  /**
   * カテゴリリンクの href を生成する。
   * 現在のキーワード（q=）を引き継ぎ、カテゴリを切り替えてもキーワードが消えないようにする。
   */
  function buildCategoryHref(category: PlayCategoryValue | null): string {
    const params = new URLSearchParams();
    if (keyword.trim()) {
      params.set("q", keyword);
    }
    if (category) {
      params.set("category", category);
    }
    const query = params.toString();
    return query ? `/play?${query}` : "/play";
  }

  return (
    <div className={styles.wrapper}>
      <Input
        type="search"
        className={styles.searchInput}
        placeholder="コンテンツを検索…"
        value={keyword}
        onChange={(e) => setKeywordLocal(e.target.value)}
        aria-label="遊びコンテンツをキーワードで検索"
      />
      <nav aria-label="カテゴリで絞り込む" className={styles.filterNav}>
        <Link
          href={buildCategoryHref(null)}
          className={styles.filterButton}
          data-active={!activeCategory ? "true" : undefined}
          aria-current={!activeCategory ? "page" : undefined}
        >
          すべて
        </Link>
        {PLAY_CATEGORIES.map(({ value, label }) => (
          <Link
            key={value}
            href={buildCategoryHref(value)}
            className={styles.filterButton}
            data-active={activeCategory === value ? "true" : undefined}
            aria-current={activeCategory === value ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      {sortedContents.length > 0 ? (
        <PlayGrid contents={sortedContents} newSlugs={newSlugs} />
      ) : (
        <p className={styles.noResults} role="status">
          該当するコンテンツが見つかりませんでした。キーワードを変えるか、カテゴリを切り替えてみてください。
        </p>
      )}
    </div>
  );
}

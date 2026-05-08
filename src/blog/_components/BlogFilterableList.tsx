"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { BlogPostMeta, BlogCategory } from "@/blog/_lib/blog";
import Input from "@/components/Input";
import Pagination from "@/components/Pagination";
import BlogGrid from "./BlogGrid";
import { filterPostsByKeyword } from "./searchFilter";
import styles from "./BlogFilterableList.module.css";

interface CategoryItem {
  value: BlogCategory;
  label: string;
}

interface TagHeader {
  tag: string;
  description: string;
}

interface BlogFilterableListProps {
  /**
   * 現在のページに表示する記事（ページネーション済み）。
   * キーワード検索が有効な場合はこれを使わず allPosts から全件フィルタする。
   */
  posts: BlogPostMeta[];
  /** 現在の 1-based ページ番号 */
  currentPage: number;
  /** 総ページ数（キーワード非検索時） */
  totalPages: number;
  /** ページネーションリンクのベースパス（例: "/blog" / "/blog/category/dev-notes"） */
  basePath: string;
  /** 現在アクティブなカテゴリスラッグ（カテゴリページの場合のみ設定） */
  activeCategory?: BlogCategory;
  /**
   * 全記事（ページネーション前）。
   * カテゴリカウント表示・人気タグ算出・キーワード検索の全件対象として使う。
   * タグページでは省略可（省略時は件数バッジなし）。
   */
  allPosts?: BlogPostMeta[];
  /**
   * タグページ専用ヘッダー情報。
   * 設定されている場合はカテゴリナビではなくタグヘッダーを表示する。
   */
  tagHeader?: TagHeader;
  /**
   * NEW バッジを表示する記事のスラッグ集合。
   * 呼び出し元の Server Component（BlogListView）で計算して渡す。
   * Date.now() は react-hooks/purity 制約により Client Component 内で使用できないため。
   */
  newSlugs: ReadonlySet<string>;
  /**
   * カテゴリ一覧（Server Component から渡す）。
   * node:fs を使う @/blog/_lib/blog を Client Component から直接インポートできないため props で受け取る。
   */
  categories: CategoryItem[];
  /**
   * カテゴリID → 表示名のマッピング（Server Component から渡す）。
   * node:fs を使う @/blog/_lib/blog を Client Component から直接インポートできないため props で受け取る。
   */
  categoryLabels: Record<string, string>;
  /**
   * シリーズID → 表示名のマッピング（Server Component から渡す）。
   * node:fs を使う @/blog/_lib/blog を Client Component から直接インポートできないため props で受け取る。
   */
  seriesLabels: Record<string, string>;
  /**
   * リンク化するタグの集合。BlogGrid → BlogCard へそのまま流す。
   * node:fs を使う @/blog/_lib/blog を Client Component から直接インポートできないため props で受け取る。
   * 未指定の場合は後方互換のためすべてのタグをリンク化する。
   */
  linkableTags?: ReadonlySet<string>;
}

/** キーワード検索の URL 反映を遅延させるミリ秒 */
const KEYWORD_DEBOUNCE_MS = 300;

/** フィルタ未適用時に表示する人気タグの上限 */
const TOP_TAGS_COUNT = 8;

/**
 * カテゴリリンクの href を生成する。
 * 現在のキーワード（q=）を引き継ぎ、カテゴリを切り替えてもキーワードが消えないようにする。
 */
function buildCategoryHref(
  category: BlogCategory | null,
  keyword: string,
): string {
  const params = new URLSearchParams();
  if (keyword.trim()) {
    params.set("q", keyword);
  }
  const query = params.toString();
  if (category) {
    return query
      ? `/blog/category/${category}?${query}`
      : `/blog/category/${category}`;
  }
  return query ? `/blog?${query}` : "/blog";
}

/**
 * タグリンクの href を生成する。
 * 現在のキーワード（q=）を引き継ぐ。
 */
function buildTagHref(tag: string, keyword: string): string {
  const params = new URLSearchParams();
  if (keyword.trim()) {
    params.set("q", keyword);
  }
  const query = params.toString();
  return query ? `/blog/tag/${tag}?${query}` : `/blog/tag/${tag}`;
}

/**
 * キーワード検索とカテゴリナビ付きブログ記事一覧 (Client Component)。
 *
 * フィルター状態の管理:
 * - キーワード: ローカル state（即時反映）+ URL の `?q=`（debounce で遅延反映）
 * - カテゴリ: URL ベースの静的ルーティング（/blog/category/[cat]）
 *
 * キーワード検索が有効な場合:
 * - allPosts の全件に対してフィルタする（ページネーション無効化）
 * - ページネーションコンポーネントは非表示
 */
export default function BlogFilterableList({
  posts,
  currentPage,
  totalPages,
  basePath,
  activeCategory,
  allPosts = [],
  tagHeader,
  newSlugs,
  categories,
  categoryLabels,
  seriesLabels,
  linkableTags,
}: BlogFilterableListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

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
      // カテゴリページやタグページでも basePath を使って URL を構築
      router.replace(query ? `${basePath}?${query}` : basePath);
    }, KEYWORD_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- searchParams の更新で再起動しない（urlKeyword で代用）
  }, [keyword, urlKeyword, router, basePath]);

  // カテゴリごとの記事件数を算出
  const countByCategory: Record<string, number> = {};
  for (const post of allPosts) {
    countByCategory[post.category] = (countByCategory[post.category] ?? 0) + 1;
  }

  // 人気タグを算出（使用頻度上位 TOP_TAGS_COUNT 個）
  const tagCounts: Record<string, number> = {};
  for (const post of allPosts) {
    for (const tag of post.tags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }
  const popularTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_TAGS_COUNT)
    .map(([tag]) => tag);

  // カテゴリフィルタ未適用かつタグページでない時のみ人気タグを表示
  const showPopularTags =
    !activeCategory && !tagHeader && popularTags.length > 0;

  // キーワード検索が有効な場合: allPosts 全件を対象にフィルタ（ページネーション無効化）
  const isSearching = keyword.trim().length > 0;

  let displayPosts: BlogPostMeta[];
  if (isSearching) {
    // タグページ: allPosts（タグ絞り込み済み全件）を対象にする
    // カテゴリページ: allPosts からカテゴリ絞り込み済み全件を対象にする
    // 通常ページ: allPosts 全件を対象にする
    const searchBase = tagHeader
      ? allPosts.length > 0
        ? allPosts.filter((p) => p.tags.includes(tagHeader.tag))
        : posts
      : activeCategory
        ? allPosts.filter((p) => p.category === activeCategory)
        : allPosts;
    displayPosts = filterPostsByKeyword(
      searchBase,
      keyword,
      categoryLabels,
      seriesLabels,
    );
  } else {
    displayPosts = posts;
  }

  const hitCount = isSearching ? displayPosts.length : null;

  return (
    <div className={styles.wrapper}>
      {/* カテゴリナビ（タグページ以外） */}
      {!tagHeader && (
        <nav aria-label="カテゴリで絞り込む" className={styles.filterNav}>
          <Link
            href={buildCategoryHref(null, keyword)}
            className={styles.filterButton}
            data-active={!activeCategory ? "true" : undefined}
            aria-current={!activeCategory ? "page" : undefined}
          >
            すべて
            {allPosts.length > 0 && (
              <span className={styles.count}>{allPosts.length}</span>
            )}
          </Link>
          {categories.map(({ value, label }) => (
            <Link
              key={value}
              href={buildCategoryHref(value, keyword)}
              className={styles.filterButton}
              data-active={activeCategory === value ? "true" : undefined}
              aria-current={activeCategory === value ? "page" : undefined}
            >
              {label}
              {allPosts.length > 0 && (
                <span className={styles.count}>
                  {countByCategory[value] ?? 0}
                </span>
              )}
            </Link>
          ))}
        </nav>
      )}

      {/* キーワード検索 */}
      <Input
        type="search"
        className={styles.searchInput}
        placeholder="記事を検索…"
        value={keyword}
        onChange={(e) => setKeywordLocal(e.target.value)}
        aria-label="ブログ記事をキーワードで検索"
      />

      {/* 人気タグ（フィルタ未適用かつタグページでない時のみ） */}
      {showPopularTags && (
        <nav aria-label="人気タグ" className={styles.popularTags}>
          <span className={styles.popularTagsLabel}>タグで探す</span>
          <div className={styles.popularTagsList}>
            {popularTags.map((tag) => (
              <Link
                key={tag}
                href={buildTagHref(tag, keyword)}
                className={styles.tagPill}
              >
                {tag}
              </Link>
            ))}
          </div>
        </nav>
      )}

      {/* 検索ヒット件数（>=1 件時のみ表示） */}
      {isSearching && hitCount !== null && hitCount > 0 && (
        <p className={styles.hitCount} aria-live="polite" aria-atomic="true">
          {hitCount}件ヒット
        </p>
      )}

      {/* 記事グリッド / 空状態 */}
      {displayPosts.length > 0 ? (
        <BlogGrid
          posts={displayPosts}
          newSlugs={newSlugs}
          categoryLabels={categoryLabels}
          linkableTags={linkableTags}
        />
      ) : (
        <p className={styles.noResults} role="status">
          {isSearching
            ? "一致する記事が見つかりませんでした。キーワードを変えるか、カテゴリやタグを切り替えると見つかるかもしれません。"
            : tagHeader
              ? "このタグの記事はまだありません。"
              : activeCategory
                ? "このカテゴリの記事はまだありません。"
                : "まだ記事がありません。"}
        </p>
      )}

      {/* ページネーション（キーワード検索中は非表示） */}
      {/* paginationWrapper: Pagination pageItem の 44px タップターゲット上書き用 */}
      {!isSearching && (
        <div className={styles.paginationWrapper}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={basePath}
          />
        </div>
      )}
    </div>
  );
}

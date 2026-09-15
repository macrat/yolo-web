"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { BlogPostMeta, BlogCategory } from "@/blog/_lib/blog";
import Input from "@/components/Input";
import Pagination from "@/components/Pagination";
import BlogList from "./BlogList";
import { filterPostsByKeyword } from "./searchFilter";
import styles from "./BlogFilterableList.module.css";

interface CategoryItem {
  value: BlogCategory;
  label: string;
}

/** タグページの見出しに出す情報。 */
export interface TagHeader {
  tag: string;
  description: string;
}

/**
 * 一覧ルートが供給する中身。一覧を描く 6 ルートすべてがこの形で渡す。
 */
export interface BlogListSource {
  /** 現在のページに表示する記事（ページネーション済み） */
  posts: BlogPostMeta[];
  /** 現在の 1-based ページ番号 */
  currentPage: number;
  /** 総ページ数（キーワード非検索時） */
  totalPages: number;
  /** ページネーションリンクのベースパス（例: "/blog" / "/blog/category/dev-notes"） */
  basePath: string;
  /** 現在アクティブなカテゴリスラッグ（カテゴリページのみ設定） */
  activeCategory?: BlogCategory;
  /**
   * この一覧の母集合（ページネーション前の全件）。
   * 件数バッジ・人気タグ・キーワード検索の対象になる。
   * カテゴリページはカテゴリ横断の件数を出すためサイトの全記事を、
   * タグページはそのタグが付いた全記事を渡す。
   */
  allPosts: BlogPostMeta[];
  /** タグページの見出し情報。設定されていればタグページとして描く。 */
  tagHeader?: TagHeader;
}

/**
 * 一覧の描画に必要なデータ一式。
 *
 * ルートが供給する {@link BlogListSource} に、Server Component でしか用意できない値を足したもの。
 * node:fs を使う `@/blog/_lib/blog` は Client Component からインポートできず、
 * Date.now() も react-hooks/purity 制約により Client Component 内で呼べないため、
 * これらは BlogListView が解決し、シリアライズ可能な形にして props で運ぶ。
 */
export interface BlogListData extends BlogListSource {
  /** 「新着」マークを表示する記事のスラッグ集合 */
  newSlugs: ReadonlySet<string>;
  /** カテゴリナビに並べるカテゴリ（表示順） */
  categories: CategoryItem[];
  /** カテゴリID → 表示名のマッピング */
  categoryLabels: Record<string, string>;
  /** シリーズID → 表示名のマッピング */
  seriesLabels: Record<string, string>;
  /**
   * タグページを持つタグの集合。{@link BlogList} 経由で TagList に流し、
   * 行き先のページを持たないタグを描かないようにする。
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
 * タグ名は URL セグメントとしてエンコードする（`#` `/` 空白などを含むタグ名でも、
 * リンク先がそのタグのページに一致する）。
 */
function buildTagHref(tag: string, keyword: string): string {
  const params = new URLSearchParams();
  if (keyword.trim()) {
    params.set("q", keyword);
  }
  const query = params.toString();
  const path = `/blog/tag/${encodeURIComponent(tag)}`;
  return query ? `${path}?${query}` : path;
}

/**
 * キーワード検索の対象になる記事。
 * 母集合を、この一覧がすでに掛けている絞り込み（タグ・カテゴリ）まで狭める。
 */
function selectSearchBase(
  allPosts: BlogPostMeta[],
  activeCategory: BlogCategory | undefined,
  tagHeader: TagHeader | undefined,
): BlogPostMeta[] {
  if (tagHeader) {
    return allPosts.filter((post) => post.tags.includes(tagHeader.tag));
  }
  if (activeCategory) {
    return allPosts.filter((post) => post.category === activeCategory);
  }
  return allPosts;
}

/**
 * 表示する記事が 0 件のときの一文。
 * いま何で絞り込んでいるかに合わせて、次にどうすれば記事へ辿り着けるかを伝える。
 *
 * タグページは掲載記事が閾値に満たないタグを 404 にするため、タグで絞った一覧が
 * 空になるのはキーワード検索で 0 件になったときだけ。
 */
function buildEmptyMessage(
  isSearching: boolean,
  activeCategory: BlogCategory | undefined,
): string {
  if (isSearching) {
    return "一致する記事が見つかりませんでした。キーワードを変えるか、カテゴリやタグを切り替えると見つかるかもしれません。";
  }
  if (activeCategory) {
    return "このカテゴリの記事はまだありません。";
  }
  return "まだ記事がありません。";
}

/**
 * ブログ一覧の本体 (Client Component) — カテゴリナビ・キーワード検索欄・人気タグ・品書き・ページネーション。
 *
 * 絞り込みの持ち方:
 * - キーワードはローカル state で即時反映し、URL（`?q=`）へは debounce して書き戻す
 *   （読んでいる位置を保つため、書き戻しではスクロールさせない）。
 *   URL 直接アクセスやブラウザバックで `?q=` が変われば、ローカル state を追従させる
 * - カテゴリは URL ベースの静的ルーティング（/blog/category/[category]）
 *
 * キーワード検索が有効な場合:
 * - 母集合の全件に対してフィルタする（ページネーション無効化）
 * - ページネーションコンポーネントは非表示
 */
export default function BlogFilterableList({
  posts,
  currentPage,
  totalPages,
  basePath,
  activeCategory,
  allPosts,
  tagHeader,
  newSlugs,
  categories,
  categoryLabels,
  seriesLabels,
  linkableTags,
}: BlogListData) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlKeyword = searchParams.get("q") ?? "";

  // キーワードはローカル state で管理し、URL は debounce で遅延更新する
  const [keyword, setKeyword] = useState(urlKeyword);

  // URL から開かれた / ブラウザ戻るで URL が変わった場合、ローカル state も追従する
  useEffect(() => {
    setKeyword(urlKeyword);
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
      router.replace(query ? `${basePath}?${query}` : basePath, {
        scroll: false,
      });
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

  // キーワード検索が有効な場合: 母集合の全件を対象にフィルタ（ページネーション無効化）
  const isSearching = keyword.trim().length > 0;
  const displayPosts = isSearching
    ? filterPostsByKeyword(
        selectSearchBase(allPosts, activeCategory, tagHeader),
        keyword,
        categoryLabels,
        seriesLabels,
      )
    : posts;

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
        onChange={(event) => setKeyword(event.target.value)}
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
                className={styles.tagChip}
              >
                {tag}
              </Link>
            ))}
          </div>
        </nav>
      )}

      {/* 検索ヒット件数（>=1 件時のみ表示） */}
      {isSearching && displayPosts.length > 0 && (
        <p className={styles.hitCount} aria-live="polite" aria-atomic="true">
          {displayPosts.length}件ヒット
        </p>
      )}

      {/* 記事一覧（品書き） / 空状態 */}
      {displayPosts.length > 0 ? (
        <BlogList
          posts={displayPosts}
          newSlugs={newSlugs}
          categoryLabels={categoryLabels}
          linkableTags={linkableTags}
        />
      ) : (
        <p className={styles.noResults} role="status">
          {buildEmptyMessage(isSearching, activeCategory)}
        </p>
      )}

      {/* ページネーション（キーワード検索中は非表示）。タップターゲット 44px は Pagination 本体が持つ。 */}
      {!isSearching && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={basePath}
        />
      )}
    </div>
  );
}

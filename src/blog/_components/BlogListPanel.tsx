import Link from "next/link";
import type { BlogPostMeta, BlogCategory } from "@/blog/_lib/blog";
import Input from "@/components/Input";
import Pagination from "@/components/Pagination";
import BlogList from "./BlogList";
import { filterPostsByKeyword } from "./searchFilter";
import styles from "./BlogListPanel.module.css";

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
   * タグページが存在するタグの集合（getTagsWithMinPosts(3) の結果）。
   * BlogList（内部で TagList）に流してタグ表示をフィルタする。
   * node:fs 依存のため Server Component（BlogListView）で計算して渡す。
   * // TODO(cycle-184/B-389): X1 採用時に削除（タグ UI 完全廃止）
   */
  linkableTags?: ReadonlySet<string>;
}

interface BlogListPanelProps extends BlogListData {
  /** 現在の検索キーワード（空文字なら絞り込みなし） */
  keyword: string;
  /**
   * キーワード入力のハンドラ。
   * Server Component はイベントハンドラを RSC ツリーへ渡せないため、
   * サーバーで描く静的シェル（Suspense の fallback）はこれを持たない。
   * ハンドラの有無が、そのまま検索欄を操作できるかどうかになる。
   */
  onKeywordChange?: (keyword: string) => void;
}

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
 */
function buildEmptyMessage(
  isSearching: boolean,
  activeCategory: BlogCategory | undefined,
  tagHeader: TagHeader | undefined,
): string {
  if (isSearching) {
    return "一致する記事が見つかりませんでした。キーワードを変えるか、カテゴリやタグを切り替えると見つかるかもしれません。";
  }
  if (tagHeader) {
    return "このタグの記事はまだありません。";
  }
  if (activeCategory) {
    return "このカテゴリの記事はまだありません。";
  }
  return "まだ記事がありません。";
}

/**
 * ブログ一覧の本体 — カテゴリナビ・キーワード検索欄・人気タグ・品書き・ページネーション。
 *
 * 渡された props だけで描画結果が決まる純粋な表示コンポーネントで、
 * サーバー・クライアントのどちらでも同じ結果を返す。
 * キーワード状態の管理（URL との同期）は {@link BlogFilterableList} が持つ。
 *
 * キーワード検索が有効な場合:
 * - 母集合の全件に対してフィルタする（ページネーション無効化）
 * - ページネーションコンポーネントは非表示
 */
export default function BlogListPanel({
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
  keyword,
  onKeywordChange,
}: BlogListPanelProps) {
  // 検索欄を操作できるのは Client Component から描かれたときだけ。
  // Server Component はイベントハンドラを RSC ツリーへ渡せないため、
  // サーバーで描く静的シェルにはハンドラが無く、検索欄は disabled で出る。
  const isInteractive = onKeywordChange !== undefined;

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
      <div className={styles.search}>
        <Input
          type="search"
          className={styles.searchInput}
          placeholder="記事を検索…"
          value={keyword}
          disabled={!isInteractive}
          onChange={
            onKeywordChange
              ? (event) => onKeywordChange(event.target.value)
              : undefined
          }
          aria-label="ブログ記事をキーワードで検索"
        />
        {!isInteractive && (
          <noscript className={styles.searchNote}>
            検索には JavaScript
            が必要です。記事は下の一覧から、そのまま読めます。
          </noscript>
        )}
      </div>

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
          linkableTags={linkableTags} // TODO(cycle-184/B-389): X1 採用時に削除
        />
      ) : (
        <p className={styles.noResults} role="status">
          {buildEmptyMessage(isSearching, activeCategory, tagHeader)}
        </p>
      )}

      {/* ページネーション（キーワード検索中は非表示）。Pagination 本体が 44px タップターゲットを持つ（B-388）。 */}
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

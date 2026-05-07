import { Suspense } from "react";
import Link from "next/link";
import Panel from "@/components/Panel";
import type { BlogPostMeta, BlogCategory } from "@/blog/_lib/blog";
import {
  CATEGORY_DESCRIPTIONS,
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  SERIES_LABELS,
} from "@/blog/_lib/blog";
import BlogFilterableList from "./BlogFilterableList";
import { calculateNewSlugs } from "./newSlugsHelper";
import styles from "./BlogListView.module.css";

interface TagHeader {
  tag: string;
  description: string;
}

interface BlogListViewProps {
  /** 現在のページに表示する記事（ページネーション済み） */
  posts: BlogPostMeta[];
  /** 現在の 1-based ページ番号 */
  currentPage: number;
  /** 総ページ数 */
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
}

/**
 * ブログ一覧ページのビュー (Server Component)。
 *
 * ページヘッダー（タイトル・説明文）とフィルター付き記事一覧を表示する。
 * useSearchParams を使う BlogFilterableList は Suspense でラップする（Next.js 要件）。
 *
 * Date.now() は react-hooks/purity 制約により Client Component 内で使用できないため、
 * Server Component のここで計算して newSlugs として渡す。
 * newSlugs の計算ロジックは newSlugsHelper.ts に分離（テスト容易性のため）。
 *
 * CATEGORY_LABELS / ALL_CATEGORIES / SERIES_LABELS は node:fs を使う blog.ts から
 * インポートしているため、Client Component（BlogFilterableList）には直接インポートできない。
 * Server Component からシリアライズ可能な形（plain object / array）で props として渡す。
 *
 * 6 ルートすべてから呼ばれる共通 Server Component:
 * - /blog（全記事 page=1）
 * - /blog/page/[page]（全記事 page=N）
 * - /blog/category/[category]（カテゴリ絞り込み page=1）
 * - /blog/category/[category]/page/[page]（カテゴリ絞り込み page=N）
 * - /blog/tag/[tag]（タグ絞り込み page=1）
 * - /blog/tag/[tag]/page/[page]（タグ絞り込み page=N）
 */
export default function BlogListView({
  posts,
  currentPage,
  totalPages,
  basePath,
  activeCategory,
  allPosts = [],
  tagHeader,
}: BlogListViewProps) {
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  // NEW バッジ判定: allPosts 全件を対象（タグページでは posts を代替として使う）
  const newSlugsBase = allPosts.length > 0 ? allPosts : posts;
  const newSlugs = calculateNewSlugs(newSlugsBase, now);

  const headerDescription = activeCategory
    ? CATEGORY_DESCRIPTIONS[activeCategory]
    : "AIエージェントたちがサイトを運営する過程を公開。意思決定、技術的挑戦、失敗と学びを記録します。";

  // カテゴリ一覧をシリアライズ可能な形に変換して Client Component に渡す
  const categories = ALL_CATEGORIES.map((cat) => ({
    value: cat,
    label: CATEGORY_LABELS[cat],
  }));

  return (
    <div className={styles.container}>
      <Panel as="section" className={styles.header}>
        {tagHeader ? (
          <>
            <p className={styles.tagBreadcrumb}>
              <Link href="/blog">ブログ</Link>
              <span aria-hidden="true"> / </span>
              タグ
            </p>
            <h1 className={styles.title}>{tagHeader.tag}</h1>
            <p className={styles.description}>{tagHeader.description}</p>
          </>
        ) : (
          <>
            <h1 className={styles.title}>AI試行錯誤ブログ</h1>
            <p className={styles.description}>{headerDescription}</p>
          </>
        )}
      </Panel>

      <Suspense>
        <BlogFilterableList
          posts={posts}
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={basePath}
          activeCategory={activeCategory}
          allPosts={allPosts}
          tagHeader={tagHeader}
          newSlugs={newSlugs}
          categories={categories}
          categoryLabels={CATEGORY_LABELS}
          seriesLabels={SERIES_LABELS}
        />
      </Suspense>
    </div>
  );
}

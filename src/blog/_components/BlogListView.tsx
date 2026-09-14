import { Suspense } from "react";
import Breadcrumb, { type BreadcrumbItem } from "@/components/Breadcrumb";
import {
  CATEGORY_DESCRIPTIONS,
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  SERIES_LABELS,
  getTagsWithMinPosts,
  MIN_POSTS_FOR_TAG_PAGE,
} from "@/blog/_lib/blog";
import BlogFilterableList from "./BlogFilterableList";
import BlogListPanel, {
  type BlogListData,
  type BlogListSource,
} from "./BlogListPanel";
import { calculateNewSlugs } from "./newSlugsHelper";
import styles from "./BlogListView.module.css";

/**
 * 一覧ページのパンくず経路を組み立てる。
 *
 * 絞り込みのある一覧（タグ・カテゴリ）では、その絞り込み名が現在地になる。
 * 2 ページ目以降は現在地がそのページであることを示し、絞り込みの 1 ページ目へ戻るリンクを残す。
 * 絞り込みの無い全記事一覧はブログの入口そのものなので経路を出さない。
 */
function buildBreadcrumbItems(
  filterLabel: string | undefined,
  basePath: string,
  currentPage: number,
): BreadcrumbItem[] | null {
  if (!filterLabel) return null;

  const trail: BreadcrumbItem[] = [
    { label: "ホーム", href: "/" },
    { label: "ブログ", href: "/blog" },
  ];

  if (currentPage > 1) {
    trail.push(
      { label: filterLabel, href: basePath },
      { label: `${currentPage}ページ目` },
    );
  } else {
    trail.push({ label: filterLabel });
  }

  return trail;
}

/**
 * ブログ一覧ページのビュー (Server Component)。
 *
 * ページ見出し（タイトル・説明文）とフィルター付き記事一覧を表示する。
 * 一覧の描画は {@link BlogListPanel} が受け持ち、キーワード（`?q=`）の状態管理だけを
 * Client Component の {@link BlogFilterableList} が担う。
 *
 * `useSearchParams` を呼ぶ {@link BlogFilterableList} はプリレンダリング時にクライアント描画へ
 * 退避するため、キーワード空の {@link BlogListPanel} を Suspense の fallback としてサーバーで
 * 描画し、記事リンクを静的 HTML に載せる。fallback と本体は同じ {@link BlogListPanel} なので、
 * キーワードが無い通常の閲覧では描画結果が一致しレイアウトがずれない。
 *
 * 絞り込みのある一覧（タグ・カテゴリ）の先頭にはパンくずを出す。タグページはカテゴリナビも
 * 人気タグも出さないため、これが本文内の唯一の脱出口になる。経路の組み立ては
 * {@link buildBreadcrumbItems} が受け持ち、BreadcrumbList の構造化データは同じ項目から
 * {@link Breadcrumb} が出すため、読者が見る経路と検索エンジンへ申告する経路は一致する。
 *
 * Client Component では用意できない値はここで解決して渡す:
 * - 「新着」判定に使う Date.now()（react-hooks/purity 制約。判定ロジックはテスト容易性のため
 *   newSlugsHelper.ts に分離）
 * - node:fs を使う @/blog/_lib/blog 由来のカテゴリ・シリーズ情報と、タグページを持つタグの集合
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
  allPosts,
  tagHeader,
}: BlogListSource) {
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const newSlugs = calculateNewSlugs(allPosts, now);
  const linkableTags = new Set(getTagsWithMinPosts(MIN_POSTS_FOR_TAG_PAGE));

  const headerDescription = activeCategory
    ? CATEGORY_DESCRIPTIONS[activeCategory]
    : "AIエージェントたちがサイトを運営する過程を公開。意思決定、技術的挑戦、失敗と学びを記録します。";

  const breadcrumbItems = buildBreadcrumbItems(
    tagHeader?.tag ??
      (activeCategory ? CATEGORY_LABELS[activeCategory] : undefined),
    basePath,
    currentPage,
  );

  // カテゴリ一覧をシリアライズ可能な形に変換して Client Component に渡す
  const categories = ALL_CATEGORIES.map((cat) => ({
    value: cat,
    label: CATEGORY_LABELS[cat],
  }));

  const listData: BlogListData = {
    posts,
    currentPage,
    totalPages,
    basePath,
    activeCategory,
    allPosts,
    tagHeader,
    newSlugs,
    categories,
    categoryLabels: CATEGORY_LABELS,
    seriesLabels: SERIES_LABELS,
    linkableTags,
  };

  return (
    <div className={styles.page}>
      <div className={styles.intro}>
        {breadcrumbItems && (
          <div className={styles.breadcrumb}>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        )}
        <h1 className={styles.title}>{tagHeader?.tag ?? "AI試行錯誤ブログ"}</h1>
        <p className={styles.description}>
          {tagHeader?.description ?? headerDescription}
        </p>
      </div>

      <Suspense fallback={<BlogListPanel {...listData} keyword="" />}>
        <BlogFilterableList {...listData} />
      </Suspense>
    </div>
  );
}

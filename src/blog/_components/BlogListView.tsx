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
import BlogFilterableList, {
  type BlogListData,
  type BlogListSource,
} from "./BlogFilterableList";
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
 * ページ見出し（タイトル・説明文）を出し、記事一覧そのものは Client Component の
 * {@link BlogFilterableList} が描く。`useSearchParams` を呼ぶコンポーネントは Suspense で
 * 囲むことが Next.js の要件なので、ここで境界を置く。
 *
 * 絞り込みのある一覧（タグ・カテゴリ）の先頭にはパンくずを出す。絞り込んだ一覧から上位へ戻る
 * 経路を本文内に置くためで、経路の組み立ては {@link buildBreadcrumbItems} が受け持つ。
 * BreadcrumbList の構造化データは同じ項目から {@link Breadcrumb} が出すため、読者が見る経路と
 * 検索エンジンへ申告する経路は一致する。
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

  // 絞り込みの名前。見出しとパンくずの現在地に同じ値を使い、読者が見る2つの現在地表示を一致させる。
  const filterLabel =
    tagHeader?.tag ??
    (activeCategory ? CATEGORY_LABELS[activeCategory] : undefined);

  const breadcrumbItems = buildBreadcrumbItems(
    filterLabel,
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
        <h1 className={styles.title}>{filterLabel ?? "AI試行錯誤ブログ"}</h1>
        <p className={styles.description}>
          {tagHeader?.description ?? headerDescription}
        </p>
      </div>

      <Suspense>
        <BlogFilterableList {...listData} />
      </Suspense>
    </div>
  );
}

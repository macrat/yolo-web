import BlogCard from "./BlogCard";
import styles from "./BlogGrid.module.css";

/** BlogGrid が必要なブログ記事メタデータの最小セット */
interface BlogGridPost {
  slug: string;
  title: string;
  description: string;
  published_at: string;
  readingTime: number;
  tags: string[];
  category: string;
}

interface BlogGridProps {
  posts: BlogGridPost[];
  /** NEW バッジを表示する記事のスラッグ集合 */
  newSlugs: ReadonlySet<string>;
  /**
   * カテゴリID → 表示名のマッピング。
   * node:fs を使う @/blog/_lib/blog への依存を Client Component チャンクに
   * 引き込まないため、呼び出し元から props で受け取る。
   */
  categoryLabels: Record<string, string>;
  /**
   * タグページが存在するタグの集合（getTagsWithMinPosts(3) の結果）。
   * BlogCard に流してタグ表示をフィルタする。
   * node:fs 依存のため Server Component（BlogListView）で計算して渡す。
   * // TODO(cycle-184/B-389): X1 採用時に削除（タグ UI 完全廃止）
   */
  linkableTags?: ReadonlySet<string>;
}

/**
 * ブログ記事のグリッドレイアウト。
 * BlogCard を並べ、NEW バッジ判定とカテゴリ表示名解決を一元管理する。
 */
export default function BlogGrid({
  posts,
  newSlugs,
  categoryLabels,
  linkableTags,
}: BlogGridProps) {
  return (
    <div className={styles.grid} role="list" aria-label="ブログ記事一覧">
      {posts.map((post) => (
        <div key={post.slug} role="listitem">
          <BlogCard
            post={post}
            categoryLabel={categoryLabels[post.category] ?? post.category}
            isNew={newSlugs.has(post.slug)}
            linkableTags={linkableTags} // TODO(cycle-184/B-389): X1 採用時に削除
          />
        </div>
      ))}
    </div>
  );
}

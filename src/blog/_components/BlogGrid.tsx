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
   * リンク化するタグの集合。BlogCard へそのまま流す。
   * 未指定の場合は後方互換のためすべてのタグをリンク化する。
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
            linkableTags={linkableTags}
          />
        </div>
      ))}
    </div>
  );
}

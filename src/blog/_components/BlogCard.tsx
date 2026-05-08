import Link from "next/link";
import { formatDate } from "@/lib/date";
import styles from "./BlogCard.module.css";

/** カードに必要なブログ記事メタデータの最小セット */
interface BlogCardPost {
  slug: string;
  title: string;
  description: string;
  published_at: string;
  readingTime: number;
  tags: string[];
}

interface BlogCardProps {
  post: BlogCardPost;
  /** カテゴリ表示名（呼び出し元で解決して渡す）。node:fs を避けるため props で受け取る */
  categoryLabel: string;
  /** このブログ記事が新着かどうか（呼び出し元の Server Component で判定） */
  isNew?: boolean;
  /**
   * リンク化するタグの集合。指定された場合、集合に含まれないタグは
   * <Link> ではなく <span aria-disabled="true"> で表示し、404 を防ぐ。
   * 未指定（undefined）の場合は後方互換のためすべてのタグをリンク化する。
   */
  linkableTags?: ReadonlySet<string>;
}

/**
 * ブログ一覧ページ専用の記事カード（新版）。
 *
 * 設計方針:
 * - 絵文字・accentColor ベースの装飾色を廃止（DESIGN.md §3）
 * - Panel + タイポグラフィのみでカード識別性を担保
 * - カード全体クリッカブル化を「overlay リンク」テクニックで実現:
 *   position: relative の article 内にカードタイトルリンク（::after で記事全体を覆う）
 *   + タグリンク（position: relative; z-index で前面）
 *   → <a> ネスト（HTML 仕様違反）を避けつつカード全体クリッカブルを実現
 * - 等高設計: height: 100%; box-sizing: border-box（cycle-181 R3-1）
 * - badges 行に min-height でバッジ有無による見出し位置ズレを防止（cycle-181 R3-4）
 * - node:fs を使う @/blog/_lib/blog への依存を持たないため、
 *   Client Component（BlogFilterableList）のチャンクに安全に含められる
 *
 * このコンポーネントは /blog 一覧専用。
 * 詳細ページの関連表示には RelatedArticles を使う。
 */
export default function BlogCard({
  post,
  categoryLabel,
  isNew,
  linkableTags,
}: BlogCardProps) {
  return (
    <article className={styles.card}>
      {/* バッジ行: min-height でバッジ有無による見出し位置ズレを防止 */}
      <div className={styles.badges}>
        <span className={styles.category}>{categoryLabel}</span>
        {isNew && <span className={styles.newBadge}>NEW</span>}
      </div>

      <div className={styles.meta}>
        <time className={styles.date} dateTime={post.published_at}>
          {formatDate(post.published_at)}
        </time>
        <span className={styles.readingTime}>{post.readingTime}分で読める</span>
      </div>

      {/*
        タイトルリンク: ::after 擬似要素で article 全体を覆うことで
        カード全体をクリッカブルにする（<a> ネスト回避）。
        タグリンクは position: relative; z-index で前面に出す。
      */}
      <h2 className={styles.title}>
        {/* lgtm[js/stored-xss] - blog slugs from local markdown files, not user input */}
        <Link href={`/blog/${post.slug}`} className={styles.titleLink}>
          {post.title}
        </Link>
      </h2>

      <p className={styles.description}>{post.description}</p>

      {post.tags.length > 0 && (
        <ul className={styles.tags} aria-label="タグ">
          {post.tags.map((tag) => {
            // linkableTags が未指定の場合はすべてリンク化（後方互換）
            const isLinkable =
              linkableTags === undefined || linkableTags.has(tag);
            return (
              <li key={tag} className={styles.tagItem}>
                {isLinkable ? (
                  /*
                    タグリンクは position: relative; z-index: 1 で
                    タイトルの ::after overlay より前面に配置する
                  */
                  <Link href={`/blog/tag/${tag}`} className={styles.tagLink}>
                    {tag}
                  </Link>
                ) : (
                  // タグページが存在しない（MIN_POSTS_FOR_TAG_PAGE 未満）タグは
                  // リンク化しないことで 404 体験を防ぐ。テキストとして存在は見せる。
                  <span
                    className={styles.tagNonLink}
                    aria-disabled="true"
                    title="このタグは記事が少ないためページがありません"
                  >
                    {tag}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}

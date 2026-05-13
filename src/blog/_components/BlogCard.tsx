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
   * タグページが存在するタグの集合（getTagsWithMinPosts(3) の結果）。
   * 指定された場合、この集合に含まれないタグは UI から非表示にする（DOM に出さない）。
   * 未指定の場合はすべてのタグを表示する（後方互換）。
   * node:fs 依存のため Server Component で計算して props で受け取る。
   * // TODO(cycle-184/B-389): X1 採用時に削除（タグ UI 完全廃止）
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
        <Link href={`/blog/${post.slug}`} className={styles.titleLink}>
          {post.title}
        </Link>
      </h2>

      <p className={styles.description}>{post.description}</p>

      {/* TODO(cycle-184/B-389): X1 採用時に削除（タグ UI 完全廃止）*/}
      {(() => {
        // linkableTags が指定されている場合は含まれるタグのみ表示する（含まれないタグは DOM に出さない）
        const visibleTags = linkableTags
          ? post.tags.filter((tag) => linkableTags.has(tag))
          : post.tags;
        return visibleTags.length > 0 ? (
          <ul className={styles.tags} aria-label="タグ">
            {visibleTags.map((tag) => (
              <li key={tag} className={styles.tagItem}>
                {/*
                  タグリンクは position: relative; z-index: 1 で
                  タイトルの ::after overlay より前面に配置する
                */}
                <Link href={`/blog/tag/${tag}`} className={styles.tagLink}>
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        ) : null;
      })()}
    </article>
  );
}

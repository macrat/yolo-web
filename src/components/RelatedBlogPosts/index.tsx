import Link from "next/link";
import { getRelatedBlogPostsForTool } from "@/lib/cross-links";
import { formatDate } from "@/lib/date";
import styles from "./RelatedBlogPosts.module.css";

interface RelatedBlogPostsProps {
  /** ツールのスラッグ。このツールに関連するブログ記事を表示する */
  toolSlug: string;
}

/**
 * RelatedBlogPosts — 関連ブログ記事セクション。
 *
 * 仕様:
 * - `getRelatedBlogPostsForTool` で取得した関連記事をリスト表示する
 * - 記事タイトルと公開日（published_at）を表示し、来訪者が記事の新しさを判断できる情報を保持する
 * - 関連記事が 0 件のとき null を返す
 * - スタイルは new デザイン体系のみ（DESIGN.md §2 参照）
 * - 旧 --color-* トークンは使用しない
 */
export default function RelatedBlogPosts({ toolSlug }: RelatedBlogPostsProps) {
  const posts = getRelatedBlogPostsForTool(toolSlug);
  if (posts.length === 0) return null;

  return (
    <section className={styles.section} aria-label="関連ブログ記事">
      <h2 className={styles.title}>関連ブログ記事</h2>
      <ul className={styles.list}>
        {posts.map((post) => (
          <li key={post.slug} className={styles.item}>
            <Link href={`/blog/${post.slug}`} className={styles.link}>
              <span className={styles.postTitle}>{post.title}</span>
              <time className={styles.date} dateTime={post.published_at}>
                {formatDate(post.published_at)}
              </time>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

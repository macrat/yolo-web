import Link from "next/link";
import { formatDate } from "@/lib/date";
import { NefudaGroup } from "@/components/Nefuda";
import TagList from "./TagList";
import styles from "./BlogList.module.css";

/** BlogList が必要なブログ記事メタデータの最小セット */
interface BlogListPost {
  slug: string;
  title: string;
  description: string;
  published_at: string;
  readingTime: number;
  tags: string[];
  category: string;
}

interface BlogListProps {
  posts: BlogListPost[];
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
   * TagList に流してタグ表示をフィルタする。
   * node:fs 依存のため Server Component（BlogListView）で計算して渡す。
   * // TODO(cycle-184/B-389): X1 採用時に削除（タグ UI 完全廃止）
   */
  linkableTags?: ReadonlySet<string>;
}

/**
 * ブログ記事一覧 — 品書き（DESIGN.md フェーズ R「店構え」）。
 *
 * カードグリッド（旧 BlogGrid + BlogCard）を廃し、罫区切りのリストへ変換した。
 * 各行 = 品名（タイトル・明朝リンク）+ ひとこと（description・--ink-2）+
 * 値札（カテゴリ・読了時間・{@link NefudaGroup}）+ 右端メタ（公開日）+ タグ（{@link TagList}）。
 * 器は静か——カード背景・box-shadow・角丸装飾は持たない（構造の主役は --rule の一本罫）。
 */
export default function BlogList({
  posts,
  newSlugs,
  categoryLabels,
  linkableTags,
}: BlogListProps) {
  return (
    <ul className={styles.list} aria-label="ブログ記事一覧">
      {posts.map((post) => {
        const categoryLabel = categoryLabels[post.category] ?? post.category;
        const isNew = newSlugs.has(post.slug);

        return (
          <li key={post.slug} className={styles.row}>
            <h2 className={styles.title}>
              <Link href={`/blog/${post.slug}`} className={styles.titleLink}>
                {isNew && <span className={styles.newMark}>NEW</span>}
                {post.title}
              </Link>
            </h2>

            <p className={styles.description}>{post.description}</p>

            <div className={styles.metaRow}>
              <NefudaGroup
                labels={[categoryLabel, `${post.readingTime}分で読める`]}
              />
              <time className={styles.date} dateTime={post.published_at}>
                {formatDate(post.published_at)}
              </time>
            </div>

            {/* TODO(cycle-184/B-389): X1 採用時に削除（タグ UI 完全廃止）*/}
            <TagList tags={post.tags} linkableTags={linkableTags} />
          </li>
        );
      })}
    </ul>
  );
}

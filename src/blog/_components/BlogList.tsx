import Link from "next/link";
import { formatDate } from "@/lib/date";
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
  /** 「新着」マークを表示する記事のスラッグ集合 */
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
   * // TODO(B-389): X1 採用時に削除（タグ UI 完全廃止）
   */
  linkableTags?: ReadonlySet<string>;
}

/**
 * ブログ記事一覧 — 品書き。
 *
 * カードのグリッドにせず、罫区切りのリストで組む。
 * 各行 = 品名（タイトル・リンク）+ ひとこと（description・--ink-2）+
 * 補助情報（カテゴリ・読了時間）+ 右端メタ（公開日）+ タグ（{@link TagList}）。
 * 器は静か——カード背景・box-shadow・角丸装飾は持たない（構造の主役は行を区切る細い線）。
 */
export default function BlogList({
  posts,
  newSlugs,
  categoryLabels,
  linkableTags,
}: BlogListProps) {
  return (
    <ul
      className={styles.list}
      aria-label="ブログ記事一覧"
      data-text-box="rows"
    >
      {posts.map((post) => {
        const categoryLabel = categoryLabels[post.category] ?? post.category;
        const isNew = newSlugs.has(post.slug);

        return (
          <li key={post.slug} className={styles.row}>
            <h2 className={styles.title}>
              <Link
                href={`/blog/${post.slug}`}
                className={styles.titleLink}
                data-hit-area="after"
              >
                {isNew && <span className={styles.newMark}>新着</span>}
                {post.title}
              </Link>
            </h2>

            <p className={styles.description}>{post.description}</p>

            <div className={styles.metaRow}>
              <span className={styles.facts}>
                <span>{categoryLabel}</span>
                <span>{`${post.readingTime}分で読める`}</span>
              </span>
              <time className={styles.date} dateTime={post.published_at}>
                {formatDate(post.published_at)}
              </time>
            </div>

            {/* TODO(B-389): X1 採用時に削除（タグ UI 完全廃止）*/}
            {/*
             * タグは行全体を覆う stretched-link（.titleLink::after）より前面に置き
             * （tagRow: z-index）、行遷移に飲まれず独立クリックできるようにする。
             * ラッパ div でなく className 渡しなのは、TagList が可視タグ 0 件で null を
             * 返すため——常時 div で包むと 0 件行に空要素が残り .row の gap を余計に
             * 消費して行間が不揃いになる。
             */}
            <TagList
              tags={post.tags}
              linkableTags={linkableTags}
              className={styles.tagRow}
            />
          </li>
        );
      })}
    </ul>
  );
}

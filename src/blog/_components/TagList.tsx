import Link from "next/link";
import styles from "./TagList.module.css";

interface TagListProps {
  tags: string[];
  /**
   * タグページを持つタグの集合（`getTagsWithMinPosts(MIN_POSTS_FOR_TAG_PAGE)` の結果）。
   * 指定すると、この集合に無いタグは描かない（DOM に出さない）。
   * 未指定ならすべてのタグを描く。
   * 算出は node:fs に依存するため、Server Component で計算して props で受け取る。
   */
  linkableTags?: ReadonlySet<string>;
  /**
   * 呼び出し側が根 `<ul>` に付与する追加クラス。任意。
   * 例: BlogList は行全体を覆う stretched-link の擬似要素より前面へタグのリンクを
   * 立たせるため、`a` を持ち上げるクラスを渡す。
   */
  className?: string;
}

/**
 * 記事のタグを並べる。
 * 各タグはそのタグの記事一覧（`/blog/tag/[tag]`）へのリンクになる。
 * タグ名は URL セグメントとしてエンコードして組み立てる（`#` `/` 空白などを
 * 含むタグ名でも、リンク先がそのタグのページに一致する）。
 * 行き先のページを持たないタグは描かない——読者に押せない文字列を見せず、
 * 存在しないページへのリンクも作らないため。
 */
export default function TagList({
  tags,
  linkableTags,
  className,
}: TagListProps) {
  const visibleTags = linkableTags
    ? tags.filter((tag) => linkableTags.has(tag))
    : tags;

  if (visibleTags.length === 0) return null;

  return (
    <ul
      className={className ? `${styles.tags} ${className}` : styles.tags}
      aria-label="タグ"
    >
      {visibleTags.map((tag) => (
        <li key={tag}>
          <Link
            href={`/blog/tag/${encodeURIComponent(tag)}`}
            className={styles.tagLink}
          >
            {tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}

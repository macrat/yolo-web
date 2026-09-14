import Link from "next/link";
import styles from "./TagList.module.css";

interface TagListProps {
  tags: string[];
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
 */
export default function TagList({ tags, className }: TagListProps) {
  if (tags.length === 0) return null;

  return (
    <ul
      className={className ? `${styles.tags} ${className}` : styles.tags}
      aria-label="タグ"
    >
      {tags.map((tag) => (
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

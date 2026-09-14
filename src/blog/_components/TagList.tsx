import Link from "next/link";
import styles from "./TagList.module.css";

interface TagListProps {
  tags: string[];
  /**
   * タグページを持つタグの集合（getTagsWithMinPosts(3) の結果）。
   * この集合に含まれるタグだけを `/blog/tag/[tag]` へのリンクにし、含まれないタグは
   * リンクでないラベルとして並べる（掲載記事が少ないタグにはタグページが無いため、
   * そこへ送るとリンク切れになる）。どのタグを表示するかには関与しない——
   * 記事に付いたタグはすべて描画する。
   * 未指定のときはすべてのタグをリンクにする。
   * node:fs 依存のため Server Component で計算して props で受け取る。
   */
  linkableTags?: ReadonlySet<string>;
  /**
   * 呼び出し側が根 `<ul>` に付与する追加クラス。任意。
   * 例: BlogList は行全体を覆う stretched-link の擬似要素より前面へタグを出すため、
   * z-index を持つクラスを渡す。
   */
  className?: string;
}

/**
 * 記事のタグを並べる。
 * タグページを持つタグは `/blog/tag/[tag]` へのリンクになり、持たないタグは
 * リンクでないラベルとして同じ列に並ぶ（罫の線種で押せるかどうかを示す）。
 */
export default function TagList({
  tags,
  linkableTags,
  className,
}: TagListProps) {
  if (tags.length === 0) return null;

  return (
    <ul
      className={className ? `${styles.tags} ${className}` : styles.tags}
      aria-label="タグ"
    >
      {tags.map((tag) => (
        <li key={tag}>
          {!linkableTags || linkableTags.has(tag) ? (
            <Link href={`/blog/tag/${tag}`} className={styles.tagLink}>
              {tag}
            </Link>
          ) : (
            <span className={styles.tagLabel}>{tag}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

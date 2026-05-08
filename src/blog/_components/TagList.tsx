import Link from "next/link";
import styles from "./TagList.module.css";

interface TagListProps {
  tags: string[];
  /**
   * リンク化するタグの集合。指定された場合、集合に含まれないタグは
   * <Link> ではなく <span aria-disabled="true"> で表示し、404 を防ぐ。
   * 未指定（undefined）の場合は後方互換のためすべてのタグをリンク化する。
   */
  linkableTags?: ReadonlySet<string>;
}

/**
 * Renders a list of tag links or non-linked tag labels.
 *
 * - linkableTags が指定されていない場合: すべてのタグを <Link> でリンク化（後方互換）
 * - linkableTags が指定されている場合: 集合に含まれるタグのみ <Link> にし、
 *   含まれないタグは <span aria-disabled="true"> で表示する（クリックしても 404 にならない）
 *
 * Each tag links to /blog/tag/[tag] for cross-category discovery.
 */
export default function TagList({ tags, linkableTags }: TagListProps) {
  if (tags.length === 0) return null;

  return (
    <ul className={styles.tags} aria-label="タグ">
      {tags.map((tag) => {
        // linkableTags が未指定の場合はすべてリンク化（後方互換）
        const isLinkable = linkableTags === undefined || linkableTags.has(tag);
        return (
          <li key={tag} className={styles.tag}>
            {isLinkable ? (
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
  );
}

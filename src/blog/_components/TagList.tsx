import Link from "next/link";
import styles from "./TagList.module.css";

interface TagListProps {
  tags: string[];
  /**
   * タグページが存在するタグの集合（getTagsWithMinPosts(3) の結果）。
   * 指定された場合、この集合に含まれないタグは UI から非表示にする（DOM に出さない）。
   * 未指定の場合はすべてのタグを表示する（後方互換）。
   * node:fs 依存のため Server Component で計算して props で受け取る。
   * // TODO(cycle-184/B-389): X1 採用時に削除（タグ UI 完全廃止）
   */
  linkableTags?: ReadonlySet<string>;
  /**
   * 呼び出し側が根 `<ul>` に付与する追加クラス。任意。
   * 例: BlogList が stretched-link の擬似要素より前面へタグを出すため
   * z-index を持つクラスを渡す（cycle-281）。
   */
  className?: string;
}

/**
 * Renders a list of clickable tag links.
 * Each tag links to /blog/tag/[tag] for cross-category discovery.
 */
export default function TagList({
  tags,
  linkableTags,
  className,
}: TagListProps) {
  // TODO(cycle-184/B-389): X1 採用時に削除（タグ UI 完全廃止）
  // linkableTags が指定されている場合は含まれるタグのみ表示する（含まれないタグは DOM に出さない）
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
        <li key={tag} className={styles.tag}>
          <Link href={`/blog/tag/${tag}`} className={styles.tagLink}>
            {tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}

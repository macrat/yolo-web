import Link from "next/link";
import styles from "./TagList.module.css";

interface TagListProps {
  tags: string[];
  /**
   * 一覧のページを持つタグの集合。渡すと、ここに無いタグは出さない。リンクの行き先が無いタグを押させないため。
   * タグのページの有無は node:fs で記事を読んで決めるので、サーバーのコンポーネントで求めて渡す。
   */
  linkableTags?: ReadonlySet<string>;
}

/** 記事に付いたタグ。どれもそのタグの記事の一覧へのリンク。 */
export default function TagList({ tags, linkableTags }: TagListProps) {
  const visibleTags = linkableTags
    ? tags.filter((tag) => linkableTags.has(tag))
    : tags;

  if (visibleTags.length === 0) return null;

  return (
    <ul className={styles.tags} aria-label="タグ">
      {visibleTags.map((tag) => (
        <li key={tag}>
          <Link
            href={`/blog/tag/${tag}`}
            className={styles.tagLink}
            data-text-box="inline"
          >
            {tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}

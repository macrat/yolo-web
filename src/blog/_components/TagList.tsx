import Link from "next/link";
import styles from "./TagList.module.css";

interface TagListProps {
  tags: string[];
}

/**
 * Renders a list of clickable tag links.
 * Each tag links to /blog/tag/[tag] for cross-category discovery.
 */
export default function TagList({ tags }: TagListProps) {
  if (tags.length === 0) return null;

  return (
    <ul className={styles.tags} aria-label="タグ">
      {tags.map((tag) => (
        <li key={tag} className={styles.tag}>
          <Link href={`/blog/tag/${tag}`} className={styles.tagLink}>
            {tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}

import Link from "next/link";
import styles from "./CategoryNav.module.css";

interface CategoryNavProps {
  categories: { slug: string; label: string }[];
  basePath: string;
  activeCategory?: string;
  allLabel?: string;
  allHref?: string;
}

export default function CategoryNav({
  categories,
  basePath,
  activeCategory,
  allLabel = "すべて",
  allHref,
}: CategoryNavProps) {
  return (
    <nav className={styles.nav} aria-label="カテゴリナビゲーション">
      {allHref && (
        <Link
          href={allHref}
          className={`${styles.link} ${!activeCategory ? styles.active : ""}`}
        >
          {allLabel}
        </Link>
      )}
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`${basePath}/${cat.slug}`}
          className={`${styles.link} ${activeCategory === cat.slug ? styles.active : ""}`}
        >
          {cat.label}
        </Link>
      ))}
    </nav>
  );
}

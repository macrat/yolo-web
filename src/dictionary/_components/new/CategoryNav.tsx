import Link from "next/link";
import styles from "./CategoryNav.module.css";

interface CategoryNavProps {
  categories: { slug: string; label: string }[];
  basePath: string;
  activeCategory?: string;
  allLabel?: string;
  allHref?: string;
}

/**
 * 辞典のカテゴリナビゲーション（(new) デザイン体系版）。
 *
 * legacy 版（src/dictionary/_components/CategoryNav.tsx）からのフォーク。
 * 差分:
 * - active 判定ロジック・リンク生成は legacy と同一
 * - active リンクに aria-current="page" を付与（a11y 改善・現 legacy は class のみ。
 *   (new) で確立済みのパターン＝Pagination/SeriesNav/各 FilterableList と同等）
 */
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
          aria-current={!activeCategory ? "page" : undefined}
        >
          {allLabel}
        </Link>
      )}
      {categories.map((cat) => {
        const isActive = activeCategory === cat.slug;
        return (
          <Link
            key={cat.slug}
            href={`${basePath}/${cat.slug}`}
            className={`${styles.link} ${isActive ? styles.active : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            {cat.label}
          </Link>
        );
      })}
    </nav>
  );
}

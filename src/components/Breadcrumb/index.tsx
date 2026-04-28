import Link from "next/link";
import styles from "./Breadcrumb.module.css";

export interface BreadcrumbItem {
  /** 表示テキスト */
  label: string;
  /** リンク先 URL。最後の要素（現在位置）には不要 */
  href?: string;
}

interface BreadcrumbProps {
  /** パンくずリストの項目。最後の要素が現在位置（href なし）になる */
  items: BreadcrumbItem[];
}

/**
 * Breadcrumb — パンくずリストコンポーネント。
 *
 * 仕様:
 * - 外側 <nav aria-label="パンくずリスト"> + 内側 <ol> + <li> の構造
 * - 最後の項目は href なしで aria-current="page" を付与
 * - 区切り文字（/）は aria-hidden="true" で装飾的であることを示す
 * - リンクは Next.js の <Link> を使用
 * - スタイルは new デザイン体系のみ（DESIGN.md §2 参照）
 */
export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className={styles.nav} aria-label="パンくずリスト">
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.label} className={styles.item}>
              {/* 最初の要素以外の前に区切り文字を挿入 */}
              {index > 0 && (
                <span className={styles.separator} aria-hidden="true">
                  /
                </span>
              )}

              {/* 現在位置（最後の要素）はリンクにしない */}
              {isLast ? (
                <span className={styles.current} aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href ?? "/"} className={styles.link}>
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

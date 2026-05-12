import Link from "next/link";
import styles from "./Breadcrumb.module.css";
import {
  generateBreadcrumbJsonLd,
  safeJsonLdStringify,
  type BreadcrumbItem,
} from "@/lib/seo";

export type { BreadcrumbItem };

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
 * - 区切り文字（/）は各 li 内の <span aria-hidden="true"> で配置する
 * - li を display:inline にすることで separator + テキストが同じインラインコンテキストに属し、
 *   SP での「/」行頭孤立を防ぐ（CSS ::before + inline-flex では flex item が分離する問題あり）
 * - リンクは Next.js の <Link> を使用
 * - スタイルは new デザイン体系のみ（DESIGN.md §2 参照）
 * - BreadcrumbList JSON-LD を <script> で出力（SEO 構造化データ）
 */
export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLdStringify(generateBreadcrumbJsonLd(items)),
        }}
      />
      <nav className={styles.nav} aria-label="パンくずリスト">
        <ol className={styles.list}>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={item.label} className={styles.item}>
                {/* 2 番目以降の li の先頭に区切り「/」を配置する */}
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
    </>
  );
}

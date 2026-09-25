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
 * パンくず（DESIGN.md §5・§6）。最後の項目がいまのページで、リンクにせず aria-current="page" を付ける。
 * 区切りの「/」は前の項目の後ろに置き、項目と同じ li に入れる。折り返しは li のあいだでだけ起き、
 * 行の頭には必ず項目の名前が来る。BreadcrumbList の JSON-LD も出す。
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
      <nav aria-label="パンくずリスト">
        <ol className={styles.list}>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={item.label} className={styles.item}>
                {isLast ? (
                  <span className={styles.current} aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <>
                    <Link
                      href={item.href ?? "/"}
                      className={styles.link}
                      data-text-box="inline"
                    >
                      {item.label}
                    </Link>
                    <span className={styles.separator} aria-hidden="true">
                      /
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

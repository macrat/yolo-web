import Link from "next/link";
import styles from "./Breadcrumb.module.css";
import {
  generateBreadcrumbJsonLd,
  safeJsonLdStringify,
  type BreadcrumbItem,
} from "@/lib/seo";

export type { BreadcrumbItem };

interface BreadcrumbProps {
  /** パンくずの項目。ホームから順に並べ、最後の項目がいま開いているページ。 */
  items: BreadcrumbItem[];
}

/**
 * パンくず（DESIGN.md §5・§6）。最後の項目がいまのページで、§6 の現在地としてリンクのまま
 * aria-current="page" を付け、太字で下線を持たない形にする。
 * 区切りの「/」は前の項目の後ろに置き、項目と同じ li に入れる。折り返しは li のあいだで起き、1つの項目だけで
 * 行に収まらないときはその項目の名前の中で起きる。どちらでも行の頭には項目の名前が来る。
 * BreadcrumbList の JSON-LD も出す。
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
            const isCurrent = index === items.length - 1;

            return (
              <li key={item.href} className={styles.item}>
                <Link
                  href={item.href}
                  className={styles.link}
                  aria-current={isCurrent ? "page" : undefined}
                  data-text-box="inline"
                >
                  {item.label}
                </Link>
                {isCurrent ? null : (
                  <span className={styles.separator} aria-hidden="true">
                    /
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

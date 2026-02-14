import Link from "next/link";
import {
  generateBreadcrumbJsonLd,
  type BreadcrumbItem,
} from "@/lib/seo";
import styles from "./Breadcrumb.module.css";

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const jsonLd = generateBreadcrumbJsonLd(items);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className={styles.breadcrumb} aria-label="パンくずリスト">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <span key={item.label}>
              {index > 0 && (
                <span className={styles.separator} aria-hidden="true">
                  /
                </span>
              )}
              {isLast || !item.href ? (
                <span className={styles.current} aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
}

import Link from "next/link";
import PhrasedText from "@/components/PhrasedText";
import styles from "./Breadcrumb.module.css";
import {
  generateBreadcrumbJsonLd,
  safeJsonLdStringify,
  type BreadcrumbItem,
} from "@/lib/seo";

export type { BreadcrumbItem };

interface BreadcrumbProps {
  /**
   * パンくずの項目。ホームから順に並べ、最後の項目がいま開いているページ。phrases は名前を文節で分けた並びで、
   * データから来る長い名前（診断の題など）はサーバーで splitIntoPhrases が作ったものを渡す。
   */
  items: (BreadcrumbItem & { phrases?: readonly string[] })[];
}

/**
 * パンくず（DESIGN.md §5・§6）。最後の項目がいまのページで、§6 の現在地としてリンクのまま
 * aria-current="page" を付け、太字で下線を持たない形にする。
 * 区切りの「/」は前の項目の後ろに置き、項目と同じ li に入れる。折り返しは li のあいだで起き、1つの項目だけで
 * 行に収まらないときはその項目の名前の中で起きる。名前の区切りの並びを渡した項目は、名前の中では文節の切れ目で
 * 折る（§4 のコントロールの名前）。どちらでも行の頭には項目の名前が来る。
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
                  {item.phrases ? (
                    <PhrasedText as="span" phrases={item.phrases} />
                  ) : (
                    item.label
                  )}
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

import Link from "next/link";
import type { ReactElement } from "react";
import styles from "./FacetIndex.module.css";

export interface FacetIndexItem {
  /** リンク末尾の slug（basePath と連結して遷移先を作る）。 */
  slug: string;
  /** 表示文言（学年名・部首・「12画」・カテゴリ名など）。 */
  label: string;
}

interface FacetIndexProps {
  /** 棚（区画）の見出し（例「ほかの学年」「ほかのカテゴリ」）。 */
  heading: string;
  /** ファセット値。 */
  items: FacetIndexItem[];
  /** リンク先を作る基底パス（例「/dictionary/kanji/grade」）。 */
  basePath: string;
  /** 現在地の slug。一致する値は朱で現在地として示す（§4 のれん「現在地は朱」）。 */
  activeSlug?: string;
  /** 「すべて」導線の文言（既定「すべて」）。allHref を与えたときだけ描画。 */
  allLabel?: string;
  /** 「すべて」導線の遷移先（辞典トップ等）。任意。 */
  allHref?: string;
  /** リスト全体のアクセシビリティ名。 */
  ariaLabel: string;
}

/**
 * ファセット索引（FacetIndex）— 他ファセット値への導線（DESIGN.md §4/§8-5）。
 *
 * 旧 CategoryNav（ピル群・§8-5 違反）の店構え版。罫で区切った区画に見出しを冠し、中は
 * ファセット値へのテキストリンクの索引（折り返し）。トップの「罫の索引」と同じ流儀で、
 * リンクは墨・明朝、hover で朱＋下線、現在地は朱で示す（§4）。ピル・色地・角丸・影は付けない。
 * 多数の短い入口（部首 198・画数 24 等）は縦の品書きではなく折り返す索引として並べる。
 */
export default function FacetIndex({
  heading,
  items,
  basePath,
  activeSlug,
  allLabel = "すべて",
  allHref,
  ariaLabel,
}: FacetIndexProps): ReactElement {
  return (
    <section className={styles.facet}>
      <h2 className={styles.heading}>{heading}</h2>
      <ul className={styles.list} aria-label={ariaLabel}>
        {allHref ? (
          <li>
            <Link
              href={allHref}
              className={`${styles.link} ${!activeSlug ? styles.active : ""}`}
              aria-current={!activeSlug ? "page" : undefined}
            >
              {allLabel}
            </Link>
          </li>
        ) : null}
        {items.map((item) => {
          const isActive = item.slug === activeSlug;
          return (
            <li key={item.slug}>
              <Link
                href={`${basePath}/${item.slug}`}
                className={`${styles.link} ${isActive ? styles.active : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

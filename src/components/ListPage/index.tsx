import { Fragment, type ReactNode } from "react";
import Breadcrumb, { type BreadcrumbItem } from "@/components/Breadcrumb";
import Section from "@/components/Section";
import { headingFontAttr } from "@/lib/zen-antique-charset";
import styles from "./ListPage.module.css";

interface ListPageProps {
  /** パンくず。 */
  trail?: BreadcrumbItem[];
  /** 主見出し。 */
  heading: string;
  /**
   * 主見出しを意味の切れ目で分けたもの。2つ以上あれば、見出しは幅に収まらないときこの切れ目でだけ折る
   * （DESIGN.md §4）。
   */
  headingPhrases?: readonly string[];
  /** 見出しの下の導入の文。 */
  description?: string;
  /** 見出しの下に積むもの（一覧の上の索引と一覧）。 */
  children: ReactNode;
}

/**
 * 一覧のページ（DESIGN.md §7）の頭と積み方。1つのセクションに、パンくず・主見出しと導入の文・索引・一覧を
 * 上から同じ間隔で積む。どの一覧のページも、頭の位置と間隔がこの1か所で決まる（§12 位置の一定）。
 */
export default function ListPage({
  trail,
  heading,
  headingPhrases = [heading],
  description,
  children,
}: ListPageProps) {
  return (
    <Section>
      <div className={styles.view}>
        {trail ? <Breadcrumb items={trail} /> : null}
        <div>
          <h1
            className={
              headingPhrases.length > 1
                ? `${styles.title} ${styles.phrased}`
                : styles.title
            }
            {...headingFontAttr(heading)}
          >
            {headingPhrases.map((phrase, i) => (
              <Fragment key={phrase}>
                {i > 0 ? <wbr /> : null}
                {phrase}
              </Fragment>
            ))}
          </h1>
          {description ? (
            <p className={styles.description}>{description}</p>
          ) : null}
        </div>
        {children}
      </div>
    </Section>
  );
}

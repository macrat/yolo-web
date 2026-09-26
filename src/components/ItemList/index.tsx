import Link from "next/link";
import type { ReactElement } from "react";
import Panel from "@/components/Panel";
import styles from "./ItemList.module.css";

/** 補助情報の1つの値。日付なら ISO 8601 の値を持たせ、`<time dateTime>` で包む。 */
export interface ItemListFact {
  text: string;
  dateTime?: string;
}

export interface ItemListItem {
  /** 行の名前。リンクの字で、読み上げの名前はこれだけになる。 */
  name: string;
  /** 名前のリンク先。行の key を兼ねる。 */
  href: string;
  reading?: string;
  /** 何ができるか・何であるかを言う短い文。 */
  description?: string;
  /** 何の仲間かを言う一語。 */
  kind?: string;
  facts?: ItemListFact[];
  /** 主題が色である項目の色見本の色。 */
  swatch?: string;
}

/** 一覧の名前。見出しがあればその id、無ければ名前の文を渡す。 */
type ItemListName = { labelledBy: string } | { label: string };

export type ItemListProps = ItemListName & {
  items: ItemListItem[];
  /** 順に読む一覧（連載）なら true。 */
  ordered?: boolean;
  /** いま開いているページのパス。一致する行を現在地にする。 */
  currentHref?: string;
  /** 結果のボックスや Panel の中に置くときは false にし、ボーダーを二重にしない。 */
  boxed?: boolean;
};

/**
 * 行の一覧（DESIGN.md §7）。1行1項目で、行どうしを細い罫線で区切る。
 *
 * 行の中でリンクにするのは名前だけで、押せる範囲は名前のリンクの ::after で行全体に広げる。
 * 読み・説明・種別・補助情報をリンクの外に置くので、読み上げの名前は行の名前だけになる。
 * 行に見出し要素を置かないのは、ページの見出しの構造に一覧の件数ぶんの見出しを混ぜないため。
 */
export default function ItemList(props: ItemListProps): ReactElement {
  const { items, ordered = false, currentHref, boxed = true } = props;
  const List = ordered ? "ol" : "ul";
  const nameProps =
    "labelledBy" in props
      ? { "aria-labelledby": props.labelledBy }
      : { "aria-label": props.label };

  const list = (
    <List className={styles.list} data-text-box="rows" {...nameProps}>
      {items.map((item) => {
        const current = item.href === currentHref;
        const facts = item.facts ?? [];
        const hasMeta = item.kind !== undefined || facts.length > 0;
        return (
          <li
            key={item.href}
            className={
              item.swatch ? `${styles.row} ${styles.withSwatch}` : styles.row
            }
          >
            {item.swatch ? (
              <span
                className={styles.swatch}
                style={{ backgroundColor: item.swatch }}
                aria-hidden="true"
              />
            ) : null}
            <p className={styles.head}>
              <Link
                href={item.href}
                className={styles.name}
                aria-current={current ? "page" : undefined}
                data-hit-area="after"
              >
                {item.name}
              </Link>
              {item.reading ? (
                <span className={styles.reading}>{item.reading}</span>
              ) : null}
            </p>
            {hasMeta ? (
              <p className={styles.meta}>
                {item.kind !== undefined ? <span>{item.kind}</span> : null}
                {facts.map((fact, index) =>
                  fact.dateTime ? (
                    <time key={index} dateTime={fact.dateTime}>
                      {fact.text}
                    </time>
                  ) : (
                    <span key={index}>{fact.text}</span>
                  ),
                )}
              </p>
            ) : null}
            {item.description ? (
              <p className={styles.description}>{item.description}</p>
            ) : null}
          </li>
        );
      })}
    </List>
  );

  return boxed ? (
    <Panel as="div" className={styles.box}>
      {list}
    </Panel>
  ) : (
    list
  );
}

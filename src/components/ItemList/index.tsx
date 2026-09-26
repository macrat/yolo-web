import Link from "next/link";
import type { CSSProperties, ReactElement } from "react";
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
  /** 何の仲間かを言う一語。行に出すかは一覧の showKind が決める。 */
  kind?: string;
  facts?: ItemListFact[];
  /**
   * 補助情報に振る id。渡すと、補助情報が名前のリンクの説明（aria-describedby）になり、Tab でリンクへ移った
   * 読み上げの利用者にも名前に続けて届く。来訪者の項目で、来訪者のものであることを言う字に使う（DESIGN.md §7）。
   */
  factsId?: string;
  /** 主題が色である項目の色見本の色。 */
  swatch?: string;
}

/** 一覧の名前。見出しがあればその id、無ければ名前の文を渡す。 */
type ItemListName = { labelledBy: string } | { label: string };

export type ItemListProps = ItemListName & {
  items: ItemListItem[];
  /** 順に読む一覧（連載）なら true。行の頭に番号が付く。 */
  ordered?: boolean;
  /** いま開いているページのパス。一致する行を現在地にする。 */
  currentHref?: string;
  /**
   * 来訪者自身の結果にあたる項目のパス（解き終えた画面での来訪者のタイプ）。一致する行の名前を太字にし、
   * 読み上げは「いまの項目」と言う。押すと別のページへ移るので、下線は残す。来訪者のものであることを言う字は、
   * その項目の facts で添え、factsId で名前のリンクの説明にする（DESIGN.md §7）。
   */
  currentItemHref?: string;
  /**
   * 種別を行に出すか。一覧が並べる全件で同じ種別は、項目を見分ける手がかりにならないので出さない（§7）。
   * 既定では渡した項目から決める。ページに切り出した一部を渡すときは、呼び出し側が一覧の全件から決めて渡す。
   */
  showKind?: boolean;
  /** 結果のボックスや Panel の中に置くときは false にし、ボーダーを二重にしない。 */
  boxed?: boolean;
};

/**
 * 行の一覧（DESIGN.md §7）。1行1項目で、行どうしを細い罫線で区切る。
 *
 * 行の中でリンクにするのは名前だけで、押せる範囲は名前のリンクの ::after で行全体に広げる。
 * 読み・説明・種別・補助情報をリンクの外に置くので、読み上げの名前は行の名前だけになる。
 * 行に見出し要素を置かないのは、ページの見出しの構造に一覧の件数ぶんの見出しを混ぜないため。
 *
 * 一覧に role="list" を明示するのは、Safari が list-style: none の ul・ol から list のロールを外し、
 * 読み上げが一覧の名前も件数も言わなくなるため。
 */
export default function ItemList(props: ItemListProps): ReactElement {
  const {
    items,
    ordered = false,
    currentHref,
    currentItemHref,
    boxed = true,
    showKind = new Set(items.map((item) => item.kind)).size > 1,
  } = props;
  const List = ordered ? "ol" : "ul";
  const nameProps =
    "labelledBy" in props
      ? { "aria-labelledby": props.labelledBy }
      : { "aria-label": props.label };
  // 番号の列の幅を最も長い番号に揃え、名前の左端を行ごとに揃える。
  const numberWidth = ordered
    ? ({
        "--number-width": `${String(items.length).length}ch`,
      } as CSSProperties)
    : undefined;

  const list = (
    <List
      role="list"
      className={boxed ? styles.list : `${styles.list} ${styles.ruled}`}
      style={numberWidth}
      data-text-box="rows"
      {...nameProps}
    >
      {items.map((item, index) => {
        const current =
          item.href === currentHref
            ? "page"
            : item.href === currentItemHref
              ? "true"
              : undefined;
        const kind = showKind ? item.kind : undefined;
        const facts = item.facts ?? [];
        const hasMeta = kind !== undefined || facts.length > 0;
        const factsId = hasMeta ? item.factsId : undefined;
        const hasLead = ordered || item.swatch !== undefined;
        return (
          <li
            key={item.href}
            className={
              hasLead ? `${styles.row} ${styles.withLead}` : styles.row
            }
          >
            {hasLead ? (
              <span className={styles.lead}>
                {/* 順番は ol が読み上げに伝えるので、見せる番号は読ませない。 */}
                {ordered ? (
                  <span className={styles.number} aria-hidden="true">
                    {index + 1}
                  </span>
                ) : null}
                {item.swatch ? (
                  <span
                    className={styles.swatch}
                    style={{ backgroundColor: item.swatch }}
                    aria-hidden="true"
                  />
                ) : null}
              </span>
            ) : null}
            <p className={styles.head}>
              <Link
                href={item.href}
                className={styles.name}
                aria-current={current}
                aria-describedby={factsId}
                data-hit-area="after"
              >
                {item.name}
              </Link>
              {item.reading ? (
                <span className={styles.reading}>{item.reading}</span>
              ) : null}
            </p>
            {hasMeta ? (
              <p id={factsId} className={styles.meta}>
                {kind !== undefined ? <span>{kind}</span> : null}
                {facts.map((fact, factIndex) =>
                  fact.dateTime ? (
                    <time key={factIndex} dateTime={fact.dateTime}>
                      {fact.text}
                    </time>
                  ) : (
                    <span key={factIndex}>{fact.text}</span>
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
    <Panel as="div" rows className={styles.box}>
      {list}
    </Panel>
  ) : (
    list
  );
}

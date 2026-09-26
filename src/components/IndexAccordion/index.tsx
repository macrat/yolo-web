import { useId } from "react";
import Accordion from "@/components/Accordion";
import LinkIndex, {
  type LinkIndexGroup,
  type LinkIndexItem,
} from "@/components/LinkIndex";
import { headingFontAttr } from "@/lib/zen-antique-charset";
import styles from "./IndexAccordion.module.css";

/** 語をそのまま並べる索引。 */
export interface IndexAccordionIndex {
  /** 索引の名前（「学年」「タグ」）。語の数を添えて索引の見出しになる。 */
  name: string;
  items: LinkIndexItem[];
}

/** 並びの値ごとに区切りの見出しを立てる索引。 */
export interface IndexAccordionGroupedIndex {
  /** 索引の名前（「部首」）。語の数を添えて索引の見出しになる。 */
  name: string;
  groups: LinkIndexGroup[];
  /** 語がどれも漢字1字で、字の形を見て選ぶ索引か（LinkIndex の singleCharacters）。 */
  singleCharacters?: boolean;
}

/**
 * アコーディオンに入れる索引。1つなら、ラベルが語の数を言う。2つ以上なら、索引ごとの見出しが語の数を言う。
 * 区切りを持つ索引は、いつも最後に1つだけ置く。
 */
type IndexAccordionContent =
  | { index: LinkIndexItem[] }
  | {
      indexes: IndexAccordionIndex[];
      groupedIndex?: IndexAccordionGroupedIndex;
    };

export type IndexAccordionProps = IndexAccordionContent & {
  /** アコーディオンのラベル（「カテゴリから探す」）。何から探せるかを言う。 */
  summary: string;
  /** いま開いているページの一覧の元のパス。一致する語を現在地にする。 */
  currentHref: string;
};

function withCount(name: string, count: number): string {
  return `${name}（${count}）`;
}

/**
 * 一覧の上に置く、分類ごとの一覧のページへの入口（DESIGN.md §7 索引）。閉じたアコーディオンに索引を入れる。
 * 閉じていても索引のリンクは HTML にあるので、検索エンジンも分類のページを辿れる。
 *
 * 索引が2つ以上なら、索引ごとに語の数を言う見出しを立て、2つ目から上に細い罫線を引く。見出しはどれも同じ
 * 大きさで、区切りの見出しより小さく組まない。区切りを持つ索引を最後に置くので、区切りの見出しの後ろに
 * 別の索引の見出しが続かない。
 *
 * 索引の名前は1か所だけが言う。区切りを持たない索引の ul は、索引の見出しか、索引が1つならアコーディオンの
 * ラベルを名前に持つ。区切りを持つ索引は、区切りの ul がそれぞれの区切りの見出しを名前に持つ。
 */
export default function IndexAccordion(props: IndexAccordionProps) {
  const idPrefix = useId();

  if ("index" in props) {
    const labelId = `${idPrefix}-label`;
    return (
      <Accordion
        summary={
          <span id={labelId}>
            {withCount(props.summary, props.index.length)}
          </span>
        }
      >
        <div className={styles.index}>
          <LinkIndex
            labelledBy={labelId}
            items={props.index}
            currentHref={props.currentHref}
          />
        </div>
      </Accordion>
    );
  }

  const { indexes, groupedIndex } = props;
  const groupedHeading =
    groupedIndex &&
    withCount(
      groupedIndex.name,
      groupedIndex.groups.reduce((sum, group) => sum + group.items.length, 0),
    );

  return (
    <Accordion summary={props.summary}>
      <div
        className={
          groupedIndex?.singleCharacters
            ? `${styles.index} ${styles.singleCharacterHeadings}`
            : styles.index
        }
      >
        {indexes.map((index, i) => {
          const headingId = `${idPrefix}-${i}`;
          const heading = withCount(index.name, index.items.length);
          return (
            <div key={index.name} className={styles.part}>
              <h2
                id={headingId}
                className={styles.heading}
                {...headingFontAttr(heading)}
              >
                {heading}
              </h2>
              <LinkIndex
                labelledBy={headingId}
                items={index.items}
                currentHref={props.currentHref}
              />
            </div>
          );
        })}
        {groupedIndex && groupedHeading ? (
          <div className={styles.part}>
            <h2 className={styles.heading} {...headingFontAttr(groupedHeading)}>
              {groupedHeading}
            </h2>
            <LinkIndex
              singleCharacters={groupedIndex.singleCharacters}
              groups={groupedIndex.groups}
              groupHeadingLevel={3}
              currentHref={props.currentHref}
            />
          </div>
        ) : null}
      </div>
    </Accordion>
  );
}

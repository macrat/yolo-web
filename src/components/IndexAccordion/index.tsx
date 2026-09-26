import { Fragment, useId } from "react";
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

const wordSegmenter = new Intl.Segmenter("ja", { granularity: "word" });

/**
 * ラベルと索引の見出しの名前。語の切れ目でだけ折る（DESIGN.md §4）。語の数を添えるとき（「部首（198）」）は、
 * 括弧の前で折らないよう、数を名前の最後の字と折れないまとまりにする。名前の最後の語と数が1行に収まらない
 * ときだけ、本文から継ぐ overflow-wrap がその語の中で折る。
 */
function IndexName({ name, count }: { name: string; count?: number }) {
  const words = Array.from(
    wordSegmenter.segment(name),
    ({ segment }) => segment,
  );
  const lastWordChars =
    count === undefined ? [] : Array.from(words.pop() ?? "");
  const lastChar = lastWordChars.pop() ?? "";
  return (
    <span className={styles.name}>
      {words.map((word, i) => (
        <Fragment key={i}>
          {i > 0 ? <wbr /> : null}
          {word}
        </Fragment>
      ))}
      {count === undefined ? null : (
        <>
          {words.length > 0 ? <wbr /> : null}
          {lastWordChars.join("")}
          <span className={styles.joined}>
            {lastChar}（{count}）
          </span>
        </>
      )}
    </span>
  );
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
            <IndexName name={props.summary} count={props.index.length} />
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
  const groupedCount = groupedIndex?.groups.reduce(
    (sum, group) => sum + group.items.length,
    0,
  );

  return (
    <Accordion summary={<IndexName name={props.summary} />}>
      <div
        className={
          groupedIndex?.singleCharacters
            ? `${styles.index} ${styles.singleCharacterHeadings}`
            : styles.index
        }
      >
        {indexes.map((index, i) => {
          const headingId = `${idPrefix}-${i}`;
          return (
            <div key={index.name} className={styles.part}>
              <h2
                id={headingId}
                className={styles.heading}
                {...headingFontAttr(withCount(index.name, index.items.length))}
              >
                <IndexName name={index.name} count={index.items.length} />
              </h2>
              <LinkIndex
                labelledBy={headingId}
                items={index.items}
                currentHref={props.currentHref}
              />
            </div>
          );
        })}
        {groupedIndex && groupedCount !== undefined ? (
          <div className={styles.part}>
            <h2
              className={styles.heading}
              {...headingFontAttr(withCount(groupedIndex.name, groupedCount))}
            >
              <IndexName name={groupedIndex.name} count={groupedCount} />
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

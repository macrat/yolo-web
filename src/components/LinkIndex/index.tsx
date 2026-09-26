import Link from "next/link";
import { useId, type ReactElement } from "react";
import type { HeadingFontAttr } from "@/lib/zen-antique-charset";
import styles from "./LinkIndex.module.css";

export interface LinkIndexItem {
  /** 語。リンクの字になる。 */
  label: string;
  href: string;
  /** 順を持たない分類で、その語に属する項目の数。語の後ろに添える。 */
  count?: number;
}

export interface LinkIndexGroup {
  /** 区切りの見出し。並びの値を言う（「4画」「初級」）。 */
  heading: string;
  /** 区切りの見出しを組む属性。字の表をクライアントに入れないよう、サーバーで判定して渡す。 */
  headingFont?: HeadingFontAttr;
  items: LinkIndexItem[];
}

/** 索引の名前。見出しがあればその id、無ければ名前の文を渡す。 */
type LinkIndexName = { labelledBy: string } | { label: string };

/** 語をそのまま並べるか、並びの値ごとに区切りの見出しを立てて並べるか。 */
type LinkIndexContent =
  | { items: LinkIndexItem[] }
  | {
      groups: LinkIndexGroup[];
      /** 区切りの見出しの段。索引の見出しの1つ下にする。 */
      groupHeadingLevel: 3 | 4;
    };

export type LinkIndexProps = LinkIndexName &
  LinkIndexContent & {
    /** いま開いているページのパス。一致する語を現在地にする。 */
    currentHref?: string;
  };

/**
 * 索引（DESIGN.md §7）。語を行にせず、横に並べて折り返す。
 *
 * 語は縁の見えないコントロールで、押せる範囲を接して並べる（§5）。並びの値が語に見えないときは、
 * 値ごとに区切りの見出しと ul を置き、読み上げでも区切りごとのリストとして件数が伝わるようにする。
 *
 * 一覧に role="list" を明示するのは、Safari が list-style: none の ul から list のロールを外し、
 * 読み上げが一覧の名前も件数も言わなくなるため。
 */
export default function LinkIndex(props: LinkIndexProps): ReactElement {
  const idPrefix = useId();
  const nameProps =
    "labelledBy" in props
      ? { "aria-labelledby": props.labelledBy }
      : { "aria-label": props.label };

  const renderList = (items: LinkIndexItem[], listNameProps: object) => (
    <ul role="list" className={styles.list} {...listNameProps}>
      {items.map((item) => {
        const current = item.href === props.currentHref;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={styles.link}
              aria-current={current ? "page" : undefined}
              data-text-box="inline"
            >
              {item.count === undefined
                ? item.label
                : `${item.label}（${item.count}）`}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  if ("items" in props) return renderList(props.items, nameProps);

  const Heading = `h${props.groupHeadingLevel}` as const;
  // 区切りのリストをまとめて索引の名前で呼べるようにし、区切りのリストはそれぞれの見出しで呼ぶ。
  return (
    <div role="group" className={styles.groups} {...nameProps}>
      {props.groups.map((group, index) => {
        const headingId = `${idPrefix}-${index}`;
        return (
          <div key={group.heading} className={styles.group}>
            <Heading
              id={headingId}
              className={styles.groupHeading}
              {...group.headingFont}
            >
              {group.heading}
            </Heading>
            {renderList(group.items, { "aria-labelledby": headingId })}
          </div>
        );
      })}
    </div>
  );
}

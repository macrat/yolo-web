import { Fragment, type ComponentPropsWithoutRef } from "react";
import styles from "./PhrasedText.module.css";

type PhrasedTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface PhrasedTextOwnProps<T extends PhrasedTag> {
  /** 組む見出しの要素。 */
  as: T;
  /** 見出しの文を折り所で分けた並び。サーバーで splitIntoPhrases（@/lib/phrase-breaks）が作ったものを渡す。 */
  phrases: readonly string[];
  className?: string;
}

type PhrasedTextProps<T extends PhrasedTag> = PhrasedTextOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof PhrasedTextOwnProps<T> | "children">;

/**
 * 見出しを文節で折って組む（DESIGN.md §4）。渡された並びのあいだにだけ折り所の <wbr> を置き、並びの1つの中では、
 * それが1行に収まらないときだけ折る。
 *
 * 要素の中は文の字と <wbr> だけにし、字を分ける要素を持たない。見出しの中の要素で読み上げが見出しを分けて
 * 読まないようにし、写した文やページ内の検索が元の文のままになるようにする。
 */
export default function PhrasedText<T extends PhrasedTag>({
  as,
  phrases,
  className,
  ...rest
}: PhrasedTextProps<T>) {
  const Tag = as as PhrasedTag;
  return (
    <Tag
      className={className ? `${styles.phrased} ${className}` : styles.phrased}
      {...rest}
    >
      {phrases.map((phrase, index) => (
        <Fragment key={index}>
          {index > 0 && <wbr />}
          {phrase}
        </Fragment>
      ))}
    </Tag>
  );
}

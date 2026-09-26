import { Fragment, type ComponentPropsWithoutRef } from "react";
import styles from "./PhrasedText.module.css";

type PhrasedTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

interface PhrasedTextOwnProps<T extends PhrasedTag> {
  /** 組む要素。 */
  as: T;
  /** 文の文節の並び。サーバーで splitIntoPhrases（@/lib/phrase-breaks）が作ったものを渡す。 */
  phrases: readonly string[];
  className?: string;
}

type PhrasedTextProps<T extends PhrasedTag> = PhrasedTextOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof PhrasedTextOwnProps<T> | "children">;

/**
 * 文を文節で折って組む（DESIGN.md §4）。文節のあいだにだけ折り所の <wbr> を置き、文節の中では、文節が1行に
 * 収まらないときだけ折る。
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

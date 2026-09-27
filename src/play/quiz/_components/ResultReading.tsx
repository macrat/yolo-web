import type { ReactNode } from "react";
import PhrasedText from "@/components/PhrasedText";
import type { HeadingFontAttr } from "@/lib/zen-antique-charset";
import { type ResultPlacement, SECTION_HEADING } from "./OtherTypesNav";
import styles from "./ResultReading.module.css";

/**
 * 診断のタイプを詳しく説明する読みもの（DESIGN.md §8）の組み方。結果のあとに置き、セクションの中の小見出し
 * （上に細い罫線。§5）で分け、文は段落、あるあるは箇条書きで組む。カードや枠で区画を囲まない。
 */

interface ReadingHeadingProps {
  /** 置く面。解き終えた画面では結果の見出しの下の h3、結果のページでは h1 の下の h2 になる。 */
  placement: ResultPlacement;
  /** 見出しの文を文節で分けた並び（§4）。作り方は PhrasedText の phrases と同じ。 */
  phrases: readonly string[];
  /** 見出しの書体に無い字を含むときの属性。データから来る見出しは、サーバーで headingFontAttr が作ったものを渡す。 */
  headingFont?: HeadingFontAttr;
  id?: string;
}

/** 読みものの小見出し。要素の段は置く面で決まり、大きさはどちらの面でもセクションの中の小見出しの段。 */
export function ReadingHeading({
  placement,
  phrases,
  headingFont,
  id,
}: ReadingHeadingProps) {
  return (
    <PhrasedText
      as={SECTION_HEADING[placement]}
      phrases={phrases}
      id={id}
      className={styles.heading}
      {...headingFont}
    />
  );
}

/** 読みものの段落。本文の大きさで、本文の幅で折り返す。 */
export function ReadingText({ children }: { children: ReactNode }) {
  return <p className={styles.text}>{children}</p>;
}

/** 読みものの箇条書き。 */
export function ReadingList({ items }: { items: readonly string[] }) {
  return (
    <ul className={styles.list}>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

/** 読みもの全体。小見出し・段落・箇条書きのあいだを揃える。 */
export function Reading({ children }: { children: ReactNode }) {
  return <div className={styles.reading}>{children}</div>;
}

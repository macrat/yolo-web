import { useId, type ReactNode } from "react";
import PhrasedText from "@/components/PhrasedText";
import type { HeadingFontAttr } from "@/lib/zen-antique-charset";
import styles from "./ResultReading.module.css";

/**
 * 診断のタイプを詳しく説明する読みもの（DESIGN.md §8）の組み方。読みものは1つのセクション「このタイプについて」に
 * まとめ、その中をセクションの中の小見出し（上に細い罫線。§5）で分け、文は段落、あるあるは箇条書きで組む。
 * カードや枠で区画を囲まない。解き終えた画面でも結果のページでも、見出しの段は同じである。
 */

/** 読みもののセクションの見出し。コードに書いた決まった文なので、書き手が文節で区切った並びで持つ。 */
export const READING_SECTION_HEADING = ["この", "タイプに", "ついて"] as const;

/** 読みもののセクション。見出し「このタイプについて」を頭に置き、その下に読みものを続ける。 */
export function ReadingSection({ children }: { children: ReactNode }) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId}>
      <PhrasedText
        as="h2"
        id={headingId}
        className={styles.sectionHeading}
        phrases={READING_SECTION_HEADING}
      />
      {children}
    </section>
  );
}

interface ReadingHeadingProps {
  /** 見出しの文を文節で分けた並び（§4）。作り方は PhrasedText の phrases と同じ。 */
  phrases: readonly string[];
  /** 見出しの書体に無い字を含むときの属性。データから来る見出しは、サーバーで headingFontAttr が作ったものを渡す。 */
  headingFont?: HeadingFontAttr;
  id?: string;
}

/** 読みものの小見出し。セクションの中の小見出しの段。 */
export function ReadingHeading({
  phrases,
  headingFont,
  id,
}: ReadingHeadingProps) {
  return (
    <PhrasedText
      as="h3"
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

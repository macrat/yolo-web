import { Fragment, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { joinDashes } from "@/lib/phrase-dashes";
import styles from "./PhrasedText.module.css";

/** 区切りを組む要素。見出しと、見出しの外で文節で折るもの（コントロールの名前・リンク・表のセル）。 */
type PhrasedTag =
  "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span" | "th" | "td";

interface PhrasedTextOwnProps<T extends PhrasedTag> {
  /** 組む要素。 */
  as: T;
  /**
   * 文を折り所で分けた並び。データから来る文は、サーバーで splitIntoPhrases（@/lib/phrase-breaks）が
   * 作ったものを渡す。コードに書いた決まった文は、書き手が文節で分けた並びをそのまま書く（BudouX が語を割る
   * 文でも正しく分けられる）。手で書く並びも splitIntoPhrases と同じ禁則を満たし、followsPhraseRules で確かめる。
   */
  phrases: readonly string[];
  className?: string;
}

type PhrasedTextProps<T extends PhrasedTag> = PhrasedTextOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof PhrasedTextOwnProps<T> | "children">;

/**
 * 文を文節で折って組む（DESIGN.md §4）。見出し・コントロールの名前・表のセルのように、折る所を文節の切れ目に
 * 限るものを、このサイトではどれもこの部品で組む。渡された並びのあいだにだけ折り所の <wbr> を置き、並びの1つの
 * 中では、それが1行に収まらないときだけ折る。
 *
 * 要素の中は文の字と <wbr> だけにし、字を分ける要素を持たない。見出しの中の要素で読み上げが見出しを分けて
 * 読まないようにし、写した文やページ内の検索が元の文のままになるようにする。
 *
 * ダッシュ（「—」「──」「--」）は、joinDashes（@/lib/phrase-dashes）で前の語に付けて組む。 */
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
          {joinDashes(phrase)}
        </Fragment>
      ))}
    </Tag>
  );
}

/**
 * コントロールの名前。区切りの並びを渡すとそのあいだで文節で折り、文字列を渡すと区切りの無い1つの文節として
 * 組む（1文節の名前は区切りが要らない）。どちらも見出しと同じく語の中で折らず、行頭の禁則を厳しい側で組む。
 */
export type PhrasedName = string | readonly string[];

/** 名前の字を1続きの文にしたもの。読み上げの知らせや字の幅の見積もりに使う。 */
export function phrasedNameText(name: PhrasedName): string {
  return typeof name === "string" ? name : name.join("");
}

function isPhrasedName(content: unknown): content is PhrasedName {
  return (
    typeof content === "string" ||
    (Array.isArray(content) &&
      content.every((phrase) => typeof phrase === "string"))
  );
}

/**
 * コントロールの名前を組む。文字列と区切りの並びは PhrasedText の span で文節で折って組み（文字列は1つの
 * 文節）、要素はそのまま返す（クラスを渡したときは span で包む）。名前に文字列のほかに要素も受け取る部品が使う。
 */
export function renderPhrasedName(
  content: ReactNode | readonly string[],
  className?: string,
): ReactNode {
  if (isPhrasedName(content)) {
    return (
      <PhrasedText
        as="span"
        phrases={typeof content === "string" ? [content] : content}
        className={className}
      />
    );
  }
  return className === undefined ? (
    content
  ) : (
    <span className={className}>{content}</span>
  );
}

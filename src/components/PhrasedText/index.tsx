import { Fragment, type ComponentPropsWithoutRef } from "react";
import styles from "./PhrasedText.module.css";

type PhrasedTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface PhrasedTextOwnProps<T extends PhrasedTag> {
  /** 組む見出しの要素。 */
  as: T;
  /**
   * 見出しの文を折り所で分けた並び。データから来る文は、サーバーで splitIntoPhrases（@/lib/phrase-breaks）が
   * 作ったものを渡す。コードに書いた決まった文は、書き手が文節で分けた並びをそのまま書く（BudouX が語を割る
   * 文でも正しく分けられる）。手で書く並びも splitIntoPhrases と同じ禁則を満たし、followsPhraseRules で確かめる。
   */
  phrases: readonly string[];
  className?: string;
}

type PhrasedTextProps<T extends PhrasedTag> = PhrasedTextOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof PhrasedTextOwnProps<T> | "children">;

/** ダッシュ（「—」「──」「--」）の前の空白。 */
const SPACE_BEFORE_DASH = /[ \t]+(?=[—―─]|--)/gu;
/** ダッシュの字の前（空白でない字の後ろ）と、ダッシュの字どうしのあいだ。 */
const INSIDE_OR_BEFORE_DASH =
  /(?<=[^\s])(?=[—―─])|(?<=[—―─])(?=[—―─])|(?<=[^\s-])(?=--)|(?<=-)(?=-)/gu;
const NO_BREAK_SPACE = "\u00A0";
const WORD_JOINER = "\u2060";

/** ダッシュを前の語に付け、ダッシュの中で折れないようにする。 */
function joinDashes(phrase: string): string {
  return phrase
    .replace(SPACE_BEFORE_DASH, NO_BREAK_SPACE)
    .replace(INSIDE_OR_BEFORE_DASH, WORD_JOINER);
}

/**
 * 見出しを文節で折って組む（DESIGN.md §4）。渡された並びのあいだにだけ折り所の <wbr> を置き、並びの1つの中では、
 * それが1行に収まらないときだけ折る。
 *
 * 要素の中は文の字と <wbr> だけにし、字を分ける要素を持たない。見出しの中の要素で読み上げが見出しを分けて
 * 読まないようにし、写した文やページ内の検索が元の文のままになるようにする。
 *
 * ダッシュ（「—」「──」「--」）は前の語に付けて組む。前の空白は折れない空白にし、空白の無いダッシュの前と、ダッシュの
 * 字どうしのあいだには語結合子（U+2060）を置く。ブラウザはダッシュの前と「-」の後ろで折るので、そのままでは
 * ダッシュが行の頭に来るか、ダッシュだけの行や「-／-」ができる。語結合子は見えず、ページ内の検索も元の文で当たる。 */
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

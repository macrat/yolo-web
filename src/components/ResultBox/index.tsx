import { useId, type ComponentPropsWithRef, type ReactNode } from "react";
import PhrasedText from "@/components/PhrasedText";
import type { HeadingFontAttr } from "@/lib/zen-antique-charset";
import styles from "./ResultBox.module.css";

/** 結果の見出し。§4 のセクションの見出しの段で、文節で折って組む。 */
export type ResultHeading = HeadingFontAttr & {
  /** 見出しの文を折り所で分けた並び。サーバーで splitIntoPhrases（@/lib/phrase-breaks）が作ったものを渡す。 */
  phrases: readonly string[];
  /** 見出しの要素の段（既定: 2） */
  level?: 2 | 3;
};

/**
 * 中身の形（DESIGN.md §8）。コードと表は、結果のボックスがそのコンポーネントのボックスになる。
 * - "code": ボックスが --paper-2 の地を持ち、中の pre は枠と地を持たずに横に送る。
 * - "table": 表がボックスの幅に収まらないとき、ボックスの中で横に送る。
 */
type ResultContentKind = "code" | "table";

/**
 * 結果の名前。読み上げはボックスを結果の見出しの名前の region として読むので、見出しか補助情報の行の
 * どちらかを必ず持つ。見出しを持たない結果（道具の数字など）は、補助情報の行（「文字数の結果」など）が名前になる。
 */
type ResultName =
  | { heading: ResultHeading; caption?: ReactNode }
  | { heading?: undefined; caption: ReactNode };

type ResultBoxProps = ResultName & {
  /** 結果を写すコピーのボタン。頭の行の右に置き、結果の長さに関わらずボックスの上端のそばで押せる。 */
  copyButton?: ReactNode;
  kind?: ResultContentKind;
  children: ReactNode;
} & Omit<
    ComponentPropsWithRef<"section">,
    "aria-labelledby" | "children" | "className"
  >;

/**
 * 結果のボックス（DESIGN.md §5・§8）。操作が生んだ結果と、結果を写すコピーのボタンだけを囲む。
 * 結果の登場の動き（§11）はこの部品だけが持ち、中の図や帯は一緒に出る。
 *
 * 結果に着いたときにフォーカスを移すなら、呼び出し側が ref と tabIndex={-1} を渡す。見た目の割り当てを
 * 持たせないため className を受けず、どの面でも同じ形になる（§12 位置の一定）。
 */
export default function ResultBox({
  heading,
  caption,
  copyButton,
  kind,
  children,
  ...rest
}: ResultBoxProps) {
  const id = useId();
  const captionId = `${id}-caption`;
  const headingId = `${id}-heading`;
  const classes = [styles.box, kind && styles[kind]].filter(Boolean).join(" ");

  let headingElement: ReactNode = null;
  if (heading) {
    const { phrases, level = 2, ...fontAttr } = heading;
    headingElement = (
      <PhrasedText
        as={`h${level}`}
        id={headingId}
        phrases={phrases}
        className={styles.heading}
        {...fontAttr}
      />
    );
  }

  return (
    <section
      className={classes}
      aria-labelledby={heading ? headingId : captionId}
      {...rest}
    >
      <div className={styles.head}>
        <div className={styles.title}>
          {caption !== undefined && (
            <p id={captionId} className={styles.caption}>
              {caption}
            </p>
          )}
          {headingElement}
        </div>
        {copyButton !== undefined && (
          <div className={styles.copy}>{copyButton}</div>
        )}
      </div>
      <div className={styles.body}>{children}</div>
    </section>
  );
}

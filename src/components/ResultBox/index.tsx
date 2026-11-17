"use client";

import {
  useEffect,
  useId,
  useRef,
  type ComponentPropsWithRef,
  type FocusEvent,
  type ReactNode,
} from "react";
import PhrasedText from "@/components/PhrasedText";
import { revealFocusedFrame, trackScrollBeforeTab } from "@/lib/reveal";
import { markScrollFrame, SCROLL_FRAME_LABELS } from "@/lib/scroll-frame";
import type { HeadingFontAttr } from "@/lib/zen-antique-charset";
import styles from "./ResultBox.module.css";

/** 結果の見出し。§4 のセクションの見出しの段で、文節で折って組む。 */
export type ResultHeading = HeadingFontAttr & {
  /** 見出しの文を折り所で分けた並び。作り方は PhrasedText の phrases と同じ。 */
  phrases: readonly string[];
  /** 見出しの要素の段（既定: 2） */
  level?: 2 | 3;
  /**
   * 見出しの名前の読み方（伝統色の「藍色」に「あいいろ」など）。見出しのすぐ下に補助情報として添え、見出しと
   * 1つの組に見せる。見出しの名前（読み上げの名前）には入れない。
   */
  reading?: string;
};

/**
 * 中身の形（DESIGN.md §8）。コードと表は、結果のボックスがそのコンポーネントのボックスになり、ボックスの
 * 幅に収まらない中身をボックスの中で横に送る。コードのときは、ボックスが --paper-2 の地を持ち、中の pre は
 * 枠と地を持たない。
 */
type ResultContentKind = keyof typeof SCROLL_FRAME_LABELS;

/**
 * 結果の名前。読み上げはボックスを結果の見出しの名前の region として読むので、見出しか補助情報の行の
 * どちらかを必ず持つ。見出しを持たない結果（道具の数字など）は、補助情報の行（「文字数の結果」など）が名前になる。
 */
type ResultName =
  | { heading: ResultHeading; caption?: string }
  | { heading?: undefined; caption: string };

type ResultBoxProps = ResultName & {
  /** 結果を写すコピーのボタン。頭の行の右に置き、結果の長さに関わらずボックスの上端のそばで押せる。 */
  copyButton?: ReactNode;
  kind?: ResultContentKind;
  /**
   * 来訪者の操作に応えて現れた結果か。true のときだけ登場の動きを持つ。ページを開いたときや、ページに
   * 移ってきたときに初めからある結果（初めの値で出した道具の結果など）には渡さない。
   */
  appear?: boolean;
  children: ReactNode;
} & Omit<
    ComponentPropsWithRef<"section">,
    "aria-labelledby" | "children" | "className"
  >;

/**
 * 結果のボックス（DESIGN.md §5・§8）。操作が生んだ結果と、結果を写すコピーのボタンだけを囲む。
 *
 * 結果の登場の動き（§11）はこの部品だけが持ち、中の図や帯は一緒に出る。登場は操作への応えなので、動くのは
 * 呼び出し側が appear を渡したボックスだけである。操作を受けたかを知っているのは呼び出し側だけで、描かれ方
 * （サーバーの HTML か、ブラウザで新しく描いたか）からは見分けられない。
 *
 * 結果に着いたときにフォーカスを移すなら、呼び出し側が ref と tabIndex={-1} を渡す。見た目の割り当てを
 * 持たせないため className を受けず、どの面でも同じ形になる（§12 位置の一定）。
 */
export default function ResultBox({
  heading,
  caption,
  copyButton,
  kind,
  appear = false,
  children,
  onFocus,
  ...rest
}: ResultBoxProps) {
  const id = useId();
  const captionId = `${id}-caption`;
  const headingId = `${id}-heading`;
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const body = bodyRef.current;
    if (!kind || !body) return;
    const update = () => markScrollFrame(body, SCROLL_FRAME_LABELS[kind]);
    update();
    if (typeof ResizeObserver === "undefined") return;
    // 枠の幅と、中身の幅が変わったら測り直す。中身（コードの pre・表）は枠の幅に縮まず自分の中身の幅を
    // 持つので、行が長くなったときや字の大きさが変わったときも大きさが変わり、ここで捉えられる。
    const observer = new ResizeObserver(update);
    observer.observe(body);
    for (const content of body.children) observer.observe(content);
    return () => observer.disconnect();
  }, [kind, children]);

  // 中身を横に送る区画を持つボックスは、キーボードで区画に着いたときに送り直すため、Tab を押した時点の画面の
  // 位置を覚える。
  useEffect(() => (kind ? trackScrollBeforeTab() : undefined), [kind]);

  // キーボードで中身の区画（横に送るコード・表）に着いたら、リングの辺を画面に入れる（§6）。前から着いたら
  // 上の辺、後ろから戻ってきたら下の辺で、どちらも着く前から見えていれば画面を動かさない。マウスで押して
  // 着いたとき（字を選ぶときなど）は、押した所を動かさない。
  function handleFocus(event: FocusEvent<HTMLElement>): void {
    onFocus?.(event);
    const region = bodyRef.current;
    if (!region || event.target !== region) return;
    if (!region.matches(":focus-visible")) return;
    const from = event.relatedTarget;
    const arrivedFromAfter =
      from instanceof Node &&
      (region.compareDocumentPosition(from) &
        Node.DOCUMENT_POSITION_FOLLOWING) !==
        0;
    revealFocusedFrame(event.currentTarget, arrivedFromAfter, event.timeStamp);
  }

  const classes = [styles.box, kind && styles[kind], appear && styles.appears]
    .filter(Boolean)
    .join(" ");

  let headingElement: ReactNode = null;
  if (heading) {
    const { phrases, level = 2, reading, ...fontAttr } = heading;
    headingElement = (
      <>
        <PhrasedText
          as={`h${level}`}
          id={headingId}
          phrases={phrases}
          className={styles.heading}
          {...fontAttr}
        />
        {reading !== undefined && <p className={styles.reading}>{reading}</p>}
      </>
    );
  }

  return (
    <section
      className={classes}
      aria-labelledby={heading ? headingId : captionId}
      onFocus={handleFocus}
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
      <div ref={bodyRef} className={styles.body}>
        {children}
      </div>
    </section>
  );
}

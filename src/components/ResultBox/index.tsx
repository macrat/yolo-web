"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from "react";
import PhrasedText from "@/components/PhrasedText";
import { useIsServerRendered } from "@/components/hooks/useIsServerRendered";
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
 * 中身の形（DESIGN.md §8）。コードと表は、結果のボックスがそのコンポーネントのボックスになり、ボックスの
 * 幅に収まらない中身をボックスの中で横に送る。コードのときは、ボックスが --paper-2 の地を持ち、中の pre は
 * 枠と地を持たない。
 */
type ResultContentKind = "code" | "table";

/** 横に送れるときに、送る枠を読み上げで言う名前。 */
const SCROLL_LABELS: Record<ResultContentKind, string> = {
  code: "コード（横にスクロールできます）",
  table: "表（横にスクロールできます）",
};

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
  children: ReactNode;
} & Omit<
    ComponentPropsWithRef<"section">,
    "aria-labelledby" | "children" | "className"
  >;

/**
 * 横に送る枠のうち、中身がはみ出すものにだけ、キーボードで送れる止まりどころと名前を付ける。はみ出さない
 * ものには付けず、Tab で止まる所を増やさない。
 */
function markScrollFrame(frame: HTMLElement, label: string): void {
  if (frame.scrollWidth > frame.clientWidth) {
    frame.tabIndex = 0;
    frame.setAttribute("role", "region");
    frame.setAttribute("aria-label", label);
  } else {
    frame.removeAttribute("tabindex");
    frame.removeAttribute("role");
    frame.removeAttribute("aria-label");
  }
}

/**
 * 結果のボックス（DESIGN.md §5・§8）。操作が生んだ結果と、結果を写すコピーのボタンだけを囲む。
 *
 * 結果の登場の動き（§11）はこの部品だけが持ち、中の図や帯は一緒に出る。動くのは、操作に応えてブラウザで
 * 新しく描いたボックスだけで、ページを開いたときにサーバーの HTML に初めからあるボックスは動かさない。
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
  const isServerRendered = useIsServerRendered();
  // 最初の描画で決めたまま保ち、水和で引き継いだボックスが水和のあとに動き出さないようにする。
  const [appears] = useState(!isServerRendered);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const body = bodyRef.current;
    if (!kind || !body) return;
    const update = () => markScrollFrame(body, SCROLL_LABELS[kind]);
    update();
    if (typeof ResizeObserver === "undefined") return;
    // 枠の幅と、中身の幅（入力で結果が変わったとき・字の大きさが変わったとき）が変わったら測り直す。
    const observer = new ResizeObserver(update);
    observer.observe(body);
    for (const content of body.children) observer.observe(content);
    return () => observer.disconnect();
  }, [kind, children]);

  const classes = [styles.box, kind && styles[kind], appears && styles.appears]
    .filter(Boolean)
    .join(" ");

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
      <div ref={bodyRef} className={styles.body}>
        {children}
      </div>
    </section>
  );
}

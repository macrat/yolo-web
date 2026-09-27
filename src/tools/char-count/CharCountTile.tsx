"use client";

import {
  Fragment,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Field from "@/components/Field";
import ResultBox from "@/components/ResultBox";
import Textarea from "@/components/Textarea";
import { analyzeText, type CharCountResult } from "./logic";
import styles from "./CharCountTile.module.css";

/**
 * 表示の組み方。道具のページは "full"、道具箱のように狭い所に置くときは "compact" で、並べる数を主要なものに
 * 絞る。
 */
export type CharCountTileVariant = "full" | "compact";

export interface CharCountTileProps {
  /**
   * - "full"（既定）: 文字数に続けて、空白を除いた文字数・バイト数・単語数・行数・段落数を並べる
   * - "compact": 文字数に続けて、バイト数・単語数・行数を並べる
   */
  variant?: CharCountTileVariant;
  className?: string;
}

/** 表に並べる数。名前は表のセルの中で文節の切れ目（<wbr>）で折るので、文節ごとに区切る。 */
interface CountRow {
  key: keyof CharCountResult;
  label: readonly string[];
}

const FULL_ROWS: readonly CountRow[] = [
  { key: "charsNoSpaces", label: ["空白を", "除いた", "文字数"] },
  { key: "bytes", label: ["UTF-8の", "バイト数"] },
  { key: "words", label: ["単語数"] },
  { key: "lines", label: ["行数"] },
  { key: "paragraphs", label: ["段落数"] },
];

const COMPACT_KEYS: ReadonlySet<keyof CharCountResult> = new Set([
  "bytes",
  "words",
  "lines",
]);

const ROWS: Record<CharCountTileVariant, readonly CountRow[]> = {
  full: FULL_ROWS,
  compact: FULL_ROWS.filter((row) => COMPACT_KEYS.has(row.key)),
};

const numberFormat = new Intl.NumberFormat("ja-JP");

/** 数を桁区切りで書き、桁区切りの後ろにだけ折り所（<wbr>）を置く。数を折るのは桁区切りの位置だけ（§8）。 */
function GroupedNumber({ value }: { value: number }) {
  const groups = numberFormat.format(value).split(",");
  return groups.map((group, index) => (
    <Fragment key={index}>
      {index > 0 && <wbr />}
      {group}
      {index < groups.length - 1 && ","}
    </Fragment>
  ));
}

/** 文字数の字の段。§4 の主見出しの段から、ボックスに収まる段まで下げる（§8 数字・短い語）。 */
const COUNT_STEPS = ["main", "section", "sub", "body"] as const;

type CountStep = (typeof COUNT_STEPS)[number];

/**
 * 文字数（「1,234文字」）。主見出しの段で1行に組み、ボックスの幅に収まらなければ、収まる段まで下げる。
 * いちばん下の段でも収まらなければ、桁区切りの位置で折り返す。幅と文字の大きさが変わったら（端末の回転・
 * ブラウザの拡大）選び直す。
 */
function MainCount({ value }: { value: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [step, setStep] = useState<CountStep>("main");

  useLayoutEffect(() => {
    const element = ref.current;
    const container = element?.parentElement;
    if (!element || !container) return;
    const fit = () => {
      // 段を上から当てて、1行が幅に収まる最初の段を選ぶ。測るあいだだけ属性を直に替える。
      const fitting =
        COUNT_STEPS.find((candidate) => {
          element.dataset.step = candidate;
          return element.scrollWidth <= element.clientWidth;
        }) ?? "body";
      element.dataset.step = fitting;
      setStep(fitting);
    };
    fit();
    if (typeof ResizeObserver === "undefined") return;
    // 置かれた幅が変わったときだけ選び直す。段を替えると高さが変わるので、高さの変化では選び直さない。
    let width = container.clientWidth;
    const observer = new ResizeObserver(() => {
      if (container.clientWidth === width) return;
      width = container.clientWidth;
      fit();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [value]);

  return (
    <p ref={ref} className={styles.count} data-step={step}>
      <GroupedNumber value={value} />
      文字
    </p>
  );
}

/**
 * 文字数カウント。書き込んだ文を打つたびに数え、文字数を主役の数として結果のボックスに大きく出し、ほかの数を
 * その下の表に並べる（DESIGN.md §8）。入力は囲まず、結果だけをボックスに入れる。
 *
 * 数が変わるたびに、読み上げには主な数をまとめた文を知らせる。表は知らせに含めず、来訪者が読みに行ったとき
 * に読まれる。
 */
export default function CharCountTile({
  variant = "full",
  className,
}: CharCountTileProps = {}) {
  const summaryId = useId();
  const [text, setText] = useState("");
  const result = useMemo(() => analyzeText(text), [text]);

  const summary = text
    ? `${result.chars}文字、${result.bytes}バイト、${result.lines}行、${result.words}単語`
    : "テキストを入力してください";

  return (
    <div className={[styles.tile, className].filter(Boolean).join(" ")}>
      <Field label="数えるテキスト">
        {(control) => (
          <Textarea
            {...control}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={variant === "compact" ? 5 : 10}
            aria-describedby={summaryId}
          />
        )}
      </Field>

      <div
        id={summaryId}
        role="status"
        aria-live="polite"
        className="visually-hidden"
      >
        {summary}
      </div>

      <ResultBox caption="数えた結果">
        <div className={styles.result}>
          <MainCount value={result.chars} />
          <table className={styles.counts}>
            <tbody>
              {ROWS[variant].map(({ key, label }) => (
                <tr key={key}>
                  <th scope="row">
                    {label.map((phrase, index) => (
                      <Fragment key={index}>
                        {index > 0 && <wbr />}
                        {phrase}
                      </Fragment>
                    ))}
                  </th>
                  <td>
                    <GroupedNumber value={result[key]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ResultBox>
    </div>
  );
}

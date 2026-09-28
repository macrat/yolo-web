"use client";

import { Fragment, useEffect, useId, useMemo, useState } from "react";
import Field from "@/components/Field";
import FittedNumber from "@/components/FittedNumber";
import ResultBox from "@/components/ResultBox";
import Textarea from "@/components/Textarea";
import { analyzeText, type CharCountResult } from "./logic";
import styles from "./CharCountTile.module.css";

/** 表に並べる数。名前は表のセルの中で文節の切れ目（<wbr>）で折るので、文節ごとに区切る。 */
interface CountRow {
  key: keyof CharCountResult;
  label: readonly string[];
}

const ROWS: readonly CountRow[] = [
  { key: "charsNoSpaces", label: ["空白と", "改行を", "除いた", "文字数"] },
  { key: "bytes", label: ["UTF-8の", "バイト数"] },
  { key: "words", label: ["単語数"] },
  { key: "lines", label: ["行数"] },
  { key: "paragraphs", label: ["段落数"] },
];

/**
 * 打つ手が止まってから数を読み上げるまでの間（ミリ秒）。打つたびに知らせると、打った字の読み上げと重なる。
 */
const ANNOUNCE_DELAY_MS = 800;

const EMPTY_SUMMARY = "テキストを入力してください";

const numberFormat = new Intl.NumberFormat("ja-JP");

/** 数を桁区切りで書き、桁区切りの後ろで分けた並びにする。数を折るのは桁区切りの位置だけ（§8）。 */
function digitGroups(value: number): string[] {
  const groups = numberFormat.format(value).split(",");
  return groups.map((group, index) =>
    index < groups.length - 1 ? `${group},` : group,
  );
}

/** 表の値。桁区切りの後ろにだけ折り所（<wbr>）を置く。 */
function GroupedNumber({ value }: { value: number }) {
  return digitGroups(value).map((group, index) => (
    <Fragment key={index}>
      {index > 0 && <wbr />}
      {group}
    </Fragment>
  ));
}

/** 主役の文字数（「1,234文字」）。単位は数の最後の桁の並びに付け、数から離さない。 */
function mainCountSegments(value: number): string[] {
  const groups = digitGroups(value);
  groups[groups.length - 1] += "文字";
  return groups;
}

/**
 * 文字数カウント。書き込んだ文を打つたびに数え、文字数を主役の数として結果のボックスに大きく出し、ほかの数を
 * その下の表に並べる（DESIGN.md §8）。入力は囲まず、結果だけをボックスに入れる。
 *
 * 読み上げには、打つ手が止まったところで主な数をまとめた文を知らせる。表は知らせに含めず、来訪者が読みに
 * 行ったときに読まれる。
 */
export default function CharCountTile() {
  const summaryId = useId();
  const [text, setText] = useState("");
  const result = useMemo(() => analyzeText(text), [text]);
  const [announced, setAnnounced] = useState(EMPTY_SUMMARY);

  const summary = text
    ? `${result.chars}文字、${result.bytes}バイト、${result.lines}行、${result.words}単語`
    : EMPTY_SUMMARY;

  useEffect(() => {
    const timer = setTimeout(() => setAnnounced(summary), ANNOUNCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [summary]);

  return (
    <div className={styles.tile}>
      <Field label="数えるテキスト">
        {(control) => (
          <Textarea
            {...control}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
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
        {announced}
      </div>

      <ResultBox caption="数えた結果">
        <div className={styles.result}>
          <FittedNumber segments={mainCountSegments(result.chars)} />
          <table className={styles.counts}>
            <tbody>
              {ROWS.map(({ key, label }) => (
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

"use client";

/**
 * AgeCalculatorTile — 年齢計算の道具。道具のページ（src/app/tools/age-calculator/page.tsx）が描く。
 *
 * 生年月日と基準日の入力欄は枠で囲まず（DESIGN.md §8 入力）、計算の結果だけを結果のボックスに入れる
 * （§8 結果）。結果はラベルと値の組が並ぶ形なので、ボックスがそのまま §5 の表のボックスになる。
 *
 * - 計算するたびに、結果の要約を画面に出さない status の行で知らせ（§8）、結果が画面の下にはみ出すときは
 *   結果が見えるまで送る（src/lib/reveal.ts）。
 * - 計算は logic.ts の関数が持ち、この部品は入力と表示だけを持つ。
 */

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Field from "@/components/Field";
import Input from "@/components/Input";
import Button from "@/components/Button";
import ResultBox from "@/components/ResultBox";
import { revealResult } from "@/lib/reveal";
import {
  calculateAge,
  toWareki,
  getZodiac,
  getConstellation,
  formatDate,
  parseDate,
} from "./logic";
import styles from "./AgeCalculatorTile.module.css";

/**
 * 結果の表の1行。ラベルは文節に、値は組（数と単位・元号と年・干支と読み）に分けて持ち、その切れ目でだけ
 * 折る（§4・§8）。文字を大きくした狭い画面でも、値が列の幅の中で折り返し、数と単位は離れない。
 */
interface ResultRow {
  label: readonly string[];
  value: readonly string[];
}

type FieldName = "birth" | "target";

interface InputError {
  field: FieldName;
  message: string;
}

interface CalculationResult {
  /** 計算した回ごとに増える番号。結果のボックスを操作ごとに描き直し、登場の動きを持たせる。 */
  run: number;
  rows: ResultRow[];
  /** 読み上げで知らせる文。 */
  announcement: string;
}

/**
 * 数を桁区切りの位置で分け、最後の組に単位を付ける（「13,」「253日」）。数を折るのは桁区切りの位置だけ（§8）。
 * 区切りは日本語の書き方で固定し、ブラウザの言語が何でも「46,290日」と書く（ドイツ語の「46.290」は小数に読める）。
 */
function numberWithUnit(value: number, unit: string): string[] {
  const groups = value.toLocaleString("ja-JP").split(",");
  return groups.map((group, index) =>
    index < groups.length - 1 ? `${group},` : `${group}${unit}`,
  );
}

function buildResult(
  birthDate: Date,
  targetDate: Date,
  run: number,
): CalculationResult {
  const age = calculateAge(birthDate, targetDate);
  const wareki = toWareki(birthDate);
  const zodiac = getZodiac(birthDate.getFullYear());
  const ageParts = [`${age.years}歳`, `${age.months}ヶ月`, `${age.days}日`];
  const rows: ResultRow[] = [
    { label: ["年齢"], value: ageParts },
    { label: ["通算日数"], value: numberWithUnit(age.totalDays, "日") },
    { label: ["通算月数"], value: numberWithUnit(age.totalMonths, "ヶ月") },
  ];
  if (wareki) {
    rows.push({
      label: ["生まれ年", "（和暦）"],
      value: [wareki.era, wareki.yearLabel],
    });
  }
  rows.push(
    {
      label: ["干支"],
      value: [zodiac.kanji, `（${zodiac.reading}）`],
    },
    {
      label: ["星座"],
      value: [getConstellation(birthDate.getMonth() + 1, birthDate.getDate())],
    },
  );
  return { run, rows, announcement: `年齢は${ageParts.join("")}です` };
}

/** 分けた字の並びを、切れ目に折り所（wbr）を置いて並べる。 */
function withBreaks(parts: readonly string[]) {
  return parts.map((part, index) => (
    <Fragment key={index}>
      {index > 0 && <wbr />}
      {part}
    </Fragment>
  ));
}

export default function AgeCalculatorTile() {
  const [birthDateStr, setBirthDateStr] = useState("");
  const [targetDateStr, setTargetDateStr] = useState(formatDate(new Date()));
  const [error, setError] = useState<InputError | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLElement>(null);
  const run = result?.run;

  useEffect(() => {
    if (run === undefined || !actionsRef.current || !resultRef.current) return;
    revealResult(actionsRef.current, resultRef.current);
  }, [run]);

  const handleCalculate = useCallback(() => {
    const birthDate = parseDate(birthDateStr);
    const targetDate = parseDate(targetDateStr);
    const fail = (field: FieldName, message: string) => {
      setError({ field, message });
      setResult(null);
    };
    if (!birthDate) return fail("birth", "生年月日を入力してください");
    if (!targetDate) return fail("target", "基準日を入力してください");
    if (birthDate > targetDate) {
      return fail(
        "birth",
        "生年月日には、基準日と同じ日か、それより前の日付を入力してください",
      );
    }
    setError(null);
    setResult((previous) =>
      buildResult(birthDate, targetDate, (previous?.run ?? 0) + 1),
    );
  }, [birthDateStr, targetDateStr]);

  const handleSetToday = useCallback(() => {
    setTargetDateStr(formatDate(new Date()));
  }, []);

  const errorFor = (field: FieldName) =>
    error?.field === field ? error.message : undefined;

  return (
    <div className={styles.tile}>
      <div className={styles.fields}>
        <Field label="生年月日" required error={errorFor("birth")}>
          {(control) => (
            <Input
              {...control}
              type="date"
              value={birthDateStr}
              onChange={(e) => setBirthDateStr(e.target.value)}
            />
          )}
        </Field>
        <Field label="基準日" required error={errorFor("target")}>
          {(control) => (
            <div className={styles.dateRow}>
              <Input
                {...control}
                type="date"
                value={targetDateStr}
                onChange={(e) => setTargetDateStr(e.target.value)}
                className={styles.dateInput}
              />
              <Button onClick={handleSetToday}>今日に設定</Button>
            </div>
          )}
        </Field>
      </div>

      <div ref={actionsRef} className={styles.actions}>
        <Button variant="primary" onClick={handleCalculate}>
          計算
        </Button>
      </div>

      {/* 同じ入力で計算し直しても知らせるよう、計算ごとに中身を作り直す。 */}
      <p role="status" className="visually-hidden">
        {result && <span key={result.run}>{result.announcement}</span>}
      </p>

      {result && (
        <ResultBox
          key={result.run}
          ref={resultRef}
          caption="年齢の計算の結果"
          kind="table"
          appear
        >
          <table className={styles.resultTable}>
            <tbody>
              {result.rows.map((row) => (
                <tr key={row.label.join("")}>
                  <th scope="row">{withBreaks(row.label)}</th>
                  <td>{withBreaks(row.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ResultBox>
      )}
    </div>
  );
}

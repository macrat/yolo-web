"use client";

/**
 * AgeCalculatorTile — 年齢計算のタイル。道具箱と詳細ページが同じこの部品を描く。
 *
 * 生年月日と基準日の入力欄は枠で囲まず（DESIGN.md §8 入力）、計算の結果だけを結果のボックスに入れる
 * （§8 結果）。結果はラベルと値の組が並ぶ形なので、ボックスがそのまま §5 の表のボックスになる。
 *
 * - 入力欄の id は useId で作り、同じページに2つ置いてもラベルが取り違えられない。
 * - 計算の結果の要約は、画面に出さない status の行に入れてスクリーンリーダーに知らせる（§8）。
 * - 計算は logic.ts の関数が持ち、この部品は入力と表示だけを持つ。
 */

import { Fragment, useCallback, useState } from "react";
import Field from "@/components/Field";
import Input from "@/components/Input";
import Button from "@/components/Button";
import ResultBox from "@/components/ResultBox";
import {
  calculateAge,
  toWareki,
  getZodiacWithReading,
  getConstellation,
  formatDate,
  parseDate,
} from "./logic";
import styles from "./AgeCalculatorTile.module.css";

export type AgeCalculatorTileVariant = "full";

export interface AgeCalculatorTileProps {
  /** 表示の種類。生年月日と基準日から全部の値を出す "full" だけを持つ。 */
  variant?: AgeCalculatorTileVariant;
  /** ルート要素のタグ（既定: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

/**
 * 結果の表の1行。ラベルは文節に、値は数と単位の組に分けて持ち、その切れ目でだけ折る（§4・§8）。
 * 文字を大きくした狭い画面でも、値が列の幅の中で折り返し、表を横に送らずに読める。
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
  summary: string;
}

/** 数を桁区切りの位置で分け、最後の組に単位を付ける（「13,」「253日」）。数を折るのは桁区切りの位置だけ（§8）。 */
function numberWithUnit(value: number, unit: string): string[] {
  const groups = value.toLocaleString().split(",");
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
  const ageParts = [`${age.years}歳`, `${age.months}ヶ月`, `${age.days}日`];
  const rows: ResultRow[] = [
    { label: ["年齢"], value: ageParts },
    { label: ["通算日数"], value: numberWithUnit(age.totalDays, "日") },
    { label: ["通算月数"], value: numberWithUnit(age.totalMonths, "ヶ月") },
  ];
  if (wareki) {
    rows.push({
      label: ["生まれ年", "（和暦）"],
      value: [wareki.era, wareki.formatted.slice(wareki.era.length)],
    });
  }
  rows.push(
    {
      label: ["干支"],
      value: [getZodiacWithReading(birthDate.getFullYear())],
    },
    {
      label: ["星座"],
      value: [getConstellation(birthDate.getMonth() + 1, birthDate.getDate())],
    },
  );
  return { run, rows, summary: `${ageParts.join("")} を計算しました` };
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

export default function AgeCalculatorTile({
  as: Root = "section",
  className,
}: AgeCalculatorTileProps = {}) {
  const [birthDateStr, setBirthDateStr] = useState("");
  const [targetDateStr, setTargetDateStr] = useState(formatDate(new Date()));
  const [error, setError] = useState<InputError | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);

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
      return fail("birth", "生年月日は基準日より前の日付を入力してください");
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
    <Root className={[styles.tile, className].filter(Boolean).join(" ")}>
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

      <div className={styles.actions}>
        <Button variant="primary" onClick={handleCalculate}>
          計算
        </Button>
      </div>

      <div role="status" aria-live="polite" className="visually-hidden">
        {result?.summary}
      </div>

      {result && (
        <ResultBox
          key={result.run}
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
    </Root>
  );
}

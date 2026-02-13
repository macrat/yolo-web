"use client";

import { useState, useCallback } from "react";
import {
  dateDiff,
  addDays,
  toWareki,
  fromWareki,
  formatDate,
  parseDate,
  getDayOfWeek,
  type DateDiffResult,
  type WarekiResult,
} from "./logic";
import styles from "./Component.module.css";

const ERA_OPTIONS = ["令和", "平成", "昭和", "大正", "明治"];

export default function DateCalculatorTool() {
  // Section 1: Date difference
  const [date1, setDate1] = useState(formatDate(new Date()));
  const [date2, setDate2] = useState(formatDate(new Date()));
  const [diffResult, setDiffResult] = useState<DateDiffResult | null>(null);
  const [diffError, setDiffError] = useState("");

  // Section 2: Date add/subtract
  const [baseDate, setBaseDate] = useState(formatDate(new Date()));
  const [daysToAdd, setDaysToAdd] = useState(0);
  const [addResult, setAddResult] = useState<string>("");
  const [addResultDay, setAddResultDay] = useState<string>("");

  // Section 3: Wareki conversion
  const [warekiDate, setWarekiDate] = useState(formatDate(new Date()));
  const [warekiResult, setWarekiResult] = useState<WarekiResult | null>(null);
  const [warekiEra, setWarekiEra] = useState("令和");
  const [warekiYear, setWarekiYear] = useState(1);
  const [warekiMonth, setWarekiMonth] = useState(1);
  const [warekiDay, setWarekiDay] = useState(1);
  const [fromWarekiResult, setFromWarekiResult] = useState<string>("");
  const [fromWarekiError, setFromWarekiError] = useState("");

  // Section 1 handler
  const handleDiffCalc = useCallback(() => {
    setDiffError("");
    const d1 = parseDate(date1);
    const d2 = parseDate(date2);
    if (!d1 || !d2) {
      setDiffError("有効な日付を入力してください");
      setDiffResult(null);
      return;
    }
    setDiffResult(dateDiff(d1, d2));
  }, [date1, date2]);

  // Section 2 handler
  const handleAdd = useCallback(
    (sign: 1 | -1) => {
      const d = parseDate(baseDate);
      if (!d) return;
      const result = addDays(d, daysToAdd * sign);
      setAddResult(formatDate(result));
      setAddResultDay(getDayOfWeek(result));
    },
    [baseDate, daysToAdd],
  );

  // Section 3 handlers
  const handleToWareki = useCallback(() => {
    const d = parseDate(warekiDate);
    if (!d) {
      setWarekiResult(null);
      return;
    }
    setWarekiResult(toWareki(d));
  }, [warekiDate]);

  const handleFromWareki = useCallback(() => {
    setFromWarekiError("");
    const result = fromWareki(warekiEra, warekiYear, warekiMonth, warekiDay);
    if (result.success && result.date) {
      setFromWarekiResult(
        `${formatDate(result.date)} (${getDayOfWeek(result.date)})`,
      );
    } else {
      setFromWarekiError(result.error || "変換に失敗しました");
      setFromWarekiResult("");
    }
  }, [warekiEra, warekiYear, warekiMonth, warekiDay]);

  return (
    <div className={styles.container}>
      {/* Section 1: Date Difference */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>日付の差分</h3>
        <div className={styles.row}>
          <input
            type="date"
            className={styles.dateInput}
            value={date1}
            onChange={(e) => setDate1(e.target.value)}
            aria-label="Date 1"
          />
          <span className={styles.label}>から</span>
          <input
            type="date"
            className={styles.dateInput}
            value={date2}
            onChange={(e) => setDate2(e.target.value)}
            aria-label="Date 2"
          />
          <button
            type="button"
            onClick={handleDiffCalc}
            className={styles.button}
          >
            計算
          </button>
        </div>
        {diffError && (
          <div className={styles.error} role="alert">
            {diffError}
          </div>
        )}
        {diffResult && (
          <div
            className={styles.resultTable}
            role="region"
            aria-label="Date difference result"
          >
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>日数</span>
              <span className={styles.resultValue}>
                {diffResult.totalDays}日
              </span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>週</span>
              <span className={styles.resultValue}>
                {diffResult.weeks}週 {diffResult.totalDays % 7}日
              </span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>月数</span>
              <span className={styles.resultValue}>
                {diffResult.months}ヶ月 {diffResult.days}日
              </span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>年数</span>
              <span className={styles.resultValue}>
                {diffResult.years}年 {diffResult.months % 12}ヶ月{" "}
                {diffResult.days}日
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Section 2: Date Add/Subtract */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>日付の加算・減算</h3>
        <div className={styles.row}>
          <input
            type="date"
            className={styles.dateInput}
            value={baseDate}
            onChange={(e) => setBaseDate(e.target.value)}
            aria-label="Base date"
          />
          <input
            type="number"
            className={styles.numberInput}
            value={daysToAdd}
            onChange={(e) => setDaysToAdd(parseInt(e.target.value, 10) || 0)}
            aria-label="Days to add or subtract"
          />
          <span className={styles.label}>日</span>
          <button
            type="button"
            onClick={() => handleAdd(1)}
            className={styles.button}
          >
            加算
          </button>
          <button
            type="button"
            onClick={() => handleAdd(-1)}
            className={styles.buttonSecondary}
          >
            減算
          </button>
        </div>
        {addResult && (
          <div
            className={styles.resultTable}
            role="region"
            aria-label="Date add/subtract result"
          >
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>結果</span>
              <span className={styles.resultValue}>
                {addResult} ({addResultDay})
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Section 3: Wareki Conversion */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>和暦・西暦変換</h3>

        {/* Western to Wareki */}
        <div className={styles.row}>
          <span className={styles.label}>西暦→和暦:</span>
          <input
            type="date"
            className={styles.dateInput}
            value={warekiDate}
            onChange={(e) => setWarekiDate(e.target.value)}
            aria-label="Western date for wareki conversion"
          />
          <button
            type="button"
            onClick={handleToWareki}
            className={styles.button}
          >
            変換
          </button>
        </div>
        {warekiResult && warekiResult.success && (
          <div
            className={styles.resultTable}
            role="region"
            aria-label="Wareki conversion result"
          >
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>和暦</span>
              <span className={styles.resultValue}>
                {warekiResult.formatted}
              </span>
            </div>
          </div>
        )}
        {warekiResult && !warekiResult.success && (
          <div className={styles.error} role="alert">
            {warekiResult.error}
          </div>
        )}

        {/* Wareki to Western */}
        <div className={styles.row}>
          <span className={styles.label}>和暦→西暦:</span>
        </div>
        <div className={styles.warekiInputs}>
          <select
            className={styles.selectInput}
            value={warekiEra}
            onChange={(e) => setWarekiEra(e.target.value)}
            aria-label="Era"
          >
            {ERA_OPTIONS.map((era) => (
              <option key={era} value={era}>
                {era}
              </option>
            ))}
          </select>
          <input
            type="number"
            className={styles.numberInput}
            value={warekiYear}
            min={1}
            onChange={(e) => setWarekiYear(parseInt(e.target.value, 10) || 1)}
            aria-label="Era year"
          />
          <span className={styles.label}>年</span>
          <input
            type="number"
            className={styles.numberInput}
            value={warekiMonth}
            min={1}
            max={12}
            onChange={(e) => setWarekiMonth(parseInt(e.target.value, 10) || 1)}
            aria-label="Month"
          />
          <span className={styles.label}>月</span>
          <input
            type="number"
            className={styles.numberInput}
            value={warekiDay}
            min={1}
            max={31}
            onChange={(e) => setWarekiDay(parseInt(e.target.value, 10) || 1)}
            aria-label="Day"
          />
          <span className={styles.label}>日</span>
          <button
            type="button"
            onClick={handleFromWareki}
            className={styles.button}
          >
            変換
          </button>
        </div>
        {fromWarekiError && (
          <div className={styles.error} role="alert">
            {fromWarekiError}
          </div>
        )}
        {fromWarekiResult && (
          <div
            className={styles.resultTable}
            role="region"
            aria-label="Western date result"
          >
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>西暦</span>
              <span className={styles.resultValue}>{fromWarekiResult}</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

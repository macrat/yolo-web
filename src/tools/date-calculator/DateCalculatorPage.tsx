"use client";

import { useState, useCallback } from "react";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";
import ErrorMessage from "@/components/ErrorMessage";
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
import styles from "./DateCalculatorPage.module.css";

const ERA_OPTIONS = ["令和", "平成", "昭和", "大正", "明治"] as const;

/**
 * DateCalculatorPage — 日付計算ツール本体（単一実装）。
 *
 * 3セクション構成:
 * 1. 日付差分: 2つの日付の差（日数・週・月・年）
 * 2. 日付加算・減算: 基準日±N日 → 到達日
 * 3. 和暦・西暦変換: 双方向変換
 *
 * 出力はその場で読む答えのため、T-4b 方針によりコピーボタンなし。
 *
 * C-3 準拠: live region（role="status" aria-live="polite"）には
 * 実テキストノードのサマリを配置し、各結果欄は live region の外に置く。
 */
export default function DateCalculatorPage() {
  // Section 1: 日付差分
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  const [diffResult, setDiffResult] = useState<DateDiffResult | null>(null);
  const [diffError, setDiffError] = useState("");
  const [diffStatus, setDiffStatus] = useState("");

  // Section 2: 日付加算・減算
  const [baseDate, setBaseDate] = useState("");
  const [daysToAdd, setDaysToAdd] = useState(0);
  const [addResult, setAddResult] = useState<string>("");
  const [addResultDay, setAddResultDay] = useState<string>("");
  const [addStatus, setAddStatus] = useState("");

  // Section 3: 和暦変換 (西暦→和暦)
  const [warekiDate, setWarekiDate] = useState("");
  const [warekiResult, setWarekiResult] = useState<WarekiResult | null>(null);
  const [warekiStatus, setWarekiStatus] = useState("");

  // Section 3: 和暦変換 (和暦→西暦)
  const [warekiEra, setWarekiEra] = useState<string>("令和");
  const [warekiYear, setWarekiYear] = useState(1);
  const [warekiMonth, setWarekiMonth] = useState(1);
  const [warekiDay, setWarekiDay] = useState(1);
  const [fromWarekiResult, setFromWarekiResult] = useState<string>("");
  const [fromWarekiError, setFromWarekiError] = useState("");
  const [fromWarekiStatus, setFromWarekiStatus] = useState("");

  // Section 1: 差分計算ハンドラ
  const handleDiffCalc = useCallback(() => {
    setDiffError("");
    setDiffResult(null);
    setDiffStatus("");
    const d1 = parseDate(date1);
    const d2 = parseDate(date2);
    if (!d1 || !d2) {
      setDiffError("有効な日付を2つ入力してください");
      return;
    }
    const result = dateDiff(d1, d2);
    setDiffResult(result);
    setDiffStatus(`${result.totalDays}日差 を計算しました`);
  }, [date1, date2]);

  // Section 2: 加算ハンドラ
  const handleAdd = useCallback(
    (sign: 1 | -1) => {
      const d = parseDate(baseDate);
      if (!d) return;
      const result = addDays(d, daysToAdd * sign);
      const resultStr = formatDate(result);
      const dayOfWeek = getDayOfWeek(result);
      setAddResult(resultStr);
      setAddResultDay(dayOfWeek);
      const op = sign === 1 ? "加算" : "減算";
      setAddStatus(`${op}結果: ${resultStr} (${dayOfWeek})`);
    },
    [baseDate, daysToAdd],
  );

  // Section 3: 西暦→和暦ハンドラ
  const handleToWareki = useCallback(() => {
    setWarekiResult(null);
    setWarekiStatus("");
    const d = parseDate(warekiDate);
    if (!d) {
      setWarekiResult({
        success: false,
        error: "有効な日付を入力してください",
      });
      return;
    }
    const result = toWareki(d);
    setWarekiResult(result);
    if (result.success && result.formatted) {
      setWarekiStatus(`和暦: ${result.formatted}`);
    } else {
      setWarekiStatus("");
    }
  }, [warekiDate]);

  // Section 3: 和暦→西暦ハンドラ
  const handleFromWareki = useCallback(() => {
    setFromWarekiError("");
    setFromWarekiResult("");
    setFromWarekiStatus("");
    const result = fromWareki(warekiEra, warekiYear, warekiMonth, warekiDay);
    if (result.success && result.date) {
      const dateStr = formatDate(result.date);
      const dayOfWeek = getDayOfWeek(result.date);
      setFromWarekiResult(`${dateStr} (${dayOfWeek})`);
      setFromWarekiStatus(`西暦: ${dateStr} (${dayOfWeek})`);
    } else {
      setFromWarekiError(result.error || "変換に失敗しました");
    }
  }, [warekiEra, warekiYear, warekiMonth, warekiDay]);

  return (
    <div className={styles.container}>
      {/* Section 1: 日付の差分 */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>日付の差分</h3>
        <div className={styles.row}>
          <label htmlFor="date1" className={styles.srOnly}>
            日付1
          </label>
          <Input
            id="date1"
            type="date"
            value={date1}
            onChange={(e) => setDate1(e.target.value)}
            aria-label="日付1"
          />
          <span className={styles.separator} aria-hidden="true">
            から
          </span>
          <label htmlFor="date2" className={styles.srOnly}>
            日付2
          </label>
          <Input
            id="date2"
            type="date"
            value={date2}
            onChange={(e) => setDate2(e.target.value)}
            aria-label="日付2"
          />
          <Button variant="primary" onClick={handleDiffCalc}>
            差分を計算
          </Button>
        </div>

        {/* A-4: ErrorMessage 共通部品・日本語メッセージ */}
        {diffError && <ErrorMessage message={diffError} />}

        {/* C-3: live region — 実テキストノードのサマリ */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={styles.srOnly}
        >
          {diffStatus}
        </div>

        {/* 差分結果 */}
        {diffResult && (
          <section
            className={styles.resultTable}
            role="region"
            aria-label="日付差分の結果"
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
          </section>
        )}
      </section>

      {/* Section 2: 日付の加算・減算 */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>日付の加算・減算</h3>
        <div className={styles.row}>
          <label htmlFor="base-date" className={styles.srOnly}>
            基準日
          </label>
          <Input
            id="base-date"
            type="date"
            value={baseDate}
            onChange={(e) => setBaseDate(e.target.value)}
            aria-label="基準日"
          />
          <label htmlFor="days-to-add" className={styles.srOnly}>
            日数
          </label>
          <Input
            id="days-to-add"
            type="number"
            className={styles.numberInput}
            value={String(daysToAdd)}
            onChange={(e) => setDaysToAdd(parseInt(e.target.value, 10) || 0)}
            aria-label="日数"
            min={0}
          />
          <span className={styles.unit} aria-hidden="true">
            日
          </span>
          <Button variant="primary" onClick={() => handleAdd(1)}>
            加算
          </Button>
          <Button onClick={() => handleAdd(-1)}>減算</Button>
        </div>

        {/* C-3: live region */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={styles.srOnly}
        >
          {addStatus}
        </div>

        {addResult && (
          <section
            className={styles.resultTable}
            role="region"
            aria-label="加減算の結果"
          >
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>結果</span>
              <span className={styles.resultValue}>
                {addResult} ({addResultDay})
              </span>
            </div>
          </section>
        )}
      </section>

      {/* Section 3: 和暦・西暦変換 */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>和暦・西暦変換</h3>

        {/* 西暦→和暦 */}
        <div className={styles.subSection}>
          <p className={styles.subLabel}>西暦 → 和暦</p>
          <div className={styles.row}>
            <label htmlFor="wareki-date" className={styles.srOnly}>
              西暦→和暦 日付入力
            </label>
            <Input
              id="wareki-date"
              type="date"
              value={warekiDate}
              onChange={(e) => setWarekiDate(e.target.value)}
              aria-label="西暦→和暦 日付入力"
            />
            <Button variant="primary" onClick={handleToWareki}>
              西暦→和暦 変換
            </Button>
          </div>

          {/* C-3: live region */}
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={styles.srOnly}
          >
            {warekiStatus}
          </div>

          {warekiResult && warekiResult.success && (
            <section
              className={styles.resultTable}
              role="region"
              aria-label="和暦変換の結果"
            >
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>和暦</span>
                <span className={styles.resultValue}>
                  {warekiResult.formatted}
                </span>
              </div>
            </section>
          )}
          {warekiResult && !warekiResult.success && (
            <ErrorMessage
              message={warekiResult.error || "変換に失敗しました"}
            />
          )}
        </div>

        {/* 和暦→西暦 */}
        <div className={styles.subSection}>
          <p className={styles.subLabel}>和暦 → 西暦</p>
          <div className={styles.warekiInputs}>
            <label htmlFor="era-select" className={styles.srOnly}>
              元号
            </label>
            <Select
              id="era-select"
              value={warekiEra}
              onChange={(e) => setWarekiEra(e.target.value)}
              aria-label="元号"
            >
              {ERA_OPTIONS.map((era) => (
                <option key={era} value={era}>
                  {era}
                </option>
              ))}
            </Select>
            <label htmlFor="era-year" className={styles.srOnly}>
              元号年
            </label>
            <Input
              id="era-year"
              type="number"
              className={styles.shortNumberInput}
              value={String(warekiYear)}
              min={1}
              onChange={(e) => setWarekiYear(parseInt(e.target.value, 10) || 1)}
              aria-label="元号年"
            />
            <span className={styles.unit} aria-hidden="true">
              年
            </span>
            <label htmlFor="era-month" className={styles.srOnly}>
              月
            </label>
            <Input
              id="era-month"
              type="number"
              className={styles.shortNumberInput}
              value={String(warekiMonth)}
              min={1}
              max={12}
              onChange={(e) =>
                setWarekiMonth(parseInt(e.target.value, 10) || 1)
              }
              aria-label="月"
            />
            <span className={styles.unit} aria-hidden="true">
              月
            </span>
            <label htmlFor="era-day" className={styles.srOnly}>
              日
            </label>
            <Input
              id="era-day"
              type="number"
              className={styles.shortNumberInput}
              value={String(warekiDay)}
              min={1}
              max={31}
              onChange={(e) => setWarekiDay(parseInt(e.target.value, 10) || 1)}
              aria-label="日"
            />
            <span className={styles.unit} aria-hidden="true">
              日
            </span>
            <Button variant="primary" onClick={handleFromWareki}>
              和暦→西暦 変換
            </Button>
          </div>

          {/* A-4: ErrorMessage 共通部品・日本語メッセージ */}
          {fromWarekiError && <ErrorMessage message={fromWarekiError} />}

          {/* C-3: live region */}
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={styles.srOnly}
          >
            {fromWarekiStatus}
          </div>

          {fromWarekiResult && (
            <section
              className={styles.resultTable}
              role="region"
              aria-label="西暦変換の結果"
            >
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>西暦</span>
                <span className={styles.resultValue}>{fromWarekiResult}</span>
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}

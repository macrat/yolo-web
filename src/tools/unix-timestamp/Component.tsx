"use client";

import { useState, useEffect, useCallback } from "react";
import { getCurrentTimestamp, timestampToDate, dateToTimestamp } from "./logic";
import styles from "./Component.module.css";

export default function UnixTimestampTool() {
  const [currentTs, setCurrentTs] = useState(getCurrentTimestamp());
  const [tsInput, setTsInput] = useState("");
  const [isMilliseconds, setIsMilliseconds] = useState(false);
  const [tsResult, setTsResult] = useState<ReturnType<
    typeof timestampToDate
  > | null>(null);
  const [tsError, setTsError] = useState("");

  // Date to timestamp
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [day, setDay] = useState(new Date().getDate());
  const [hours, setHours] = useState(new Date().getHours());
  const [minutes, setMinutes] = useState(new Date().getMinutes());
  const [seconds, setSeconds] = useState(0);
  const [dateResult, setDateResult] = useState<{
    seconds: number;
    milliseconds: number;
  } | null>(null);

  const [copied, setCopied] = useState("");

  // Update current timestamp every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTs(getCurrentTimestamp());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTimestampConvert = useCallback(() => {
    setTsError("");
    const num = parseInt(tsInput, 10);
    if (isNaN(num)) {
      setTsError("有効な数値を入力してください");
      setTsResult(null);
      return;
    }
    const result = timestampToDate(num, isMilliseconds);
    if (!result) {
      setTsError("無効なタイムスタンプです");
      setTsResult(null);
      return;
    }
    setTsResult(result);
  }, [tsInput, isMilliseconds]);

  const handleDateConvert = useCallback(() => {
    const result = dateToTimestamp(year, month, day, hours, minutes, seconds);
    setDateResult(result);
  }, [year, month, day, hours, minutes, seconds]);

  const handleUseNow = useCallback(() => {
    const now = getCurrentTimestamp();
    setTsInput(String(now));
    const result = timestampToDate(now);
    setTsResult(result);
    setTsError("");
  }, []);

  const handleCopy = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      // Clipboard API not available
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.currentTime}>
        <span className={styles.currentLabel}>現在のUNIXタイムスタンプ:</span>
        <code className={styles.currentValue}>{currentTs}</code>
        <button
          type="button"
          onClick={() => handleCopy(String(currentTs), "current")}
          className={styles.smallCopyButton}
        >
          {copied === "current" ? "コピー済み" : "コピー"}
        </button>
      </div>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>タイムスタンプ → 日時</h3>
        <div className={styles.row}>
          <input
            type="text"
            className={styles.input}
            value={tsInput}
            onChange={(e) => setTsInput(e.target.value)}
            placeholder="UNIXタイムスタンプを入力..."
            aria-label="Unix timestamp input"
          />
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={isMilliseconds}
              onChange={(e) => setIsMilliseconds(e.target.checked)}
            />
            ミリ秒
          </label>
          <button
            type="button"
            onClick={handleTimestampConvert}
            className={styles.button}
          >
            変換
          </button>
          <button
            type="button"
            onClick={handleUseNow}
            className={styles.buttonSecondary}
          >
            現在時刻
          </button>
        </div>
        {tsError && (
          <div className={styles.error} role="alert">
            {tsError}
          </div>
        )}
        {tsResult && (
          <div
            className={styles.resultTable}
            role="region"
            aria-label="Conversion result"
          >
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>ローカル時刻</span>
              <code>{tsResult.localString}</code>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>UTC</span>
              <code>{tsResult.utcString}</code>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>ISO 8601</span>
              <code>{tsResult.isoString}</code>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>秒</span>
              <code>{tsResult.seconds}</code>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>ミリ秒</span>
              <code>{tsResult.milliseconds}</code>
            </div>
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>日時 → タイムスタンプ</h3>
        <div className={styles.dateInputs}>
          <div className={styles.dateField}>
            <label htmlFor="ts-year">年</label>
            <input
              id="ts-year"
              type="number"
              className={styles.dateInput}
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10) || 0)}
            />
          </div>
          <div className={styles.dateField}>
            <label htmlFor="ts-month">月</label>
            <input
              id="ts-month"
              type="number"
              className={styles.dateInput}
              value={month}
              min={1}
              max={12}
              onChange={(e) => setMonth(parseInt(e.target.value, 10) || 1)}
            />
          </div>
          <div className={styles.dateField}>
            <label htmlFor="ts-day">日</label>
            <input
              id="ts-day"
              type="number"
              className={styles.dateInput}
              value={day}
              min={1}
              max={31}
              onChange={(e) => setDay(parseInt(e.target.value, 10) || 1)}
            />
          </div>
          <div className={styles.dateField}>
            <label htmlFor="ts-hours">時</label>
            <input
              id="ts-hours"
              type="number"
              className={styles.dateInput}
              value={hours}
              min={0}
              max={23}
              onChange={(e) => setHours(parseInt(e.target.value, 10) || 0)}
            />
          </div>
          <div className={styles.dateField}>
            <label htmlFor="ts-minutes">分</label>
            <input
              id="ts-minutes"
              type="number"
              className={styles.dateInput}
              value={minutes}
              min={0}
              max={59}
              onChange={(e) => setMinutes(parseInt(e.target.value, 10) || 0)}
            />
          </div>
          <div className={styles.dateField}>
            <label htmlFor="ts-seconds">秒</label>
            <input
              id="ts-seconds"
              type="number"
              className={styles.dateInput}
              value={seconds}
              min={0}
              max={59}
              onChange={(e) => setSeconds(parseInt(e.target.value, 10) || 0)}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleDateConvert}
          className={styles.button}
        >
          変換
        </button>
        {dateResult && (
          <div
            className={styles.resultTable}
            role="region"
            aria-label="Date conversion result"
          >
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>秒</span>
              <code>{dateResult.seconds}</code>
              <button
                type="button"
                onClick={() =>
                  handleCopy(String(dateResult.seconds), "dateSec")
                }
                className={styles.smallCopyButton}
              >
                {copied === "dateSec" ? "コピー済み" : "コピー"}
              </button>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>ミリ秒</span>
              <code>{dateResult.milliseconds}</code>
              <button
                type="button"
                onClick={() =>
                  handleCopy(String(dateResult.milliseconds), "dateMs")
                }
                className={styles.smallCopyButton}
              >
                {copied === "dateMs" ? "コピー済み" : "コピー"}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

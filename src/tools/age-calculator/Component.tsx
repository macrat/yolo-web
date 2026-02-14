"use client";

import { useState, useCallback } from "react";
import {
  calculateAge,
  toWareki,
  getZodiac,
  getConstellation,
  formatDate,
  parseDate,
  type AgeResult,
  type WarekiInfo,
} from "./logic";
import styles from "./Component.module.css";

export default function AgeCalculatorTool() {
  const [birthDateStr, setBirthDateStr] = useState("");
  const [targetDateStr, setTargetDateStr] = useState(formatDate(new Date()));
  const [ageResult, setAgeResult] = useState<AgeResult | null>(null);
  const [warekiInfo, setWarekiInfo] = useState<WarekiInfo | null>(null);
  const [zodiac, setZodiac] = useState("");
  const [constellation, setConstellation] = useState("");
  const [error, setError] = useState("");

  const handleCalculate = useCallback(() => {
    setError("");
    setAgeResult(null);
    setWarekiInfo(null);
    setZodiac("");
    setConstellation("");

    const birthDate = parseDate(birthDateStr);
    const targetDate = parseDate(targetDateStr);

    if (!birthDate) {
      setError("生年月日を入力してください");
      return;
    }
    if (!targetDate) {
      setError("基準日を入力してください");
      return;
    }
    if (birthDate > targetDate) {
      setError("生年月日は基準日より前の日付を入力してください");
      return;
    }

    const result = calculateAge(birthDate, targetDate);
    setAgeResult(result);

    const wareki = toWareki(birthDate.getFullYear());
    setWarekiInfo(wareki);

    setZodiac(getZodiac(birthDate.getFullYear()));
    setConstellation(
      getConstellation(birthDate.getMonth() + 1, birthDate.getDate()),
    );
  }, [birthDateStr, targetDateStr]);

  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>年齢計算</h3>
        <div className={styles.row}>
          <span className={styles.label}>生年月日</span>
          <input
            type="date"
            className={styles.dateInput}
            value={birthDateStr}
            onChange={(e) => setBirthDateStr(e.target.value)}
            aria-label="生年月日"
          />
        </div>
        <div className={styles.row}>
          <span className={styles.label}>基準日</span>
          <input
            type="date"
            className={styles.dateInput}
            value={targetDateStr}
            onChange={(e) => setTargetDateStr(e.target.value)}
            aria-label="基準日"
          />
        </div>
        <div className={styles.row}>
          <button
            type="button"
            onClick={handleCalculate}
            className={styles.button}
          >
            計算
          </button>
          <button
            type="button"
            onClick={() => setTargetDateStr(formatDate(new Date()))}
            className={styles.buttonSecondary}
          >
            今日に設定
          </button>
        </div>
        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}
        {ageResult && (
          <div
            className={styles.resultTable}
            role="region"
            aria-label="年齢計算結果"
          >
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>年齢</span>
              <span className={styles.resultValue}>
                {ageResult.years}歳{ageResult.months}ヶ月{ageResult.days}日
              </span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>通算日数</span>
              <span className={styles.resultValue}>
                {ageResult.totalDays.toLocaleString()}日
              </span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>通算月数</span>
              <span className={styles.resultValue}>
                {ageResult.totalMonths.toLocaleString()}ヶ月
              </span>
            </div>
            {warekiInfo && (
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>生まれ年（和暦）</span>
                <span className={styles.resultValue}>
                  {warekiInfo.formatted}
                </span>
              </div>
            )}
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>干支</span>
              <span className={styles.resultValue}>{zodiac}</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>星座</span>
              <span className={styles.resultValue}>{constellation}</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

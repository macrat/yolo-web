"use client";

import { useState, useCallback } from "react";
import { calculateBmi, type BmiResult } from "./logic";
import styles from "./Component.module.css";

const CATEGORY_STYLE_MAP: Record<number, string> = {
  0: styles.categoryLow,
  1: styles.categoryNormal,
  2: styles.categoryHigh1,
  3: styles.categoryHigh2,
  4: styles.categoryHigh3,
  5: styles.categoryHigh4,
};

function getMeterPercent(bmi: number): number {
  // Map BMI 10-50 to 0-100%
  const clamped = Math.max(10, Math.min(50, bmi));
  return ((clamped - 10) / 40) * 100;
}

export default function BmiCalculatorTool() {
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [result, setResult] = useState<BmiResult | null>(null);
  const [error, setError] = useState("");

  const handleCalculate = useCallback(() => {
    setError("");
    setResult(null);

    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
      setError("身長と体重に正の数値を入力してください");
      return;
    }

    const bmiResult = calculateBmi(h, w);
    if (!bmiResult) {
      setError("計算できませんでした。入力値を確認してください。");
      return;
    }

    setResult(bmiResult);
  }, [height, weight]);

  const categoryClass = result ? CATEGORY_STYLE_MAP[result.categoryLevel] : "";

  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>BMI計算</h3>
        <div className={styles.row}>
          <label className={styles.label} htmlFor="bmi-height">
            身長
          </label>
          <input
            id="bmi-height"
            type="number"
            className={styles.numberInput}
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="170"
            min="1"
            step="0.1"
            aria-label="身長（cm）"
          />
          <span className={styles.label}>cm</span>
        </div>
        <div className={styles.row}>
          <label className={styles.label} htmlFor="bmi-weight">
            体重
          </label>
          <input
            id="bmi-weight"
            type="number"
            className={styles.numberInput}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="65"
            min="0.1"
            step="0.1"
            aria-label="体重（kg）"
          />
          <span className={styles.label}>kg</span>
        </div>
        <div className={styles.row}>
          <button
            type="button"
            onClick={handleCalculate}
            className={styles.button}
          >
            計算する
          </button>
        </div>
      </section>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {result && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>計算結果</h3>

          {/* BMI Meter */}
          <div
            className={styles.meter}
            role="img"
            aria-label={`BMI ${result.bmi} - ${result.category}`}
          >
            <div className={styles.meterTrack}>
              <div className={styles.meterZoneLow} />
              <div className={styles.meterZoneNormal} />
              <div className={styles.meterZoneHigh} />
            </div>
            <div
              className={styles.meterFill}
              style={{ left: `${getMeterPercent(result.bmi)}%` }}
            />
            <div className={styles.meterLabels}>
              <span>10</span>
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>40</span>
              <span>50</span>
            </div>
          </div>

          <div
            className={styles.resultTable}
            role="region"
            aria-label="BMI calculation result"
          >
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>BMI</span>
              <span className={styles.resultValue}>{result.bmi}</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>判定</span>
              <span className={`${styles.resultValue} ${categoryClass}`}>
                {result.category}
              </span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>適正体重（BMI 22）</span>
              <span className={styles.resultValue}>
                {result.idealWeight} kg
              </span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>普通体重の範囲</span>
              <span className={styles.resultValue}>
                {result.bmi18_5Weight} kg ~ {result.bmi25Weight} kg
              </span>
            </div>
          </div>
        </section>
      )}

      <div className={styles.disclaimer}>
        ※
        この結果は参考値です。医学的なアドバイスではありません。健康に関する判断は医療専門家にご相談ください。
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback, useId } from "react";
import { calculateBmi, getMeterPercent, type BmiResult } from "./logic";
import Input from "@/components/Input";
import ErrorMessage from "@/components/ErrorMessage";
import Button from "@/components/Button";
import styles from "./BmiCalculatorPage.module.css";

/** BMI レベルに応じた CSS クラスのマッピング */
const CATEGORY_CLASS_MAP: Record<number, string> = {
  0: styles.categoryLow,
  1: styles.categoryNormal,
  2: styles.categoryHigh1,
  3: styles.categoryHigh2,
  4: styles.categoryHigh3,
  5: styles.categoryHigh4,
};

/**
 * BmiCalculatorPage — BMI計算ツールの単一実装（フル機能のページ本体）。
 *
 * コピーボタン: なし（T-4b 確定: BMI値・判定区分は読んで知る対象）
 * ライブリージョン: role="status" aria-live="polite" + 実テキストノードのサマリ（C-3 準拠）
 */
export default function BmiCalculatorPage() {
  const heightId = useId();
  const weightId = useId();

  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [result, setResult] = useState<BmiResult | null>(null);
  const [error, setError] = useState<string>("");

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

  const categoryClass = result ? CATEGORY_CLASS_MAP[result.categoryLevel] : "";

  /** ライブリージョンに入れる実テキストノードのサマリ（C-3 準拠） */
  const liveSummary = result ? `BMI ${result.bmi}（${result.category}）` : "";

  return (
    <div className={styles.container}>
      {/* 入力フォーム */}
      <div className={styles.inputSection}>
        {/* 身長入力 */}
        <div className={styles.inputRow}>
          <label htmlFor={heightId} className={styles.inputLabel}>
            身長
          </label>
          <div className={styles.numberInputWrapper}>
            <Input
              id={heightId}
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="170"
              min="1"
              step="0.1"
              aria-label="身長（cm）"
            />
          </div>
          <span className={styles.unitLabel}>cm</span>
        </div>

        {/* 体重入力 */}
        <div className={styles.inputRow}>
          <label htmlFor={weightId} className={styles.inputLabel}>
            体重
          </label>
          <div className={styles.numberInputWrapper}>
            <Input
              id={weightId}
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="65"
              min="0.1"
              step="0.1"
              aria-label="体重（kg）"
            />
          </div>
          <span className={styles.unitLabel}>kg</span>
        </div>

        {/* 計算ボタン */}
        <div className={styles.inputRow}>
          <Button variant="primary" onClick={handleCalculate}>
            計算する
          </Button>
        </div>
      </div>

      {/* エラー表示（A-4: 日本語の ErrorMessage を使用） */}
      {error && <ErrorMessage message={error} />}

      {/* C-3: ライブリージョン（実テキストノードのサマリ）
       *   計算前は空文字、計算後はサマリテキストを入れてスクリーンリーダーに通知する */}
      <div role="status" aria-live="polite" aria-atomic="true">
        <span className={styles.resultSummary}>{liveSummary}</span>

        {/* 計算結果（ライブリージョン内に配置してスクリーンリーダーに通知） */}
        {result && (
          <>
            {/* BMI メーターグラフ */}
            <div
              className={styles.meter}
              role="img"
              aria-label={`BMI ${result.bmi} - ${result.category}`}
            >
              <div className={styles.meterTrack}>
                <div className={styles.meterZoneLow} />
                <div className={styles.meterZoneNormal} />
                <div className={styles.meterZoneWarning} />
                <div className={styles.meterZoneDanger} />
              </div>
              <div
                className={styles.meterIndicator}
                style={{ left: `${getMeterPercent(result.bmi)}%` }}
              />
              {/* 各ラベルを線形スケール上の正しい位置に absolute 配置する。
               *   端のラベル(10/50)はメーター端から溢れないよう左右基準で配置。
               *   中間のラベルは中央寄せ（translateX(-50%)）で正確な位置に表示。 */}
              <div className={styles.meterLabels}>
                <span
                  className={styles.meterLabelLeft}
                  style={{ left: `${getMeterPercent(10)}%` }}
                >
                  10
                </span>
                <span
                  className={styles.meterLabelCenter}
                  style={{ left: `${getMeterPercent(18.5)}%` }}
                >
                  18.5
                </span>
                <span
                  className={styles.meterLabelCenter}
                  style={{ left: `${getMeterPercent(25)}%` }}
                >
                  25
                </span>
                <span
                  className={styles.meterLabelCenter}
                  style={{ left: `${getMeterPercent(30)}%` }}
                >
                  30
                </span>
                <span
                  className={styles.meterLabelCenter}
                  style={{ left: `${getMeterPercent(40)}%` }}
                >
                  40
                </span>
                <span
                  className={styles.meterLabelRight}
                  style={{ right: `${100 - getMeterPercent(50)}%` }}
                >
                  50
                </span>
              </div>
            </div>

            {/* 計算結果テーブル */}
            <div className={styles.resultTable} aria-label="計算結果">
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
                  {result.bmi18_5Weight} kg ～ {result.bmi25Weight} kg
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 免責事項 */}
      <p className={styles.disclaimer}>
        ※
        この結果は参考値です。医学的なアドバイスではありません。健康に関する判断は医療専門家にご相談ください。
      </p>
    </div>
  );
}

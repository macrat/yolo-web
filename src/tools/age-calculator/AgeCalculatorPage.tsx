"use client";

import { useState, useCallback } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import ErrorMessage from "@/components/ErrorMessage";
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
import styles from "./AgeCalculatorPage.module.css";

/**
 * AgeCalculatorPage — 年齢計算ツール本体（単一実装）。
 *
 * 生年月日と基準日から年齢（年・月・日）、通算日数・月数、和暦、干支、星座を計算する。
 * 出力は読んで知る答えのため、T-4b 方針によりコピーボタンなし。
 *
 * C-3 準拠: live region（role="status" aria-live="polite"）には
 * 実テキストノードのサマリ（「XX歳 を計算しました」等）を配置する。
 * フォーム値は live region の外に出し、サマリで通知する設計とする。
 */
export default function AgeCalculatorPage() {
  const [birthDateStr, setBirthDateStr] = useState("");
  const [targetDateStr, setTargetDateStr] = useState(formatDate(new Date()));
  const [ageResult, setAgeResult] = useState<AgeResult | null>(null);
  const [warekiInfo, setWarekiInfo] = useState<WarekiInfo | null>(null);
  const [zodiac, setZodiac] = useState("");
  const [constellation, setConstellation] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  // C-3: ライブリージョン用サマリテキスト（実テキストノード）
  const [statusSummary, setStatusSummary] = useState("");

  const handleCalculate = useCallback(() => {
    setErrorMsg("");
    setAgeResult(null);
    setWarekiInfo(null);
    setZodiac("");
    setConstellation("");
    setStatusSummary("");

    const birthDate = parseDate(birthDateStr);
    const targetDate = parseDate(targetDateStr);

    if (!birthDate) {
      setErrorMsg("生年月日を入力してください");
      return;
    }
    if (!targetDate) {
      setErrorMsg("基準日を入力してください");
      return;
    }
    if (birthDate > targetDate) {
      setErrorMsg("生年月日は基準日より前の日付を入力してください");
      return;
    }

    const result = calculateAge(birthDate, targetDate);
    setAgeResult(result);

    const wareki = toWareki(birthDate);
    setWarekiInfo(wareki);

    setZodiac(getZodiac(birthDate.getFullYear()));
    setConstellation(
      getConstellation(birthDate.getMonth() + 1, birthDate.getDate()),
    );

    // C-3: 計算結果のサマリを実テキストノードとして live region に設定する
    setStatusSummary(
      `${result.years}歳${result.months}ヶ月${result.days}日 を計算しました`,
    );
  }, [birthDateStr, targetDateStr]);

  const handleSetToday = useCallback(() => {
    setTargetDateStr(formatDate(new Date()));
  }, []);

  return (
    <div className={styles.container}>
      {/* 入力エリア */}
      <div className={styles.formArea}>
        <div className={styles.field}>
          <label htmlFor="birth-date" className={styles.label}>
            生年月日
          </label>
          <Input
            id="birth-date"
            type="date"
            value={birthDateStr}
            onChange={(e) => setBirthDateStr(e.target.value)}
            aria-label="生年月日"
            aria-required="true"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="target-date" className={styles.label}>
            基準日
          </label>
          <div className={styles.targetDateRow}>
            <Input
              id="target-date"
              type="date"
              value={targetDateStr}
              onChange={(e) => setTargetDateStr(e.target.value)}
              aria-label="基準日"
              aria-required="true"
            />
            <Button size="small" onClick={handleSetToday}>
              今日に設定
            </Button>
          </div>
        </div>
        <div className={styles.actions}>
          <Button variant="primary" onClick={handleCalculate}>
            計算
          </Button>
        </div>
      </div>

      {/* エラー表示（A-4: 共通部品 ErrorMessage・日本語メッセージ） */}
      {errorMsg && <ErrorMessage message={errorMsg} />}

      {/* C-3: ライブリージョン — 実テキストノードのサマリを持つ */}
      <div role="status" aria-live="polite" aria-atomic="true">
        {statusSummary}
      </div>

      {/* 計算結果 */}
      {ageResult && (
        <section className={styles.resultSection} aria-label="年齢計算結果">
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
              <span className={styles.resultValue}>{warekiInfo.formatted}</span>
            </div>
          )}
          {zodiac && (
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>干支</span>
              <span className={styles.resultValue}>{zodiac}</span>
            </div>
          )}
          {constellation && (
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>星座</span>
              <span className={styles.resultValue}>{constellation}</span>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

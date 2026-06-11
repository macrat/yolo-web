"use client";

/**
 * AgeCalculatorTile — 年齢計算の単一正典タイル
 *
 * cycle-228 T-7: AgeCalculatorPage.tsx を Panel ルートのタイルへ作り直したもの。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>。外部ラッパーなし。
 * - **variant は full のみ**: 生年月日入力のロジックは独立モードを持たないため、
 *   フルモード（生年月日+基準日+全結果）の1バリエーションのみ。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する。
 * - **logic.ts 共有エンジン**: calculateAge/toWareki/getZodiacWithReading/getConstellation
 *   が唯一のロジック源。改変禁止。
 *
 * ## variant
 *
 * - `"full"` (デフォルト・唯一の値): 生年月日+基準日入力と年齢・和暦・干支・星座等の全結果を表示。
 *   ロジックに独立モードがないため、full のみで良い。
 *
 * ## 使い方
 *
 * ```tsx
 * // 道具箱や詳細ページから同一エクスポートを描画する（同一性の構造的保証）
 * <AgeCalculatorTile variant="full" />
 * ```
 *
 * ## アクセシビリティ（C-3 準拠）
 *
 * - role="status" aria-live="polite" の div にサマリテキストを置く
 * - サマリは srOnly で視覚的には非表示にしてスクリーンリーダーへ通知する
 * - フォーム値は live region の外に出し、サマリで通知する設計とする
 */

import { useId, useState, useCallback } from "react";
import Panel from "@/components/Panel";
import Input from "@/components/Input";
import Button from "@/components/Button";
import ErrorMessage from "@/components/ErrorMessage";
import {
  calculateAge,
  toWareki,
  getZodiacWithReading,
  getConstellation,
  formatDate,
  parseDate,
  type AgeResult,
  type WarekiInfo,
} from "./logic";
import styles from "./AgeCalculatorTile.module.css";

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type AgeCalculatorTileVariant = "full";

export interface AgeCalculatorTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": 生年月日+基準日入力と年齢・和暦・干支・星座等の全結果を表示
   *   ロジックに独立モードがないため、full のみで良い。
   */
  variant?: AgeCalculatorTileVariant;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

export default function AgeCalculatorTile({
  variant = "full",
  as = "section",
  className,
}: AgeCalculatorTileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合防止） ----------
  const uid = useId();
  const birthDateId = `${uid}-birth-date`;
  const targetDateId = `${uid}-target-date`;

  // ---------- State ----------
  const [birthDateStr, setBirthDateStr] = useState("");
  const [targetDateStr, setTargetDateStr] = useState(formatDate(new Date()));
  const [ageResult, setAgeResult] = useState<AgeResult | null>(null);
  const [warekiInfo, setWarekiInfo] = useState<WarekiInfo | null>(null);
  const [zodiac, setZodiac] = useState("");
  const [constellation, setConstellation] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  // C-3: ライブリージョン用サマリテキスト（実テキストノード）
  const [statusSummary, setStatusSummary] = useState("");

  // variant は現在 full のみだが、将来の拡張に備えて参照しておく
  void variant;

  // ---------- ハンドラ ----------
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

    setZodiac(getZodiacWithReading(birthDate.getFullYear()));
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

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）
  return (
    <Panel as={as} className={className}>
      {/* 入力エリア */}
      <div className={styles.formArea}>
        <div className={styles.field}>
          <label htmlFor={birthDateId} className={styles.label}>
            生年月日
          </label>
          <Input
            id={birthDateId}
            type="date"
            value={birthDateStr}
            onChange={(e) => setBirthDateStr(e.target.value)}
            aria-label="生年月日"
            aria-required="true"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor={targetDateId} className={styles.label}>
            基準日
          </label>
          <div className={styles.targetDateRow}>
            <Input
              id={targetDateId}
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

      {/* C-3: ライブリージョン — 実テキストノードのサマリを持つ
           srOnly でスクリーンリーダーにのみ読み上げ・画面上の重複表示を防ぐ */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={styles.srOnly}
      >
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
    </Panel>
  );
}

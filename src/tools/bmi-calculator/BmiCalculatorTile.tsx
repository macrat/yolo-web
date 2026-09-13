"use client";

/**
 * BmiCalculatorTile — BMI計算の単一正典タイル
 *
 * cycle-228 T-6: BmiCalculatorPage.tsx を Panel ルートのタイルへ作り直したもの。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>。外部ラッパーなし。
 * - **1ツール 1 タイル = variant full のみ**: BMI計算は独立した compact モードが
 *   成立しないため、full のみの variant 設計とする（作業指示 §3 に従う）。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する。
 * - **logic.ts 共有エンジン**: calculateBmi / getMeterPercent / getTargetWeight が
 *   唯一のロジック源。改変禁止。
 *
 * ## variant
 *
 * - `"full"` (デフォルト・唯一): 身長・体重入力 + BMI値 + メーター + カテゴリ + 目標体重の全機能。
 *   BMI計算は独立した compact モードが成立しないため、full のみとする。
 *
 * ## 使い方
 *
 * ```tsx
 * // 道具箱や詳細ページから同一エクスポートを描画する（同一性の構造的保証）
 * <BmiCalculatorTile variant="full" />
 * ```
 *
 * ## アクセシビリティ（C-3 準拠）
 *
 * - role="status" aria-live="polite" の div にサマリテキストを置く
 *   （計算結果はライブリージョン内に配置してスクリーンリーダーに通知）
 * - BMI メーターには role="img" + aria-label を付与
 */

import { useState, useCallback, useId } from "react";
import Panel from "@/components/Panel";
import { calculateBmi, getMeterPercent, type BmiResult } from "./logic";
import Input from "@/components/Input";
import ErrorMessage from "@/components/ErrorMessage";
import Button from "@/components/Button";
import styles from "./BmiCalculatorTile.module.css";

/** BMI レベルに応じた CSS クラスのマッピング */
const CATEGORY_CLASS_MAP: Record<number, string> = {
  0: styles.categoryLow,
  1: styles.categoryNormal,
  2: styles.categoryHigh1,
  3: styles.categoryHigh2,
  4: styles.categoryHigh3,
  5: styles.categoryHigh4,
};

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type BmiCalculatorTileVariant = "full";

export interface BmiCalculatorTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": 身長・体重入力 + BMI値 + メーター + カテゴリ + 目標体重の全機能
   *   BMI計算はコンパクトモードが成立しないため full のみ。
   */
  variant?: BmiCalculatorTileVariant;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

/**
 * BmiCalculatorTile — BMI計算ツールの単一実装（全機能のタイル）。
 *
 * コピーボタン: なし（T-4b 確定: BMI値・判定区分は読んで知る対象）
 * ライブリージョン: role="status" aria-live="polite" + 実テキストノードのサマリ（C-3 準拠）
 */
export default function BmiCalculatorTile({
  variant = "full",
  as = "section",
  className,
}: BmiCalculatorTileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合防止） ----------
  const uid = useId();
  const heightId = `${uid}-height`;
  const weightId = `${uid}-weight`;

  // variant は将来の拡張に備えて受け取るが、現在は full のみ
  void variant;

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

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）
  return (
    <Panel as={as} className={className}>
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
    </Panel>
  );
}

"use client";

/**
 * DateCalculatorTile — 日付計算の単一正典タイル
 *
 * cycle-228 T-21: DateCalculatorPage.tsx を Panel ルートのタイルへ作り直し。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>。外部ラッパーなし。
 * - **1ツール n タイル = variant**: full / diff / add / wareki は同一コンポーネントの
 *   設定差で表現。別実装を作らない（分裂ゼロ）。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない（8個超の hardcoded id を移行）。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する。
 * - **logic.ts 共有エンジン**: dateDiff/addDays/toWareki/fromWareki が唯一のロジック源。
 *
 * ## variant
 *
 * - `"full"` (デフォルト): 3セクション全部（日付差分・加減算・和暦変換）を表示する。
 * - `"diff"`: 日付差分セクションのみを表示する。
 * - `"add"`: 日付加算・減算セクションのみを表示する。
 * - `"wareki"`: 和暦・西暦変換セクションのみを表示する。
 *
 * ## 使い方
 *
 * ```tsx
 * // 道具箱や詳細ページから同一エクスポートを描画する（同一性の構造的保証）
 * <DateCalculatorTile variant="full" />
 * <DateCalculatorTile variant="diff" />
 * <DateCalculatorTile variant="add" />
 * <DateCalculatorTile variant="wareki" />
 * ```
 *
 * ## アクセシビリティ（C-3 準拠）
 *
 * - 各計算結果に role="status" aria-live="polite" のライブリージョン＋実テキストのサマリ
 * - すべての入力フォームは useId ベースの id で label に関連付け
 */

import { useId, useState, useCallback } from "react";
import Panel from "@/components/Panel";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
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
import styles from "./DateCalculatorTile.module.css";

const ERA_OPTIONS = ["令和", "平成", "昭和", "大正", "明治"] as const;

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type DateCalculatorTileVariant = "full" | "diff" | "add" | "wareki";

export interface DateCalculatorTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": 3セクション全部（日付差分・加減算・和暦変換）を表示する
   * - "diff": 日付差分セクションのみを表示する
   * - "add": 日付加算・減算セクションのみを表示する
   * - "wareki": 和暦・西暦変換セクションのみを表示する
   */
  variant?: DateCalculatorTileVariant;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

export default function DateCalculatorTile({
  variant = "full",
  as = "section",
  className,
}: DateCalculatorTileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合防止） ----------
  // 旧実装の hardcoded id（date1/date2/base-date/days-to-add/wareki-date/
  // era-select/era-year/era-month/era-day）をすべて useId ベースに移行。
  const uid = useId();
  const date1Id = `${uid}-date1`;
  const date2Id = `${uid}-date2`;
  const baseDateId = `${uid}-base-date`;
  const daysToAddId = `${uid}-days-to-add`;
  const warekiDateId = `${uid}-wareki-date`;
  const eraSelectId = `${uid}-era-select`;
  const eraYearId = `${uid}-era-year`;
  const eraMonthId = `${uid}-era-month`;
  const eraDayId = `${uid}-era-day`;

  // ---------- セクション表示判定 ----------
  const showDiff = variant === "full" || variant === "diff";
  const showAdd = variant === "full" || variant === "add";
  const showWareki = variant === "full" || variant === "wareki";

  // ---------- Section 1: 日付差分 State ----------
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  const [diffResult, setDiffResult] = useState<DateDiffResult | null>(null);
  const [diffError, setDiffError] = useState("");
  const [diffStatus, setDiffStatus] = useState("");

  // ---------- Section 2: 日付加算・減算 State ----------
  const [baseDate, setBaseDate] = useState("");
  const [daysToAdd, setDaysToAdd] = useState(0);
  const [addResult, setAddResult] = useState<string>("");
  const [addResultDay, setAddResultDay] = useState<string>("");
  const [addStatus, setAddStatus] = useState("");

  // ---------- Section 3: 和暦変換 State ----------
  // 西暦→和暦
  const [warekiDate, setWarekiDate] = useState("");
  const [warekiResult, setWarekiResult] = useState<WarekiResult | null>(null);
  const [warekiStatus, setWarekiStatus] = useState("");
  // 和暦→西暦
  const [warekiEra, setWarekiEra] = useState<string>("令和");
  const [warekiYear, setWarekiYear] = useState(1);
  const [warekiMonth, setWarekiMonth] = useState(1);
  const [warekiDay, setWarekiDay] = useState(1);
  const [fromWarekiResult, setFromWarekiResult] = useState<string>("");
  const [fromWarekiError, setFromWarekiError] = useState("");
  const [fromWarekiStatus, setFromWarekiStatus] = useState("");

  // ---------- Section 1: 差分計算ハンドラ ----------
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

  // ---------- Section 2: 加算ハンドラ ----------
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

  // ---------- Section 3: 西暦→和暦ハンドラ ----------
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

  // ---------- Section 3: 和暦→西暦ハンドラ ----------
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

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）
  return (
    <Panel as={as} className={className}>
      {/* Section 1: 日付の差分 */}
      {showDiff && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>日付の差分</h3>
          <div className={styles.row}>
            <label htmlFor={date1Id} className={styles.srOnly}>
              日付1
            </label>
            <Input
              id={date1Id}
              type="date"
              value={date1}
              onChange={(e) => setDate1(e.target.value)}
              aria-label="日付1"
            />
            <span className={styles.separator} aria-hidden="true">
              から
            </span>
            <label htmlFor={date2Id} className={styles.srOnly}>
              日付2
            </label>
            <Input
              id={date2Id}
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
      )}

      {/* Section 2: 日付の加算・減算 */}
      {showAdd && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>日付の加算・減算</h3>
          <div className={styles.row}>
            <label htmlFor={baseDateId} className={styles.srOnly}>
              基準日
            </label>
            <Input
              id={baseDateId}
              type="date"
              value={baseDate}
              onChange={(e) => setBaseDate(e.target.value)}
              aria-label="基準日"
            />
            <label htmlFor={daysToAddId} className={styles.srOnly}>
              日数
            </label>
            <Input
              id={daysToAddId}
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
      )}

      {/* Section 3: 和暦・西暦変換 */}
      {showWareki && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>和暦・西暦変換</h3>

          {/* 西暦→和暦 */}
          <div className={styles.subSection}>
            <p className={styles.subLabel}>西暦 → 和暦</p>
            <div className={styles.row}>
              <label htmlFor={warekiDateId} className={styles.srOnly}>
                西暦→和暦 日付入力
              </label>
              <Input
                id={warekiDateId}
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
              <label htmlFor={eraSelectId} className={styles.srOnly}>
                元号
              </label>
              <Select
                id={eraSelectId}
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
              <label htmlFor={eraYearId} className={styles.srOnly}>
                元号年
              </label>
              <Input
                id={eraYearId}
                type="number"
                className={styles.shortNumberInput}
                value={String(warekiYear)}
                min={1}
                onChange={(e) =>
                  setWarekiYear(parseInt(e.target.value, 10) || 1)
                }
                aria-label="元号年"
              />
              <span className={styles.unit} aria-hidden="true">
                年
              </span>
              <label htmlFor={eraMonthId} className={styles.srOnly}>
                月
              </label>
              <Input
                id={eraMonthId}
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
              <label htmlFor={eraDayId} className={styles.srOnly}>
                日
              </label>
              <Input
                id={eraDayId}
                type="number"
                className={styles.shortNumberInput}
                value={String(warekiDay)}
                min={1}
                max={31}
                onChange={(e) =>
                  setWarekiDay(parseInt(e.target.value, 10) || 1)
                }
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
      )}
    </Panel>
  );
}

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getCurrentTimestamp,
  timestampToDate,
  dateToTimestamp,
  type TimestampConversion,
} from "./logic";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import Button from "@/components/Button";
import ErrorMessage from "@/components/ErrorMessage";
import Input from "@/components/Input";
import SegmentedControl from "@/components/SegmentedControl";
import styles from "./UnixTimestampPage.module.css";

/** タイムスタンプ単位の選択肢 */
const UNIT_OPTIONS = [
  { label: "秒", value: "seconds" },
  { label: "ミリ秒", value: "milliseconds" },
];

/**
 * UnixTimestampPage — UNIXタイムスタンプと日時の相互変換の単一実装。
 *
 * 機能:
 * - 現在のUNIXタイムスタンプの1秒ごとリアルタイム表示 + コピー
 * - タイムスタンプ → 日時変換（秒/ミリ秒切り替え）
 * - 日時 → タイムスタンプ変換
 * - 各結果のコピー（useCopyToClipboard）
 * - エラー表示（ErrorMessage）
 *
 * 設計方針:
 * - Hydration一致: SSR/CSR で Date.now() が異なるため、現在時刻は useEffect 内でのみ初期化
 *   (AP-I11対応: タイマーIDをuseRefで保持し、cleanup で clearInterval)
 * - ARIA C-3: role="status" aria-live="polite" の実テキストサマリで動的通知
 * - T-4b: unix-timestamp はコピーボタンあり確定
 * - SegmentedControl で秒/ミリ秒を切り替え（旧チェックボックスを置き換え）
 */
export default function UnixTimestampPage() {
  // hydration一致のため初期値は0。useEffect内で実値を設定する
  const [currentTs, setCurrentTs] = useState(0);
  const [mounted, setMounted] = useState(false);

  // タイムスタンプ → 日時
  const [tsInput, setTsInput] = useState("");
  const [tsUnit, setTsUnit] = useState<"seconds" | "milliseconds">("seconds");
  const [tsResult, setTsResult] = useState<TimestampConversion | null>(null);
  const [tsError, setTsError] = useState("");
  const [tsStatusSummary, setTsStatusSummary] = useState("");

  // 日時 → タイムスタンプ
  // hydration一致のため初期値は固定値。useEffect 内でマウント後に現在日時を設定
  const [year, setYear] = useState(2000);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [dateResult, setDateResult] = useState<{
    seconds: number;
    milliseconds: number;
  } | null>(null);
  const [dateStatusSummary, setDateStatusSummary] = useState("");

  // AP-I11: タイマーIDをrefで保持
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // T-4b: コピーあり確定。useCopyToClipboard フックを使用（独自実装しない）
  const { copy, copiedKey } = useCopyToClipboard();

  // マウント後に現在時刻を設定し、1秒ごとに更新
  // AP-I11: useEffect のcleanup でclearIntervalを呼ぶ
  // docs/knowledge/nextjs.md §4 OK パターン: 空依存 = マウント時1回の外部システム読み取り
  useEffect(() => {
    // SSR/CSR の hydration 一致のため、Date.now() は useEffect 内でのみ読み取る
    /* eslint-disable react-hooks/set-state-in-effect */
    setCurrentTs(getCurrentTimestamp());
    setMounted(true);

    // 日時 → タイムスタンプの初期値を現在日時で設定（hydration一致のためここで設定）
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
    setDay(now.getDate());
    setHours(now.getHours());
    setMinutes(now.getMinutes());
    setSeconds(0);
    /* eslint-enable react-hooks/set-state-in-effect */

    intervalRef.current = setInterval(() => {
      setCurrentTs(getCurrentTimestamp());
    }, 1000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const handleTimestampConvert = useCallback(() => {
    setTsError("");
    setTsStatusSummary("");
    const num = parseInt(tsInput, 10);
    if (isNaN(num)) {
      setTsError("有効な数値を入力してください");
      setTsResult(null);
      return;
    }
    const isMs = tsUnit === "milliseconds";
    const result = timestampToDate(num, isMs);
    if (!result) {
      setTsError("無効なタイムスタンプです");
      setTsResult(null);
      return;
    }
    setTsResult(result);
    // C-3: 実テキストサマリを role="status" に配置
    setTsStatusSummary("変換しました");
  }, [tsInput, tsUnit]);

  const handleUseNow = useCallback(() => {
    const now = getCurrentTimestamp();
    setTsInput(String(now));
    setTsUnit("seconds");
    const result = timestampToDate(now);
    setTsResult(result);
    setTsError("");
    // C-3: 実テキストサマリを role="status" に配置
    setTsStatusSummary("現在時刻を変換しました");
  }, []);

  const handleDateConvert = useCallback(() => {
    setDateStatusSummary("");
    const result = dateToTimestamp(year, month, day, hours, minutes, seconds);
    setDateResult(result);
    if (result) {
      // C-3: 実テキストサマリを role="status" に配置
      setDateStatusSummary("変換しました");
    }
  }, [year, month, day, hours, minutes, seconds]);

  return (
    <div className={styles.container}>
      {/* 現在のUNIXタイムスタンプ（ライブ表示） */}
      <div className={styles.currentBar}>
        <span className={styles.currentLabel}>現在のUNIXタイムスタンプ:</span>
        {/* mounted前は空白を表示してhydrationを一致させる */}
        <code className={styles.currentValue}>{mounted ? currentTs : ""}</code>
        {/* T-4b: コピーボタンあり。現在タイムスタンプをコピー */}
        <Button
          size="small"
          disabled={!mounted || currentTs === 0}
          onClick={() => copy(String(currentTs), "current")}
          aria-label={
            copiedKey === "current"
              ? COPIED_LABEL
              : "現在のタイムスタンプをコピー"
          }
        >
          {copiedKey === "current" ? COPIED_LABEL : "コピー"}
        </Button>
      </div>

      {/* ---- セクション1: タイムスタンプ → 日時 ---- */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>タイムスタンプ → 日時</h2>

        <div className={styles.tsInputRow}>
          <Input
            type="text"
            className={styles.tsInput}
            value={tsInput}
            onChange={(e) => setTsInput(e.target.value)}
            placeholder="UNIXタイムスタンプを入力..."
            aria-label="UNIXタイムスタンプ"
            inputMode="numeric"
          />
          <SegmentedControl
            options={UNIT_OPTIONS}
            value={tsUnit}
            onChange={(v) => setTsUnit(v as "seconds" | "milliseconds")}
            aria-label="タイムスタンプ単位"
          />
        </div>

        <div className={styles.buttonRow}>
          <Button variant="primary" onClick={handleTimestampConvert}>
            変換
          </Button>
          <Button onClick={handleUseNow}>現在時刻を使用</Button>
        </div>

        {/* エラー表示 */}
        {tsError && <ErrorMessage message={tsError} />}

        {/* C-3: スクリーンリーダー向けサマリ（実テキストノード） */}
        <div
          role="status"
          aria-live="polite"
          aria-label="タイムスタンプ変換結果サマリ"
          className={styles.srOnly}
        >
          {tsStatusSummary}
        </div>

        {/* 変換結果 */}
        {tsResult && (
          <div className={styles.resultTable} aria-label="変換結果">
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>ローカル時刻</span>
              <code className={styles.resultValue}>{tsResult.localString}</code>
              <Button
                size="small"
                disabled={!tsResult.localString}
                onClick={() => copy(tsResult.localString, "local")}
                aria-label={
                  copiedKey === "local" ? COPIED_LABEL : "ローカル時刻をコピー"
                }
              >
                {copiedKey === "local" ? COPIED_LABEL : "コピー"}
              </Button>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>UTC</span>
              <code className={styles.resultValue}>{tsResult.utcString}</code>
              <Button
                size="small"
                disabled={!tsResult.utcString}
                onClick={() => copy(tsResult.utcString, "utc")}
                aria-label={copiedKey === "utc" ? COPIED_LABEL : "UTCをコピー"}
              >
                {copiedKey === "utc" ? COPIED_LABEL : "コピー"}
              </Button>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>ISO 8601</span>
              <code className={styles.resultValue}>{tsResult.isoString}</code>
              <Button
                size="small"
                disabled={!tsResult.isoString}
                onClick={() => copy(tsResult.isoString, "iso")}
                aria-label={
                  copiedKey === "iso" ? COPIED_LABEL : "ISO 8601をコピー"
                }
              >
                {copiedKey === "iso" ? COPIED_LABEL : "コピー"}
              </Button>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>秒</span>
              <code className={styles.resultValue}>{tsResult.seconds}</code>
              <Button
                size="small"
                disabled={tsResult.seconds === undefined}
                onClick={() => copy(String(tsResult.seconds), "tsSeconds")}
                aria-label={
                  copiedKey === "tsSeconds" ? COPIED_LABEL : "秒をコピー"
                }
              >
                {copiedKey === "tsSeconds" ? COPIED_LABEL : "コピー"}
              </Button>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>ミリ秒</span>
              <code className={styles.resultValue}>
                {tsResult.milliseconds}
              </code>
              <Button
                size="small"
                disabled={tsResult.milliseconds === undefined}
                onClick={() => copy(String(tsResult.milliseconds), "tsMs")}
                aria-label={
                  copiedKey === "tsMs" ? COPIED_LABEL : "ミリ秒をコピー"
                }
              >
                {copiedKey === "tsMs" ? COPIED_LABEL : "コピー"}
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* ---- セクション2: 日時 → タイムスタンプ ---- */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>日時 → タイムスタンプ</h2>

        <div className={styles.dateInputs}>
          <div className={styles.dateField}>
            <label htmlFor="ts-year" className={styles.dateFieldLabel}>
              年
            </label>
            <Input
              id="ts-year"
              type="number"
              className={styles.dateInput}
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10) || 0)}
              aria-label="年"
            />
          </div>
          <div className={styles.dateField}>
            <label htmlFor="ts-month" className={styles.dateFieldLabel}>
              月
            </label>
            <Input
              id="ts-month"
              type="number"
              className={styles.dateInput}
              value={month}
              min={1}
              max={12}
              onChange={(e) => setMonth(parseInt(e.target.value, 10) || 1)}
              aria-label="月"
            />
          </div>
          <div className={styles.dateField}>
            <label htmlFor="ts-day" className={styles.dateFieldLabel}>
              日
            </label>
            <Input
              id="ts-day"
              type="number"
              className={styles.dateInput}
              value={day}
              min={1}
              max={31}
              onChange={(e) => setDay(parseInt(e.target.value, 10) || 1)}
              aria-label="日"
            />
          </div>
          <div className={styles.dateField}>
            <label htmlFor="ts-hours" className={styles.dateFieldLabel}>
              時
            </label>
            <Input
              id="ts-hours"
              type="number"
              className={styles.dateInput}
              value={hours}
              min={0}
              max={23}
              onChange={(e) => setHours(parseInt(e.target.value, 10) || 0)}
              aria-label="時"
            />
          </div>
          <div className={styles.dateField}>
            <label htmlFor="ts-minutes" className={styles.dateFieldLabel}>
              分
            </label>
            <Input
              id="ts-minutes"
              type="number"
              className={styles.dateInput}
              value={minutes}
              min={0}
              max={59}
              onChange={(e) => setMinutes(parseInt(e.target.value, 10) || 0)}
              aria-label="分"
            />
          </div>
          <div className={styles.dateField}>
            <label htmlFor="ts-seconds" className={styles.dateFieldLabel}>
              秒
            </label>
            <Input
              id="ts-seconds"
              type="number"
              className={styles.dateInput}
              value={seconds}
              min={0}
              max={59}
              onChange={(e) => setSeconds(parseInt(e.target.value, 10) || 0)}
              aria-label="秒"
            />
          </div>
        </div>

        <div className={styles.buttonRow}>
          <Button variant="primary" onClick={handleDateConvert}>
            変換
          </Button>
        </div>

        {/* C-3: スクリーンリーダー向けサマリ（実テキストノード） */}
        <div
          role="status"
          aria-live="polite"
          aria-label="日時変換結果サマリ"
          className={styles.srOnly}
        >
          {dateStatusSummary}
        </div>

        {/* 変換結果 */}
        {dateResult && (
          <div className={styles.resultTable} aria-label="日時変換結果">
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>秒</span>
              <code className={styles.resultValue}>{dateResult.seconds}</code>
              <Button
                size="small"
                disabled={dateResult.seconds === undefined}
                onClick={() => copy(String(dateResult.seconds), "dateSec")}
                aria-label={
                  copiedKey === "dateSec" ? COPIED_LABEL : "秒をコピー"
                }
              >
                {copiedKey === "dateSec" ? COPIED_LABEL : "コピー"}
              </Button>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>ミリ秒</span>
              <code className={styles.resultValue}>
                {dateResult.milliseconds}
              </code>
              <Button
                size="small"
                disabled={dateResult.milliseconds === undefined}
                onClick={() => copy(String(dateResult.milliseconds), "dateMs")}
                aria-label={
                  copiedKey === "dateMs" ? COPIED_LABEL : "ミリ秒をコピー"
                }
              >
                {copiedKey === "dateMs" ? COPIED_LABEL : "コピー"}
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

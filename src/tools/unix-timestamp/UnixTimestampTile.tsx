"use client";

/**
 * UnixTimestampTile — UNIXタイムスタンプと日時を相互に変換する道具。最上位の要素が Panel で、
 * 道具の詳細ページがこのまま描く。
 *
 * - いまの時刻を1秒ごとに刻んで表示し、止める・動かすのボタンで刻みを止められる（DESIGN.md §11）。
 *   見出しは値の日時をいつも言い、数字と一緒に刻んで一緒に止まるので、写す前に値がいつのものかが
 *   分かる。`prefers-reduced-motion: reduce` のときは止めた状態で始まる。刻む表示は読み上げの
 *   ライブリージョンに入れない。
 * - いまの時刻と日時の入力欄の初期値は、サーバーの HTML と食い違わないよう、マウントしてから入れる。
 * - 同じページに2つ置いても id が重ならないよう、欄の id は useId から作る。
 */
import { useId, useState, useEffect, useCallback } from "react";
import Panel from "@/components/Panel";
import Button from "@/components/Button";
import ErrorMessage from "@/components/ErrorMessage";
import Input from "@/components/Input";
import RadioGroup from "@/components/RadioGroup";
import CopyButton from "@/components/CopyButton";
import {
  getCurrentTimestamp,
  timestampToDate,
  dateToTimestamp,
  type TimestampConversion,
} from "./logic";
import styles from "./UnixTimestampTile.module.css";

/** タイムスタンプ単位の選択肢 */
const UNIT_OPTIONS = [
  { label: "秒", value: "seconds" },
  { label: "ミリ秒", value: "milliseconds" },
];

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type UnixTimestampTileVariant = "full";

export interface UnixTimestampTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": 3セクション全部（ライブ表示・TS→日付・日付→TS）
   *   ロジックに独立モードがないため、full のみで良い。
   */
  variant?: UnixTimestampTileVariant;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

export default function UnixTimestampTile({
  variant = "full",
  as = "section",
  className,
}: UnixTimestampTileProps = {}) {
  const uid = useId();
  const yearId = `${uid}-year`;
  const monthId = `${uid}-month`;
  const dayId = `${uid}-day`;
  const hoursId = `${uid}-hours`;
  const minutesId = `${uid}-minutes`;
  const secondsId = `${uid}-seconds`;

  // 描き分けは "full" の1つだけなので、variant は受け取るだけで描き方を変えない。
  void variant;

  // いまの時刻。サーバーの HTML と食い違わないよう 0 で始め、マウントしてから入れる。
  const [currentTs, setCurrentTs] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [ticking, setTicking] = useState(true);

  const [tsInput, setTsInput] = useState("");
  const [tsUnit, setTsUnit] = useState<"seconds" | "milliseconds">("seconds");
  const [tsResult, setTsResult] = useState<TimestampConversion | null>(null);
  const [tsError, setTsError] = useState("");
  const [tsStatusSummary, setTsStatusSummary] = useState("");

  // 日時の入力欄。いまの時刻と同じく、固定の値で始めてマウントしてから今日の日時を入れる。
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

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setCurrentTs(getCurrentTimestamp());
    setMounted(true);
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTicking(false);
    }

    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
    setDay(now.getDate());
    setHours(now.getHours());
    setMinutes(now.getMinutes());
    setSeconds(0);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!ticking) return;
    const intervalId = setInterval(() => {
      setCurrentTs(getCurrentTimestamp());
    }, 1000);
    return () => clearInterval(intervalId);
  }, [ticking]);

  // 見出しで言う、表示している値のローカルの日時。
  const valueAt = mounted
    ? (timestampToDate(currentTs)?.localString ?? "")
    : "";

  const toggleTicking = useCallback(() => {
    if (!ticking) setCurrentTs(getCurrentTimestamp());
    setTicking(!ticking);
  }, [ticking]);

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
    setTsStatusSummary("変換しました");
  }, [tsInput, tsUnit]);

  const handleUseNow = useCallback(() => {
    const now = getCurrentTimestamp();
    setTsInput(String(now));
    setTsUnit("seconds");
    const result = timestampToDate(now);
    setTsResult(result);
    setTsError("");
    setTsStatusSummary("現在時刻を変換しました");
  }, []);

  const handleDateConvert = useCallback(() => {
    setDateStatusSummary("");
    const result = dateToTimestamp(year, month, day, hours, minutes, seconds);
    setDateResult(result);
    if (result) {
      setDateStatusSummary("変換しました");
    }
  }, [year, month, day, hours, minutes, seconds]);

  return (
    <Panel as={as} className={className}>
      {/* 刻み続ける表示なので、読み上げのライブリージョンに入れない。 */}
      <div className={styles.currentBar}>
        {/* 日時は「2026/09/26 18:40:47」の形。マウントするまでは同じ字数の見えない字で場所を取り、
            日時が入っても見出しの大きさが変わらないようにする。 */}
        <span className={styles.currentLabel}>
          {mounted ? (
            <span className={styles.valueAt}>{valueAt}</span>
          ) : (
            <span className={styles.valueAtPending}>0000/00/00 00:00:00</span>
          )}
          {"\u00a0の"}
          <wbr />
          <span className={styles.term}>
            UNIX
            <wbr />
            タイムスタンプ
          </span>
        </span>
        {/* マウントするまでは空にして、サーバーの HTML と揃える。 */}
        <code className={styles.currentValue}>{mounted ? currentTs : ""}</code>
        <div className={styles.currentActions}>
          <Button
            disabled={!mounted}
            onClick={toggleTicking}
            aria-label={
              ticking
                ? "タイムスタンプの刻みを止める"
                : "タイムスタンプの刻みを動かす"
            }
          >
            {ticking ? "止める" : "動かす"}
          </Button>
          <CopyButton
            text={String(currentTs)}
            target={
              ticking ? "現在のタイムスタンプ" : `${valueAt} のタイムスタンプ`
            }
            disabled={!mounted || currentTs === 0}
          />
        </div>
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
          <RadioGroup
            options={UNIT_OPTIONS}
            value={tsUnit}
            onChange={(v) => setTsUnit(v as "seconds" | "milliseconds")}
            legend="単位"
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

        {/* 変換したことを読み上げで伝える。 */}
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
              <CopyButton
                text={tsResult.localString}
                target="ローカル時刻"
                align="end"
                className={styles.resultCopy}
                disabled={!tsResult.localString}
              />
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>UTC</span>
              <code className={styles.resultValue}>{tsResult.utcString}</code>
              <CopyButton
                text={tsResult.utcString}
                target="UTC"
                align="end"
                className={styles.resultCopy}
                disabled={!tsResult.utcString}
              />
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>ISO 8601</span>
              <code className={styles.resultValue}>{tsResult.isoString}</code>
              <CopyButton
                text={tsResult.isoString}
                target="ISO 8601"
                align="end"
                className={styles.resultCopy}
                disabled={!tsResult.isoString}
              />
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>秒</span>
              <code className={styles.resultValue}>{tsResult.seconds}</code>
              <CopyButton
                text={String(tsResult.seconds)}
                target="秒"
                align="end"
                className={styles.resultCopy}
                disabled={tsResult.seconds === undefined}
              />
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>ミリ秒</span>
              <code className={styles.resultValue}>
                {tsResult.milliseconds}
              </code>
              <CopyButton
                text={String(tsResult.milliseconds)}
                target="ミリ秒"
                align="end"
                className={styles.resultCopy}
                disabled={tsResult.milliseconds === undefined}
              />
            </div>
          </div>
        )}
      </section>

      {/* ---- セクション2: 日時 → タイムスタンプ ---- */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>日時 → タイムスタンプ</h2>

        <div className={styles.dateInputs}>
          <div className={styles.dateField}>
            <label htmlFor={yearId} className={styles.dateFieldLabel}>
              年
            </label>
            <Input
              id={yearId}
              type="number"
              className={styles.dateInput}
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10) || 0)}
              aria-label="年"
            />
          </div>
          <div className={styles.dateField}>
            <label htmlFor={monthId} className={styles.dateFieldLabel}>
              月
            </label>
            <Input
              id={monthId}
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
            <label htmlFor={dayId} className={styles.dateFieldLabel}>
              日
            </label>
            <Input
              id={dayId}
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
            <label htmlFor={hoursId} className={styles.dateFieldLabel}>
              時
            </label>
            <Input
              id={hoursId}
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
            <label htmlFor={minutesId} className={styles.dateFieldLabel}>
              分
            </label>
            <Input
              id={minutesId}
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
            <label htmlFor={secondsId} className={styles.dateFieldLabel}>
              秒
            </label>
            <Input
              id={secondsId}
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

        {/* 変換したことを読み上げで伝える。 */}
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
              <CopyButton
                text={String(dateResult.seconds)}
                target="日時から求めた秒"
                align="end"
                className={styles.resultCopy}
                disabled={dateResult.seconds === undefined}
              />
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>ミリ秒</span>
              <code className={styles.resultValue}>
                {dateResult.milliseconds}
              </code>
              <CopyButton
                text={String(dateResult.milliseconds)}
                target="日時から求めたミリ秒"
                align="end"
                className={styles.resultCopy}
                disabled={dateResult.milliseconds === undefined}
              />
            </div>
          </div>
        )}
      </section>
    </Panel>
  );
}

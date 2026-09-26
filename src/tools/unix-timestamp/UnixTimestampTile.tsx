"use client";

/**
 * UnixTimestampTile — UNIXタイムスタンプと日時を相互に変換する道具。最上位の要素が Panel で、
 * 道具の詳細ページと道具箱のどちらからもこのまま描く。
 *
 * - いまの時刻を1秒ごとに刻んで表示し、止める・動かすのボタンで刻みを止められる（DESIGN.md §11）。
 *   止めているあいだは表示が書き換わらず、止めた値を写せる。`prefers-reduced-motion: reduce` の
 *   ときは止めた状態で始まる。刻む表示は読み上げのライブリージョンに入れない。
 * - いまの時刻と日時の入力欄の初期値は、サーバーの HTML と食い違わないよう、マウントしてから入れる。
 * - 同じページに2つ置いても id が重ならないよう、欄の id は useId から作る。
 */
import { useId, useState, useEffect, useCallback } from "react";
import Panel from "@/components/Panel";
import Button from "@/components/Button";
import ErrorMessage from "@/components/ErrorMessage";
import Input from "@/components/Input";
import RadioGroup from "@/components/RadioGroup";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
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

  const { copy, copiedKey } = useCopyToClipboard();

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
        <span className={styles.currentLabel}>
          {ticking ? "現在のUNIXタイムスタンプ:" : "止めたUNIXタイムスタンプ:"}
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
          <Button
            disabled={!mounted || currentTs === 0}
            onClick={() => copy(String(currentTs), "current")}
            aria-label={
              copiedKey === "current"
                ? COPIED_LABEL
                : ticking
                  ? "現在のタイムスタンプをコピー"
                  : "止めたタイムスタンプをコピー"
            }
          >
            {copiedKey === "current" ? COPIED_LABEL : "コピー"}
          </Button>
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
              <Button
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
              <Button
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
    </Panel>
  );
}

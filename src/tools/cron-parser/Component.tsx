"use client";

import { useState, useCallback } from "react";
import {
  parseCron,
  getNextExecutions,
  buildCronExpression,
  describeCronField,
} from "./logic";
import styles from "./Component.module.css";

type TabMode = "parser" | "builder";

interface Preset {
  label: string;
  expression: string;
}

const PRESETS: Preset[] = [
  { label: "毎分", expression: "* * * * *" },
  { label: "毎時", expression: "0 * * * *" },
  { label: "毎日9時", expression: "0 9 * * *" },
  { label: "平日9時", expression: "0 9 * * 1-5" },
  { label: "毎月1日", expression: "0 0 1 * *" },
];

export default function CronParserTool() {
  const [mode, setMode] = useState<TabMode>("parser");

  // Parser mode state
  const [cronInput, setCronInput] = useState("* * * * *");
  const [parseResult, setParseResult] = useState<ReturnType<
    typeof parseCron
  > | null>(null);
  const [nextExecs, setNextExecs] = useState<Date[]>([]);

  // Builder mode state
  const [bMinute, setBMinute] = useState("*");
  const [bHour, setBHour] = useState("*");
  const [bDayOfMonth, setBDayOfMonth] = useState("*");
  const [bMonth, setBMonth] = useState("*");
  const [bDayOfWeek, setBDayOfWeek] = useState("*");

  const handleParse = useCallback(() => {
    const result = parseCron(cronInput);
    setParseResult(result);
    if (result.valid) {
      const execs = getNextExecutions(cronInput, 5);
      setNextExecs(execs);
    } else {
      setNextExecs([]);
    }
  }, [cronInput]);

  const handlePreset = useCallback((expression: string) => {
    setCronInput(expression);
    const result = parseCron(expression);
    setParseResult(result);
    if (result.valid) {
      const execs = getNextExecutions(expression, 5);
      setNextExecs(execs);
    } else {
      setNextExecs([]);
    }
  }, []);

  const builtExpression = buildCronExpression(
    bMinute,
    bHour,
    bDayOfMonth,
    bMonth,
    bDayOfWeek,
  );
  const builtResult = parseCron(builtExpression);

  const handleCopyBuilt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(builtExpression);
    } catch {
      // Clipboard API not available
    }
  }, [builtExpression]);

  const formatDate = (date: Date): string => {
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabs} role="tablist" aria-label="モード切替">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "parser"}
          className={`${styles.tab} ${mode === "parser" ? styles.tabActive : ""}`}
          onClick={() => setMode("parser")}
        >
          解析
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "builder"}
          className={`${styles.tab} ${mode === "builder" ? styles.tabActive : ""}`}
          onClick={() => setMode("builder")}
        >
          ビルダー
        </button>
      </div>

      {mode === "parser" && (
        <>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Cron式を入力</h3>
            <div className={styles.row}>
              <input
                type="text"
                className={styles.cronInput}
                value={cronInput}
                onChange={(e) => setCronInput(e.target.value)}
                placeholder="* * * * *"
                aria-label="Cron式入力"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleParse();
                }}
              />
              <button
                type="button"
                onClick={handleParse}
                className={styles.button}
              >
                解析
              </button>
            </div>
            <div className={styles.presetRow}>
              {PRESETS.map((preset) => (
                <button
                  key={preset.expression}
                  type="button"
                  className={styles.presetButton}
                  onClick={() => handlePreset(preset.expression)}
                  aria-label={`プリセット: ${preset.label}`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </section>

          {parseResult && !parseResult.valid && (
            <div className={styles.error} role="alert">
              {parseResult.error}
            </div>
          )}

          {parseResult && parseResult.valid && (
            <>
              <div
                className={styles.description}
                role="region"
                aria-label="Cron式の説明"
              >
                {parseResult.description}
              </div>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>フィールド詳細</h3>
                <div className={styles.resultTable}>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>分</span>
                    <code className={styles.resultValue}>
                      {parseResult.minute.raw}
                    </code>
                    <span>{parseResult.minute.description}</span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>時</span>
                    <code className={styles.resultValue}>
                      {parseResult.hour.raw}
                    </code>
                    <span>{parseResult.hour.description}</span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>日</span>
                    <code className={styles.resultValue}>
                      {parseResult.dayOfMonth.raw}
                    </code>
                    <span>{parseResult.dayOfMonth.description}</span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>月</span>
                    <code className={styles.resultValue}>
                      {parseResult.month.raw}
                    </code>
                    <span>{parseResult.month.description}</span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>曜日</span>
                    <code className={styles.resultValue}>
                      {parseResult.dayOfWeek.raw}
                    </code>
                    <span>{parseResult.dayOfWeek.description}</span>
                  </div>
                </div>
              </section>

              {nextExecs.length > 0 && (
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>次回実行予定</h3>
                  <ul
                    className={styles.executionList}
                    aria-label="次回実行予定一覧"
                  >
                    {nextExecs.map((date, i) => (
                      <li key={i} className={styles.executionItem}>
                        {formatDate(date)}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </>
      )}

      {mode === "builder" && (
        <>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Cron式ビルダー</h3>
            <div className={styles.presetRow}>
              {PRESETS.map((preset) => {
                const fields = preset.expression.split(" ");
                return (
                  <button
                    key={preset.expression}
                    type="button"
                    className={styles.presetButton}
                    onClick={() => {
                      setBMinute(fields[0]);
                      setBHour(fields[1]);
                      setBDayOfMonth(fields[2]);
                      setBMonth(fields[3]);
                      setBDayOfWeek(fields[4]);
                    }}
                    aria-label={`プリセット: ${preset.label}`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
            <div className={styles.fieldGrid}>
              <div>
                <div className={styles.fieldLabel}>
                  分 (0-59){" "}
                  <span title={describeCronField(bMinute, "minute")}>
                    - {describeCronField(bMinute, "minute")}
                  </span>
                </div>
                <input
                  type="text"
                  className={styles.fieldInput}
                  value={bMinute}
                  onChange={(e) => setBMinute(e.target.value)}
                  aria-label="分フィールド"
                />
              </div>
              <div>
                <div className={styles.fieldLabel}>
                  時 (0-23){" "}
                  <span title={describeCronField(bHour, "hour")}>
                    - {describeCronField(bHour, "hour")}
                  </span>
                </div>
                <input
                  type="text"
                  className={styles.fieldInput}
                  value={bHour}
                  onChange={(e) => setBHour(e.target.value)}
                  aria-label="時フィールド"
                />
              </div>
              <div>
                <div className={styles.fieldLabel}>
                  日 (1-31){" "}
                  <span title={describeCronField(bDayOfMonth, "dayOfMonth")}>
                    - {describeCronField(bDayOfMonth, "dayOfMonth")}
                  </span>
                </div>
                <input
                  type="text"
                  className={styles.fieldInput}
                  value={bDayOfMonth}
                  onChange={(e) => setBDayOfMonth(e.target.value)}
                  aria-label="日フィールド"
                />
              </div>
              <div>
                <div className={styles.fieldLabel}>
                  月 (1-12){" "}
                  <span title={describeCronField(bMonth, "month")}>
                    - {describeCronField(bMonth, "month")}
                  </span>
                </div>
                <input
                  type="text"
                  className={styles.fieldInput}
                  value={bMonth}
                  onChange={(e) => setBMonth(e.target.value)}
                  aria-label="月フィールド"
                />
              </div>
              <div>
                <div className={styles.fieldLabel}>
                  曜日 (0-7){" "}
                  <span title={describeCronField(bDayOfWeek, "dayOfWeek")}>
                    - {describeCronField(bDayOfWeek, "dayOfWeek")}
                  </span>
                </div>
                <input
                  type="text"
                  className={styles.fieldInput}
                  value={bDayOfWeek}
                  onChange={(e) => setBDayOfWeek(e.target.value)}
                  aria-label="曜日フィールド"
                />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>生成されたCron式</h3>
            <div className={styles.row}>
              <code className={styles.cronInput} aria-label="生成されたCron式">
                {builtExpression}
              </code>
              <button
                type="button"
                onClick={handleCopyBuilt}
                className={styles.buttonSecondary}
              >
                コピー
              </button>
            </div>
            {builtResult.valid && (
              <div
                className={styles.description}
                role="region"
                aria-label="生成式の説明"
              >
                {builtResult.description}
              </div>
            )}
            {!builtResult.valid && builtResult.error && (
              <div className={styles.error} role="alert">
                {builtResult.error}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

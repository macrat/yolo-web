"use client";

/**
 * CronParserPage — cron-parser の単一実装（フル機能のページ本体）
 *
 * cycle-225 T-6: Component.tsx のフル機能を共通部品で組み直した単一実装。
 *
 * 個別論点の解消:
 * 1. ビルダー復元（②-4 致命）: Component.tsx にあったビルダーモードを完全復元する。
 *    各フィールドを個別入力してcron式を生成する機能を共通 Input 部品で実装。
 *
 * 2. JST固定化（B-472 真の実装）: JST 固定化の主体は logic.ts の getJstField にある。
 *    getNextExecutions のマッチングループ自体が JST 壁時計で計算される。
 *    旧実装はローカルTZ getter（getHours 等）を使っており、TZ=JST 環境では偶然正しいが
 *    TZ=UTC 等の環境では誤ったマッチングが発生していた。現在の実装は UTC+9 固定オフセットを
 *    UTC getter で読むことで環境 TZ によらず常に JST 壁時計でマッチングする。
 *    詳細は logic.ts の getJstField および JST_OFFSET_MS のコメントを参照。
 *
 * 3. コピーボタン削除（②-15）: T-4b 方針でcron-parserはコピーボタンなし（知る対象）。
 *
 * 4. B-3準拠: 解析ボタン・プリセットボタンを共通 Button コンポーネントへ置換。
 *    手書き .parseButton に background-color: var(--accent) を使っていた B-3 違反を解消。
 *    共通 Button の primary バリアントは --bg-invert / --fg-invert ペアを使う。
 *
 * 共通部品の使用:
 * - Button: 解析ボタン（primary）・プリセットボタン（default/small）（B-3解消）
 * - SegmentedControl: 解析/ビルダーモード切替（A-3）
 * - ErrorMessage: エラー表示（A-4・文言は日本語）
 * - Input: Cron式テキスト入力・ビルダー各フィールド入力（A-7に準拠、type=text）
 * - ToolPageLayout: ページ全体の器（A-8 - page.tsx で使用済み）
 * ※ Textarea: テキスト変換ではないため不要（N/A）
 * ※ Select: セレクトボックス不要（N/A）
 * ※ FileDropZone: ファイル操作なし（N/A）
 * ※ useCopyToClipboard: コピーボタンなし（T-4b、N/A）
 * ※ Input(type=date): 日付入力なし（N/A）
 *
 * C-3 ライブリージョン: role="status" aria-live="polite" に実テキストノードのサマリを配置。
 * readOnly textarea をラップするだけでは不可。
 * 解析モード・ビルダーモード両方で出力変化時にサマリを更新する。
 *
 * A-4 エラー文言: ErrorMessage に渡す message は日本語化済み（英語例外メッセージをそのまま渡さない）。
 *
 * AP-I11 タイマー: setTimeout を使う箇所はなし（コピーボタン削除済み）。
 *
 * D-4: setTimeout/setInterval なし。タイマー管理不要。
 */

import { useState, useCallback } from "react";
import SegmentedControl from "@/components/SegmentedControl";
import ErrorMessage from "@/components/ErrorMessage";
import Input from "@/components/Input";
import Button from "@/components/Button";
import {
  parseCron,
  getNextExecutions,
  buildCronExpression,
  describeCronField,
} from "./logic";
import styles from "./CronParserPage.module.css";

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

// SegmentedControl の options 型に合わせて直接 { label: string; value: string }[] で宣言する。
// as const を使うと readonly リテラル型になり unknown 経由のキャストが必要になるため、
// ここでは型アノテーションで { label: string; value: string }[] を付与する（型安全性維持）。
const MODE_OPTIONS: { label: string; value: string }[] = [
  { label: "解析", value: "parser" },
  { label: "ビルダー", value: "builder" },
];

/**
 * 次回実行日時をJST（Asia/Tokyo）固定でフォーマットする（B-472 内包）。
 *
 * ブラウザのローカルTZによらず常にJSTで表示するため、
 * Intl.DateTimeFormat に timeZone: "Asia/Tokyo" を明示する。
 * これにより海外タイムゾーンのユーザーにも正しいJST時刻を表示できる。
 */
function formatDateJst(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
  }).format(date);
}

/**
 * parseCron が返す英語または混在エラーメッセージを日本語に確認・整形する（A-4）。
 * logic.ts の parseCron はすでに日本語エラーを返すが、将来の変更に備えて
 * 明示的にチェックし、未定義・空文字の場合は日本語フォールバックを返す。
 */
function toJapaneseError(error: string | undefined): string {
  if (!error || error.trim() === "") {
    return "無効なCron式です。入力内容を確認してください。";
  }
  return error; // logic.ts は日本語エラーを返す
}

export default function CronParserPage() {
  const [mode, setMode] = useState<TabMode>("parser");

  // --- 解析モード ---
  const [cronInput, setCronInput] = useState("* * * * *");
  const [parseResult, setParseResult] = useState<ReturnType<
    typeof parseCron
  > | null>(null);
  const [nextExecs, setNextExecs] = useState<Date[]>([]);
  /** C-3 ライブリージョン用サマリテキスト */
  const [liveSummary, setLiveSummary] = useState("");

  // --- ビルダーモード ---
  const [bMinute, setBMinute] = useState("*");
  const [bHour, setBHour] = useState("*");
  const [bDayOfMonth, setBDayOfMonth] = useState("*");
  const [bMonth, setBMonth] = useState("*");
  const [bDayOfWeek, setBDayOfWeek] = useState("*");

  /** 解析実行 */
  const handleParse = useCallback(() => {
    const result = parseCron(cronInput);
    setParseResult(result);
    if (result.valid) {
      const execs = getNextExecutions(cronInput, 5);
      setNextExecs(execs);
      setLiveSummary(`解析完了: ${result.description}`);
    } else {
      setNextExecs([]);
      setLiveSummary("入力エラーがあります");
    }
  }, [cronInput]);

  /** プリセット選択（解析モード） */
  const handlePreset = useCallback((expression: string) => {
    setCronInput(expression);
    const result = parseCron(expression);
    setParseResult(result);
    if (result.valid) {
      const execs = getNextExecutions(expression, 5);
      setNextExecs(execs);
      setLiveSummary(`解析完了: ${result.description}`);
    } else {
      setNextExecs([]);
      setLiveSummary("入力エラーがあります");
    }
  }, []);

  /** ビルダーモード用プリセット選択 */
  const handleBuilderPreset = useCallback((expression: string) => {
    const fields = expression.split(" ");
    if (fields.length === 5) {
      setBMinute(fields[0]);
      setBHour(fields[1]);
      setBDayOfMonth(fields[2]);
      setBMonth(fields[3]);
      setBDayOfWeek(fields[4]);
      // C-3: ビルダーのプリセット選択時もライブリージョンを更新する
      const result = parseCron(expression);
      setLiveSummary(
        result.valid ? `ビルダー: ${result.description}` : "無効な式です",
      );
    }
  }, []);

  /** ビルダーモードフィールド変更ハンドラ（C-3: 出力変化をライブリージョンに反映） */
  const handleBuilderFieldChange = useCallback(
    (
      setter: (v: string) => void,
      newValue: string,
      allFields: {
        minute: string;
        hour: string;
        dayOfMonth: string;
        month: string;
        dayOfWeek: string;
      },
    ) => {
      setter(newValue);
      // 変更後の式をその場で計算してライブリージョンを更新する
      const expr = buildCronExpression(
        allFields.minute,
        allFields.hour,
        allFields.dayOfMonth,
        allFields.month,
        allFields.dayOfWeek,
      );
      const result = parseCron(expr);
      setLiveSummary(
        result.valid
          ? `ビルダー: ${result.description}`
          : "入力を確認してください",
      );
    },
    [],
  );

  /** ビルダーの生成式 */
  const builtExpression = buildCronExpression(
    bMinute,
    bHour,
    bDayOfMonth,
    bMonth,
    bDayOfWeek,
  );
  const builtResult = parseCron(builtExpression);

  return (
    <div className={styles.container}>
      {/* C-3: role="status" aria-live="polite" で実テキストサマリを提供。
       * 解析モード・ビルダーモード両方での出力変化をスクリーンリーダーに通知する。 */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={styles.liveRegion}
      >
        {liveSummary}
      </div>

      {/* モード切替（A-3: SegmentedControl 使用・C-2: aria-label 付与）
       * MODE_OPTIONS は { label: string; value: string }[] 型で宣言しているため
       * as unknown as キャストは不要（型安全）。 */}
      <SegmentedControl
        options={MODE_OPTIONS}
        value={mode}
        onChange={(v) => setMode(v as TabMode)}
        aria-label="モード切替"
      />

      {/* ===== 解析モード ===== */}
      {mode === "parser" && (
        <>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Cron式を入力</h3>
            <div className={styles.row}>
              <div className={styles.cronInputWrapper}>
                {/* A-1 の範疇: Cron式はテキスト1行入力のため Input コンポーネントを使用 */}
                <Input
                  type="text"
                  value={cronInput}
                  onChange={(e) => setCronInput(e.target.value)}
                  placeholder="* * * * *"
                  aria-label="Cron式入力"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleParse();
                  }}
                  error={parseResult !== null && !parseResult.valid}
                />
              </div>
              {/* 共通 Button primary バリアント: --bg-invert/--fg-invert ペアで塗る（B-3準拠）。
               * 手書き .parseButton の background-color: var(--accent) を廃止した根本解決。 */}
              <Button variant="primary" onClick={handleParse}>
                解析
              </Button>
            </div>
            <div className={styles.presetRow}>
              {PRESETS.map((preset) => (
                /* 共通 Button default/small バリアント: --bg-soft 背景（B-3準拠）。
                 * 手書き .presetButton を廃止し一貫性を確保する。 */
                <Button
                  key={preset.expression}
                  variant="default"
                  size="small"
                  onClick={() => handlePreset(preset.expression)}
                  aria-label={`プリセット: ${preset.label}`}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </section>

          {/* エラー表示（A-4: ErrorMessage 使用・message は日本語） */}
          {parseResult && !parseResult.valid && (
            <ErrorMessage message={toJapaneseError(parseResult.error)} />
          )}

          {parseResult && parseResult.valid && (
            <>
              {/* 結果説明 */}
              <div className={styles.description} aria-label="Cron式の説明">
                {parseResult.description}
              </div>

              {/* フィールド詳細 */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>フィールド詳細</h3>
                <div className={styles.resultTable}>
                  {[
                    { label: "分", field: parseResult.minute },
                    { label: "時", field: parseResult.hour },
                    { label: "日", field: parseResult.dayOfMonth },
                    { label: "月", field: parseResult.month },
                    { label: "曜日", field: parseResult.dayOfWeek },
                  ].map(({ label, field }) => (
                    <div key={label} className={styles.resultRow}>
                      <span className={styles.resultLabel}>{label}</span>
                      <code className={styles.resultValue}>{field.raw}</code>
                      <span>{field.description}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* 次回実行予定（JST固定表示）*/}
              {nextExecs.length > 0 && (
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>次回実行予定（JST）</h3>
                  <ul
                    className={styles.executionList}
                    aria-label="次回実行予定一覧"
                  >
                    {nextExecs.map((date, i) => (
                      <li key={i} className={styles.executionItem}>
                        {formatDateJst(date)}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </>
      )}

      {/* ===== ビルダーモード ===== */}
      {mode === "builder" && (
        <>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Cron式ビルダー</h3>
            <div className={styles.presetRow}>
              {PRESETS.map((preset) => (
                <Button
                  key={preset.expression}
                  variant="default"
                  size="small"
                  onClick={() => handleBuilderPreset(preset.expression)}
                  aria-label={`プリセット: ${preset.label}`}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className={styles.fieldGrid}>
              {/* 分フィールド */}
              <div>
                <div className={styles.fieldLabel}>
                  分 (0-59){" "}
                  <span>- {describeCronField(bMinute, "minute")}</span>
                </div>
                <Input
                  type="text"
                  value={bMinute}
                  onChange={(e) =>
                    handleBuilderFieldChange(setBMinute, e.target.value, {
                      minute: e.target.value,
                      hour: bHour,
                      dayOfMonth: bDayOfMonth,
                      month: bMonth,
                      dayOfWeek: bDayOfWeek,
                    })
                  }
                  aria-label="分フィールド"
                />
              </div>
              {/* 時フィールド */}
              <div>
                <div className={styles.fieldLabel}>
                  時 (0-23) <span>- {describeCronField(bHour, "hour")}</span>
                </div>
                <Input
                  type="text"
                  value={bHour}
                  onChange={(e) =>
                    handleBuilderFieldChange(setBHour, e.target.value, {
                      minute: bMinute,
                      hour: e.target.value,
                      dayOfMonth: bDayOfMonth,
                      month: bMonth,
                      dayOfWeek: bDayOfWeek,
                    })
                  }
                  aria-label="時フィールド"
                />
              </div>
              {/* 日フィールド */}
              <div>
                <div className={styles.fieldLabel}>
                  日 (1-31){" "}
                  <span>- {describeCronField(bDayOfMonth, "dayOfMonth")}</span>
                </div>
                <Input
                  type="text"
                  value={bDayOfMonth}
                  onChange={(e) =>
                    handleBuilderFieldChange(setBDayOfMonth, e.target.value, {
                      minute: bMinute,
                      hour: bHour,
                      dayOfMonth: e.target.value,
                      month: bMonth,
                      dayOfWeek: bDayOfWeek,
                    })
                  }
                  aria-label="日付フィールド"
                />
              </div>
              {/* 月フィールド */}
              <div>
                <div className={styles.fieldLabel}>
                  月 (1-12) <span>- {describeCronField(bMonth, "month")}</span>
                </div>
                <Input
                  type="text"
                  value={bMonth}
                  onChange={(e) =>
                    handleBuilderFieldChange(setBMonth, e.target.value, {
                      minute: bMinute,
                      hour: bHour,
                      dayOfMonth: bDayOfMonth,
                      month: e.target.value,
                      dayOfWeek: bDayOfWeek,
                    })
                  }
                  aria-label="月フィールド"
                />
              </div>
              {/* 曜日フィールド */}
              <div>
                <div className={styles.fieldLabel}>
                  曜日 (0-7){" "}
                  <span>- {describeCronField(bDayOfWeek, "dayOfWeek")}</span>
                </div>
                <Input
                  type="text"
                  value={bDayOfWeek}
                  onChange={(e) =>
                    handleBuilderFieldChange(setBDayOfWeek, e.target.value, {
                      minute: bMinute,
                      hour: bHour,
                      dayOfMonth: bDayOfMonth,
                      month: bMonth,
                      dayOfWeek: e.target.value,
                    })
                  }
                  aria-label="曜日フィールド"
                />
              </div>
            </div>
          </section>

          {/* 生成されたCron式 */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>生成されたCron式</h3>
            <div className={styles.builtExpressionRow}>
              <code
                className={styles.builtExpression}
                aria-label="生成されたCron式"
              >
                {builtExpression}
              </code>
            </div>
            {/* 生成式の説明 */}
            {builtResult.valid && (
              <div className={styles.description} aria-label="生成式の説明">
                {builtResult.description}
              </div>
            )}
            {/* 生成式のエラー（A-4: ErrorMessage 使用・文言は日本語） */}
            {!builtResult.valid && builtResult.error && (
              <ErrorMessage message={toJapaneseError(builtResult.error)} />
            )}
          </section>
        </>
      )}
    </div>
  );
}

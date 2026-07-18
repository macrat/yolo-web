"use client";

/**
 * CronParserTile — cron-parser の単一正典タイル
 *
 * cycle-228 T-28: CronParserPage.tsx（571行）を Panel ルートのタイルへ移植。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>。外部ラッパーなし。
 * - **1ツール n タイル = variant**: full / parser / builder は同一コンポーネントの
 *   設定差で表現。別実装を作らない（分裂ゼロ）。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する。
 * - **logic.ts 共有エンジン**: parseCron/getNextExecutions/buildCronExpression/
 *   describeCronField が唯一のロジック源。不可触。
 *
 * ## variant
 *
 * - `"full"` (デフォルト): SegmentedControl でモード切替（parser/builder）が可能。
 * - `"parser"`: 解析モードに固定。SegmentedControl 非表示。
 * - `"builder"`: ビルダーモードに固定。SegmentedControl 非表示。
 *
 * ## 機能（feature-preserving）
 *
 * - 解析モード: cron式入力→解説+フィールド詳細+次回実行リスト（JST）+プリセット5個
 * - ビルダーモード: 5フィールド入力→式生成+コピー+次回実行リスト（JST）+プリセット5個
 *
 * ## アクセシビリティ
 *
 * - C-2: SegmentedControl に aria-label="モード切替"
 * - C-3: role="status" aria-live="polite" のライブリージョン+実テキストサマリ
 * - A-4: エラーは ErrorMessage コンポーネント+日本語文言
 * - A-6: 全 DOM id と htmlFor は useId ベースで一意化
 * - タッチターゲット: Button/Input min-height 44px（共通部品準拠）
 *
 * ## 共通部品
 *
 * - Panel: タイルのルート
 * - SegmentedControl: モード切替（full のみ）
 * - ErrorMessage: エラー表示
 * - Input: cron式入力・ビルダー各フィールド
 * - Button: 解析・プリセット・コピー
 * - useCopyToClipboard: ビルダー出力のコピー
 *
 * ## タイマー
 *
 * D-4: 直接 setTimeout/setInterval は使わない（useCopyToClipboard に委譲）。
 */

import { useId, useState, useCallback } from "react";
import Panel from "@/components/Panel";
import SegmentedControl from "@/components/SegmentedControl";
import ErrorMessage from "@/components/ErrorMessage";
import Input from "@/components/Input";
import Button from "@/components/Button";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import {
  parseCron,
  getNextExecutions,
  buildCronExpression,
  describeCronField,
} from "./logic";
import styles from "./CronParserTile.module.css";

// =========================================================
// 型定義
// =========================================================

type TabMode = "parser" | "builder";

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type CronParserTileVariant = "full" | "parser" | "builder";

export interface CronParserTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": SegmentedControl でモード切替可能
   * - "parser": 解析モードに固定、SegmentedControl 非表示
   * - "builder": ビルダーモードに固定、SegmentedControl 非表示
   */
  variant?: CronParserTileVariant;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

// =========================================================
// 定数
// =========================================================

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

// SegmentedControl の options 型に合わせて { label: string; value: string }[] で宣言。
// as const を使うと readonly リテラル型になり unknown 経由のキャストが必要になるため、
// 型アノテーションで { label: string; value: string }[] を付与する（型安全性維持）。
const MODE_OPTIONS: { label: string; value: string }[] = [
  { label: "解析", value: "parser" },
  { label: "ビルダー", value: "builder" },
];

// =========================================================
// ユーティリティ
// =========================================================

/**
 * 次回実行日時を JST（Asia/Tokyo）固定でフォーマットする（B-472 内包）。
 *
 * ブラウザのローカル TZ によらず常に JST で表示するため、
 * Intl.DateTimeFormat に timeZone: "Asia/Tokyo" を明示する。
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
 * parseCron が返すエラーメッセージを日本語に確認・整形し、修正ヒントを添える（A-4 + U-4 低指摘）。
 *
 * logic.ts の parseCron はすでに日本語エラーを返すが、
 * U-4 低指摘対応として「どうすればよいか」の範囲説明を追記する。
 */
function toJapaneseError(error: string | undefined): string {
  if (!error || error.trim() === "") {
    return "無効なCron式です。入力内容を確認してください。";
  }

  if (error.startsWith("分フィールドが無効です")) {
    return `${error}（0〜59 で指定してください）`;
  }
  if (error.startsWith("時フィールドが無効です")) {
    return `${error}（0〜23 で指定してください）`;
  }
  if (error.startsWith("日フィールドが無効です")) {
    return `${error}（1〜31 で指定してください）`;
  }
  if (error.startsWith("月フィールドが無効です")) {
    return `${error}（1〜12 で指定してください）`;
  }
  if (error.startsWith("曜日フィールドが無効です")) {
    return `${error}（0〜7 で指定してください。0 と 7 は日曜日）`;
  }

  return error; // logic.ts は日本語エラーを返す（上記以外はそのまま返す）
}

// =========================================================
// コンポーネント
// =========================================================

export default function CronParserTile({
  variant = "full",
  as = "section",
  className,
}: CronParserTileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合防止）----------
  const uid = useId();
  const cronInputId = `${uid}-cron-input`;
  const minuteId = `${uid}-minute`;
  const hourId = `${uid}-hour`;
  const dayOfMonthId = `${uid}-day-of-month`;
  const monthId = `${uid}-month`;
  const dayOfWeekId = `${uid}-day-of-week`;

  // ---------- variant から固定モードを決定 ----------
  // "full" は SegmentedControl でユーザーが切り替え可能。
  // "parser" / "builder" は固定（SegmentedControl 非表示）。
  const fixedMode: TabMode | null =
    variant === "parser" ? "parser" : variant === "builder" ? "builder" : null;

  // ---------- State ----------
  const [dynamicMode, setDynamicMode] = useState<TabMode>("parser");

  // 実際に使うモード: fixedMode があればそれを使い、なければ state を使う
  const mode = fixedMode ?? dynamicMode;

  // --- 解析モード ---
  const [cronInput, setCronInput] = useState("* * * * *");
  const [parseResult, setParseResult] = useState<ReturnType<
    typeof parseCron
  > | null>(null);
  const [nextExecs, setNextExecs] = useState<Date[]>([]);

  /** C-3 ライブリージョン用サマリテキスト */
  const [liveSummary, setLiveSummary] = useState("");

  /** ビルダー出力のコピー用フック（T-4b 更新: ビルダー生成式は持ち帰り対象） */
  const { copy, copiedKey } = useCopyToClipboard();

  // --- ビルダーモード ---
  const [bMinute, setBMinute] = useState("*");
  const [bHour, setBHour] = useState("*");
  const [bDayOfMonth, setBDayOfMonth] = useState("*");
  const [bMonth, setBMonth] = useState("*");
  const [bDayOfWeek, setBDayOfWeek] = useState("*");

  // ---------- 解析実行 ----------
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

  // ---------- プリセット選択（解析モード）----------
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

  // ---------- ビルダーモード用プリセット選択 ----------
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

  // ---------- ビルダーモードフィールド変更ハンドラ ----------
  // C-3: 出力変化をライブリージョンに反映
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

  // ---------- ビルダーの生成式 ----------
  const builtExpression = buildCronExpression(
    bMinute,
    bHour,
    bDayOfMonth,
    bMonth,
    bDayOfWeek,
  );
  const builtResult = parseCron(builtExpression);

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）
  return (
    <Panel as={as} className={className}>
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

      {/* モード切替（variant=full のみ表示・C-2: aria-label 付与）
       * U-4 是正(a): モード切替時に liveSummary をリセットして stale 表示を防止する。
       * fixedMode がある（parser/builder）場合は非表示。 */}
      {fixedMode === null && (
        <SegmentedControl
          options={MODE_OPTIONS}
          value={dynamicMode}
          onChange={(v) => {
            setDynamicMode(v as TabMode);
            // U-4 是正(a): モード切替で liveSummary をリセット（stale 表示防止）
            setLiveSummary("");
          }}
          aria-label="モード切替"
        />
      )}

      {/* ===== 解析モード ===== */}
      {mode === "parser" && (
        <>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Cron式を入力</h2>
            <div className={styles.row}>
              <div className={styles.cronInputWrapper}>
                {/* A-6: useId で一意化した id を label に結合 */}
                <Input
                  id={cronInputId}
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
              {/* 共通 Button primary バリアント: var(--accent) 地に var(--paper) 文字で塗る（B-3準拠）。*/}
              <Button variant="primary" onClick={handleParse}>
                解析
              </Button>
            </div>
            <div className={styles.presetRow}>
              {PRESETS.map((preset) => (
                /* 共通 Button default/small バリアント（B-3準拠）。*/
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
                <h2 className={styles.sectionTitle}>フィールド詳細</h2>
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
                  <h2 className={styles.sectionTitle}>次回実行予定（JST）</h2>
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
            <h2 className={styles.sectionTitle}>Cron式ビルダー</h2>
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
              {/* 分フィールド（A-6: useId ベース id）*/}
              <div>
                <label htmlFor={minuteId} className={styles.fieldLabel}>
                  分 (0-59){" "}
                  <span>- {describeCronField(bMinute, "minute")}</span>
                </label>
                <Input
                  id={minuteId}
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
                <label htmlFor={hourId} className={styles.fieldLabel}>
                  時 (0-23) <span>- {describeCronField(bHour, "hour")}</span>
                </label>
                <Input
                  id={hourId}
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
                <label htmlFor={dayOfMonthId} className={styles.fieldLabel}>
                  日 (1-31){" "}
                  <span>- {describeCronField(bDayOfMonth, "dayOfMonth")}</span>
                </label>
                <Input
                  id={dayOfMonthId}
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
                <label htmlFor={monthId} className={styles.fieldLabel}>
                  月 (1-12) <span>- {describeCronField(bMonth, "month")}</span>
                </label>
                <Input
                  id={monthId}
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
                <label htmlFor={dayOfWeekId} className={styles.fieldLabel}>
                  曜日 (0-7){" "}
                  <span>- {describeCronField(bDayOfWeek, "dayOfWeek")}</span>
                </label>
                <Input
                  id={dayOfWeekId}
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
            <h2 className={styles.sectionTitle}>生成されたCron式</h2>
            {/* A-6: コピーボタン（T-4b 更新方針: ビルダー生成式は持ち帰り対象）
             * useCopyToClipboard フック + COPIED_LABEL で統一実装。
             * 生成式が無効（バリデーション失敗）のときはコピーボタンを disabled にする（E-7）。*/}
            <div className={styles.builtExpressionRow}>
              <code
                className={styles.builtExpression}
                aria-label="生成されたCron式"
              >
                {builtExpression}
              </code>
              {/* aria-label をコピー状態に合わせて動的に変える（スクリーンリーダーに正確な状態を伝える）。*/}
              <Button
                variant="default"
                onClick={() => copy(builtExpression)}
                disabled={!builtResult.valid}
                aria-label={copiedKey ? COPIED_LABEL : "コピー"}
              >
                {copiedKey ? COPIED_LABEL : "コピー"}
              </Button>
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

          {/* U-4 低指摘: ビルダーにも次回実行予定を表示する（JST固定表示）
           * 解析モードと同様に、有効な式の場合のみ次回実行を表示する。*/}
          {builtResult.valid &&
            (() => {
              const builtNextExecs = getNextExecutions(builtExpression, 5);
              return builtNextExecs.length > 0 ? (
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>次回実行予定（JST）</h2>
                  <ul
                    className={styles.executionList}
                    aria-label="ビルダー次回実行予定一覧"
                  >
                    {builtNextExecs.map((date, i) => (
                      <li key={i} className={styles.executionItem}>
                        {formatDateJst(date)}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null;
            })()}
        </>
      )}
    </Panel>
  );
}

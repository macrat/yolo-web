"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { parseCron, getNextExecutions } from "./logic";

/**
 * Cron式解析 タイル用 UI（kind=widget）。
 *
 * 入力→解析→構造化表示型タイル（Phase 8.1 第 19 弾 / cycle-218 T-3）:
 * - 「Cron式が意図どおりのスケジュールか・次にいつ動くかを今すぐ確かめたい」に直接応答
 * - デフォルト式 "0 9 * * 1-5"（平日朝9時）で開いた瞬間から解析結果を表示
 * - M1a「開いた瞬間に入力欄が見えてすぐ使える」に直撃
 *
 * AP-P21 役割分担（cycle-218 SSoT 新規確立 入力→解析→構造化表示型 N=1）:
 * - 操作側（flexShrink: 0）= cron式入力欄 + コピーボタン + プリセット行 + 折りたたみトグル
 *   (C) 操作側 40px 下限（cycle-210 SSoT (i) 引用適用）
 * - 膨張側（flex: 1 + overflowY: auto）= description + 次回実行5件 + フィールド詳細
 *
 * 論点 F 対応（hydration 安全 / docs/knowledge/nextjs.md §4）:
 * - cron式文字列・description は決定論的 → useState("0 9 * * 1-5") で SSR/CSR 一致（hydration-safe）
 * - 次回実行は getNextExecutions が new Date() 依存で非決定論的
 *   → 初期 state は空配列、useEffect でマウント後に差し込む（c217-δ と同型）
 *   → SSR 初回描画に含めないため hydration mismatch が起きない
 *
 * 論点 G 対応（タイムゾーン虚偽表示回避）:
 * - getNextExecutions はブラウザのローカル TZ で計算する
 * - 「（JST）」と付けると非 JST 来訪者に虚偽表示になるため付けない
 * - 「お使いの環境の時刻」と正直に表記する
 *
 * 論点 B（解析専用 / ビルダータブなし）:
 * - タイルは「式入力 → 即解析」の解析動線のみ
 * - ビルダータブは詳細ページに残し、タイルからは detailPath で誘導
 *
 * AP-I11 setTimeout cleanup:
 * - コピーボタン文言復帰の 2 秒タイマーを useRef で保持
 * - useEffect cleanup で clearTimeout を呼び出す
 *
 * コピーボタン文言変化は AP-P21 適用外（cycle-211 (x) 引用適用）。
 *
 * CSS Module 不使用（codegen 制約）/ インラインスタイル方式（既存タイル同型）。
 */

/** デフォルト cron 式（平日朝9時 / 具体値・ワイルドカード・範囲の3構文を含む） */
const DEFAULT_CRON = "0 9 * * 1-5";

/** コピー完了表示を元に戻すまでの時間 (ms): 2秒 */
const COPY_FEEDBACK_DURATION_MS = 2000;

/** プリセット定義 */
const PRESETS = [
  { label: "毎分", expression: "* * * * *" },
  { label: "毎時", expression: "0 * * * *" },
  { label: "毎日9時", expression: "0 9 * * *" },
  { label: "平日9時", expression: "0 9 * * 1-5" },
  { label: "毎月1日", expression: "0 0 1 * *" },
] as const;

/** フィールドラベル定義（入力欄直下に常時表示） */
const FIELD_LABELS = ["分", "時", "日", "月", "曜日"] as const;

/**
 * 次回実行日時をブラウザのローカル TZ でフォーマットする。
 * 「（JST）」は付けない（論点 G: ローカル TZ 表示のため虚偽表示回避）。
 */
function formatNextExecution(date: Date): string {
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
  });
}

export default function CronParserTile() {
  /**
   * cron 式入力値
   *
   * description は決定論的（同じ式 → 同じ description）なので
   * 固定初期値 DEFAULT_CRON で SSR/クライアント初回描画が一致し hydration-safe。
   * （docs/knowledge/nextjs.md §4 OK パターン）
   */
  const [cronInput, setCronInput] = useState(DEFAULT_CRON);

  /**
   * 次回実行リスト（論点 F の採択案 (a) / c217-δ 型）
   *
   * getNextExecutions は new Date() 依存で非決定論的。
   * 初期 state に含めると SSR 時刻 ≠ クライアント時刻で hydration mismatch が起きる。
   * よって初期値は空配列とし、useEffect でマウント後に差し込む。
   */
  const [nextExecs, setNextExecs] = useState<Date[]>([]);

  /** フィールド詳細の折りたたみ開閉状態（初期は閉じた状態） */
  const [detailsOpen, setDetailsOpen] = useState(false);

  /** コピー完了フラグ（インプレース FB 用） */
  const [copied, setCopied] = useState(false);

  /** コピー完了表示を元に戻す setTimeout ID（AP-I11 SSoT） */
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** 現在入力の cron 式を解析した結果（決定論的 / SSR 安全） */
  const parseResult = parseCron(cronInput);

  /**
   * マウント後に次回実行リストを差し込む（論点 F 採択案 (a) / c217-δ 型）
   * クライアントのみで実行されるため hydration mismatch が起きない。
   */
  useEffect(() => {
    if (parseResult.valid) {
      const execs = getNextExecutions(cronInput, 5);
      setNextExecs(execs);
    } else {
      setNextExecs([]);
    }
    // cronInput の変化でのみ更新（parseResult は cronInput から同期的に導出される）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cronInput]);

  /** AP-I11 cleanup: unmount 時に走行中の setTimeout をキャンセルする */
  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  /** cron 式入力変更ハンドラ */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCronInput(e.target.value);
      setCopied(false);
      if (copyTimerRef.current !== null) {
        clearTimeout(copyTimerRef.current);
        copyTimerRef.current = null;
      }
    },
    [],
  );

  /** プリセット選択ハンドラ */
  const handlePreset = useCallback((expression: string) => {
    setCronInput(expression);
    setCopied(false);
    if (copyTimerRef.current !== null) {
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = null;
    }
  }, []);

  /** コピーハンドラ（AP-I11 SSoT / 論点 D 採択: cron式コピー主軸 + インプレース FB） */
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(cronInput);
      setCopied(true);
      if (copyTimerRef.current !== null) {
        clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = setTimeout(() => {
        setCopied(false);
        copyTimerRef.current = null;
      }, COPY_FEEDBACK_DURATION_MS);
    } catch {
      // Clipboard API not available — silent fail
    }
  }, [cronInput]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        padding: "8px",
        backgroundColor: "var(--bg)",
        color: "var(--fg)",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
        fontFamily: "inherit",
      }}
    >
      {/* === 操作側（flexShrink: 0）=== */}

      {/* cron 式入力欄 + コピーボタン（操作側 / AP-P21 (C): minHeight 40px） */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "4px",
          minHeight: 40,
        }}
      >
        <input
          type="text"
          value={cronInput}
          onChange={handleInputChange}
          placeholder="cron式を入力（例: 0 9 * * 1-5）"
          aria-label="cron式"
          style={{
            flex: 1,
            minWidth: 0,
            padding: "6px 8px",
            fontSize: "0.72rem",
            fontFamily:
              "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
            border: `1px solid ${parseResult.valid ? "var(--border, var(--fg-soft))" : "var(--danger, #e53e3e)"}`,
            borderRadius: "4px",
            backgroundColor: "var(--bg-soft, var(--bg))",
            color: "var(--fg)",
            outline: "none",
            boxSizing: "border-box",
            height: 40,
          }}
        />
        {/* コピーボタン（AP-I11 / 論点 D: インプレース FB・レイアウト不変） */}
        <button
          type="button"
          data-testid="copy-button"
          aria-label={copied ? "コピー済み" : "cron式をコピー"}
          onClick={handleCopy}
          style={{
            flexShrink: 0,
            minHeight: 40,
            padding: "0 10px",
            fontSize: "0.65rem",
            borderRadius: "4px",
            border: `1px solid ${copied ? "var(--accent)" : "var(--border, var(--fg-soft))"}`,
            backgroundColor: copied ? "var(--accent)" : "transparent",
            color: copied ? "var(--fg-invert, var(--bg))" : "var(--fg-soft)",
            cursor: "pointer",
            fontFamily: "inherit",
            fontWeight: copied ? 600 : 400,
            whiteSpace: "nowrap",
            transition: "background-color 0.15s, color 0.15s",
          }}
        >
          {copied ? "コピー済み" : "コピー"}
        </button>
      </div>

      {/* フィールドラベル行（入力欄直下に常時表示 / 論点 C 採択） */}
      <div
        data-testid="field-labels"
        style={{
          flexShrink: 0,
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "2px",
          minHeight: 20,
        }}
      >
        {FIELD_LABELS.map((label) => (
          <div
            key={label}
            style={{
              textAlign: "center",
              fontSize: "0.58rem",
              color: "var(--fg-soft)",
              fontWeight: 600,
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* プリセット行（操作側 / AP-P21 (C): minHeight 40px） */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          gap: "3px",
          flexWrap: "nowrap",
          overflowX: "auto",
          minHeight: 40,
          alignItems: "center",
          scrollbarWidth: "none",
        }}
      >
        {PRESETS.map(({ label, expression }) => {
          const isActive = cronInput === expression;
          return (
            <button
              key={expression}
              type="button"
              onClick={() => handlePreset(expression)}
              aria-pressed={isActive}
              style={{
                flexShrink: 0,
                minHeight: 40,
                padding: "2px 7px",
                fontSize: "0.6rem",
                borderRadius: "4px",
                border: `1px solid ${isActive ? "var(--accent)" : "var(--border, var(--fg-soft))"}`,
                backgroundColor: isActive ? "var(--accent)" : "transparent",
                color: isActive
                  ? "var(--fg-invert, var(--bg))"
                  : "var(--fg-soft)",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: isActive ? 600 : 400,
                whiteSpace: "nowrap",
                transition: "background-color 0.15s, color 0.15s",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* === 膨張側（flex: 1 + overflowY: auto）=== */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          minHeight: 0,
        }}
      >
        {/* エラー表示 */}
        {!parseResult.valid && (
          <div
            data-testid="cron-error"
            style={{
              padding: "8px 10px",
              borderRadius: "4px",
              backgroundColor: "var(--danger-soft, rgba(229,62,62,0.1))",
              border: "1px solid var(--danger, #e53e3e)",
              color: "var(--danger, #e53e3e)",
              fontSize: "0.65rem",
              lineHeight: 1.5,
            }}
          >
            {parseResult.error ||
              (cronInput.trim() === ""
                ? "cron式を入力してください"
                : "無効な式です")}
          </div>
        )}

        {/* 有効式: description（主役） + 次回実行 + フィールド詳細 */}
        {parseResult.valid && (
          <>
            {/* description（最大スペースの主役 / リアルタイム更新） */}
            <div
              style={{
                flexShrink: 0,
                padding: "8px 10px",
                borderRadius: "4px",
                backgroundColor: "var(--bg-soft, var(--bg))",
                border: "1px solid var(--accent)",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "var(--fg)",
                lineHeight: 1.5,
              }}
            >
              {parseResult.description}
            </div>

            {/* 次回実行リスト（論点 F: マウント後に差し込む / 論点 G: 「JST」を付けない） */}
            <div
              data-testid="next-executions"
              style={{
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }}
            >
              <div
                style={{
                  fontSize: "0.6rem",
                  color: "var(--fg-soft)",
                  fontWeight: 600,
                  marginBottom: "2px",
                }}
              >
                次回実行（お使いの環境の時刻）
              </div>
              {nextExecs.length === 0 ? (
                /* SSR 時・マウント前のプレースホルダ（空状態 / hydration-safe） */
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "var(--fg-soft)",
                    fontStyle: "italic",
                  }}
                >
                  &mdash;
                </div>
              ) : (
                nextExecs.map((date, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: "0.65rem",
                      color: "var(--fg)",
                      fontFamily:
                        "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
                      padding: "1px 0",
                    }}
                  >
                    {formatNextExecution(date)}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* フィールド詳細（折りたたみ / 論点 C 採択） */}
        {parseResult.valid && (
          <div style={{ flexShrink: 0 }}>
            {/* 折りたたみトグルボタン（操作側要素だが膨張側内部に配置） */}
            <button
              type="button"
              data-testid="details-toggle"
              aria-expanded={detailsOpen}
              onClick={() => setDetailsOpen((prev) => !prev)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "4px 6px",
                fontSize: "0.6rem",
                borderRadius: "4px",
                border: "1px solid var(--border, var(--fg-soft))",
                backgroundColor: "transparent",
                color: "var(--fg-soft)",
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>フィールド詳細 / 記法リファレンス</span>
              <span style={{ fontSize: "0.55rem" }}>
                {detailsOpen ? "▲" : "▼"}
              </span>
            </button>

            {/* フィールド詳細テーブル（折りたたみ内） */}
            {detailsOpen && (
              <div
                data-testid="field-details"
                style={{
                  marginTop: "4px",
                  padding: "6px 8px",
                  borderRadius: "4px",
                  backgroundColor: "var(--bg-soft, var(--bg))",
                  border: "1px solid var(--border, var(--fg-soft))",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                {/* フィールド内訳テーブル */}
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.6rem",
                  }}
                >
                  <thead>
                    <tr>
                      {(["フィールド", "値", "説明"] as const).map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            padding: "2px 4px",
                            borderBottom:
                              "1px solid var(--border, var(--fg-soft))",
                            color: "var(--fg-soft)",
                            fontWeight: 600,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        label: "分",
                        field: parseResult.minute,
                      },
                      {
                        label: "時",
                        field: parseResult.hour,
                      },
                      {
                        label: "日",
                        field: parseResult.dayOfMonth,
                      },
                      {
                        label: "月",
                        field: parseResult.month,
                      },
                      {
                        label: "曜日",
                        field: parseResult.dayOfWeek,
                      },
                    ].map(({ label, field }) => (
                      <tr key={label}>
                        <td
                          style={{
                            padding: "2px 4px",
                            color: "var(--fg-soft)",
                            fontWeight: 600,
                          }}
                        >
                          {label}
                        </td>
                        <td
                          style={{
                            padding: "2px 4px",
                            fontFamily:
                              "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
                            color: "var(--accent)",
                          }}
                        >
                          {field.raw}
                        </td>
                        <td
                          style={{
                            padding: "2px 4px",
                            color: "var(--fg)",
                          }}
                        >
                          {field.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* 記法リファレンス + 曜日注釈（静的テキスト / logic.ts からは出ない） */}
                <div
                  style={{
                    fontSize: "0.58rem",
                    color: "var(--fg-soft)",
                    lineHeight: 1.6,
                    borderTop: "1px solid var(--border, var(--fg-soft))",
                    paddingTop: "4px",
                  }}
                >
                  <strong style={{ color: "var(--fg)", fontSize: "0.58rem" }}>
                    記法:
                  </strong>{" "}
                  <code
                    style={{
                      fontFamily:
                        "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
                    }}
                  >
                    *
                  </code>{" "}
                  すべて /{" "}
                  <code
                    style={{
                      fontFamily:
                        "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
                    }}
                  >
                    */n
                  </code>{" "}
                  n毎 /{" "}
                  <code
                    style={{
                      fontFamily:
                        "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
                    }}
                  >
                    a-b
                  </code>{" "}
                  範囲 /{" "}
                  <code
                    style={{
                      fontFamily:
                        "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
                    }}
                  >
                    a,b
                  </code>{" "}
                  列挙
                  <br />
                  {/* 曜日注釈（静的テキスト / logic.ts から出ない / 計画書「曜日 0/7 注釈」） */}
                  <strong style={{ color: "var(--fg)", fontSize: "0.58rem" }}>
                    曜日:
                  </strong>{" "}
                  0=日曜・1=月〜6=土・7=日曜（0と7はどちらも日曜日）
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* === フッター行（操作側 = flexShrink: 0 / AP-P21 (C): minHeight 40px）=== */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          minHeight: 40,
        }}
      >
        <Link
          href="/tools/cron-parser"
          style={{
            fontSize: "0.7rem",
            color: "var(--accent)",
            textDecoration: "underline",
            textUnderlineOffset: "2px",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            minHeight: 40,
          }}
        >
          詳細 →
        </Link>
      </div>
    </div>
  );
}

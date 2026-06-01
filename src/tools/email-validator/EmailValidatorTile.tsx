"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { validateEmail } from "./logic";

/**
 * メールアドレス検証 タイル用 UI（kind=widget）。
 *
 * 入力→検証→結果表示型タイル（Phase 8.1 第 20 弾 / cycle-219 T-3）:
 * - 「メールアドレスが形式として正しいか・タイポしていないかを今すぐ確かめたい」に直接応答
 * - デフォルト値 "test@gmial.com"（タイポ例）で開いた瞬間から検証結果を表示
 * - M1a「開いた瞬間に入力欄が見えてすぐ使える」「タイポ修正提案が即座に表示される」に直撃
 *
 * AP-P21 役割分担（cycle-219 SSoT 確立 入力→検証→結果表示型 N=1）:
 * - 操作側（flexShrink: 0）= メール入力欄 + 提案採用ボタン + 提案コピーボタン + 折りたたみトグル
 *   (C) 操作側 40px 下限（cycle-210 SSoT (i) 引用適用 / c218-α 引用適用）
 * - 膨張側（flex: 1 + overflowY: auto + min-height: 0）= 判定バッジ + 理由/警告/提案 + パーツ内訳
 *   （c218-β 引用適用: 枠内収納安定 / CLS 抑制）
 *
 * 論点 D 採択（hydration 安全 / docs/knowledge/nextjs.md §4）:
 * - validateEmail は完全に決定論的（new Date()・乱数を一切使わない = 実装値 / logic.ts 全行確認）
 * - useState("test@gmial.com") の固定初期値で SSR/CSR 初回描画が完全に一致 → hydration-safe
 * - useEffect 差し込み不要（cron-parser の論点 F は本ツールには発生しない）
 *   ※ cron-parser 論点 F: getNextExecutions が new Date() 依存で非決定論的 → useEffect 必須だった
 *   ※ 本ツールの validateEmail は非決定論的要素を持たないため、開いた瞬間から結果を表示してよい
 *
 * 情報優先度 4 層（論点 B 採択）:
 *   ① 入力欄 + 判定バッジ（背景色 + アイコン二重符号化 / 色覚多様性対応 / 常時最大）
 *   ② タイポ提案（筆頭・accent 色 / エラー/警告と色分け）+ エラー/警告理由（バッジ直下）
 *   ③ パーツ内訳（有効時のみ・コンパクト）
 *   ④ 詳細ルールチェック等 → 折りたたみ
 *
 * ワンタップ採用 + コピー（論点 C 採択）:
 * - 提案アドレスがクリックで入力欄を上書き → 即再検証（採用）
 * - 提案アドレスをクリップボードへコピー → インプレース FB
 * - コピーボタン文言変化は AP-P21 適用外（cycle-211 (x) 引用適用）
 *
 * debounce 判断:
 * - cron-parser・regex-tester の前例（キー入力ごと即時再検証）と整合し debounce なしで実装
 * - validateEmail は同期・決定論的・即時で、overflowY:auto で膨張も収納済み
 *
 * AP-I11 setTimeout cleanup:
 * - コピーボタン文言復帰の 2 秒タイマーを useRef で保持
 * - useEffect cleanup で clearTimeout を呼び出す
 *
 * CSS Module 不使用（codegen 制約 / kind=widget 確立規約）/ インラインスタイル方式。
 */

/** デフォルト入力（タイポ例: gmial.com → gmail.com の提案が出る / COMMON_TYPOS L12 実在確認済み） */
const DEFAULT_EMAIL = "test@gmial.com";

/** コピー完了表示を元に戻すまでの時間 (ms): 2秒 / 仕様値 / cron-parser 同型 */
const COPY_FEEDBACK_DURATION_MS = 2000;

/** suggestions 文字列のプレフィックス（logic.ts L157 実装値） */
const SUGGESTION_PREFIX = "もしかして: ";

/**
 * suggestions 文字列（"もしかして: user@gmail.com" 形式）から
 * 修正済みアドレスを取り出す（T-1 §5 (iii) 推奨の方法A）。
 */
function extractSuggestedAddress(suggestion: string): string {
  return suggestion.replace(SUGGESTION_PREFIX, "");
}

export default function EmailValidatorTile() {
  /**
   * メールアドレス入力値
   *
   * validateEmail は完全に決定論的なので、固定初期値 DEFAULT_EMAIL で
   * SSR/クライアント初回描画が一致し hydration-safe。
   * cron-parser の論点 F（useEffect 差し込み）は本ツールには発生しない。
   * （docs/knowledge/nextjs.md §4 OK パターン直接適用）
   */
  const [emailInput, setEmailInput] = useState(DEFAULT_EMAIL);

  /** パーツ内訳の折りたたみ開閉状態（初期は閉じた状態） */
  const [detailsOpen, setDetailsOpen] = useState(false);

  /** コピー完了フラグ（インプレース FB 用） */
  const [copied, setCopied] = useState(false);

  /** コピー完了表示を元に戻す setTimeout ID（AP-I11 SSoT） */
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** AP-I11 cleanup: unmount 時に走行中の setTimeout をキャンセルする */
  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  /**
   * 現在入力の検証結果（決定論的 / SSR 安全）
   * validateEmail は new Date()・乱数を使わない完全な同期処理。
   */
  const result = validateEmail(emailInput);

  /** メールアドレス入力変更ハンドラ */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmailInput(e.target.value);
      // 入力変更時はコピー FB をリセット
      setCopied(false);
      if (copyTimerRef.current !== null) {
        clearTimeout(copyTimerRef.current);
        copyTimerRef.current = null;
      }
    },
    [],
  );

  /** 提案採用ハンドラ: 入力欄を修正済みアドレスで上書きし再検証が即走る */
  const handleAdopt = useCallback((suggestion: string) => {
    const correctedAddress = extractSuggestedAddress(suggestion);
    setEmailInput(correctedAddress);
    setCopied(false);
    if (copyTimerRef.current !== null) {
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = null;
    }
  }, []);

  /** 提案コピーハンドラ（AP-I11 / インプレース FB） */
  const handleCopy = useCallback(async (suggestion: string) => {
    const correctedAddress = extractSuggestedAddress(suggestion);
    try {
      await navigator.clipboard.writeText(correctedAddress);
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
  }, []);

  /** 判定バッジのスタイル（有効/無効で色変化 / 背景色+アイコンの二重符号化） */
  const badgeStyle: React.CSSProperties = result.valid
    ? {
        padding: "6px 10px",
        borderRadius: "4px",
        backgroundColor: "var(--success-soft)",
        border: "1px solid var(--success)",
        color: "var(--success-strong)",
        fontSize: "0.78rem",
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }
    : emailInput.trim() === ""
      ? {
          padding: "6px 10px",
          borderRadius: "4px",
          backgroundColor: "var(--bg-soft, var(--bg))",
          border: "1px solid var(--border)",
          color: "var(--fg-soft)",
          fontSize: "0.78rem",
          fontWeight: 400,
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }
      : {
          padding: "6px 10px",
          borderRadius: "4px",
          backgroundColor: "var(--danger-soft)",
          border: "1px solid var(--danger)",
          color: "var(--danger-strong)",
          fontSize: "0.78rem",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: "6px",
        };

  const badgeIcon = result.valid ? "✓" : emailInput.trim() === "" ? "—" : "✗";
  const badgeLabel = result.valid
    ? "有効"
    : emailInput.trim() === ""
      ? "未入力"
      : "無効";

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

      {/* メールアドレス入力欄（操作側 / AP-P21 (C): minHeight 40px） */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "4px",
          minHeight: 40, // 実装値 / c218-α 引用 / AP-P21 操作側 40px 下限
        }}
      >
        <input
          type="email"
          value={emailInput}
          onChange={handleInputChange}
          placeholder="メールアドレスを入力"
          aria-label="メールアドレス"
          style={{
            flex: 1,
            minWidth: 0,
            padding: "6px 8px",
            fontSize: "0.72rem",
            fontFamily:
              "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
            border: `1px solid ${
              result.valid
                ? "var(--border, var(--fg-soft))"
                : emailInput.trim() === ""
                  ? "var(--border, var(--fg-soft))"
                  : "var(--danger, #e53e3e)"
            }`,
            borderRadius: "4px",
            backgroundColor: "var(--bg-soft, var(--bg))",
            color: "var(--fg)",
            outline: "none",
            boxSizing: "border-box",
            height: 40, // 実装値 / AP-P21 操作側 40px 下限
          }}
        />
      </div>

      {/* === 膨張側（flex: 1 + overflowY: auto + min-height: 0）=== */}
      {/* c218-β 引用適用: 枠内収納安定 / CLS 抑制 */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          minHeight: 0, // c218-β: flex:1 + overflowY:auto には min-height:0 が必須
        }}
      >
        {/* ① 判定バッジ（背景色+アイコンの二重符号化 = 色覚多様性対応 / 常時最大） */}
        <div data-testid="validation-badge" style={badgeStyle}>
          <span style={{ fontSize: "0.85rem" }}>{badgeIcon}</span>
          <span>{badgeLabel}</span>
          {emailInput.trim() !== "" && (
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 400,
                marginLeft: "4px",
                opacity: 0.8,
              }}
            >
              {emailInput.length > 30
                ? emailInput.substring(0, 30) + "..."
                : emailInput}
            </span>
          )}
        </div>

        {/* ② タイポ提案（筆頭・accent 色でエラーと色分け / 論点 B 採択） */}
        {result.suggestions.length > 0 && (
          <div
            data-testid="email-suggestions"
            style={{
              padding: "6px 10px",
              borderRadius: "4px",
              backgroundColor: "var(--accent-soft)",
              border: "1px solid var(--accent)",
              color: "var(--accent-strong)",
              fontSize: "0.65rem",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {result.suggestions.map((suggestion, i) => {
              const correctedAddress = extractSuggestedAddress(suggestion);
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ flex: 1, minWidth: 0 }}>{suggestion}</span>
                  {/* 採用ボタン（ワンタップ採用 / 論点 C 採択 / 操作側要素 / minHeight 40px） */}
                  <button
                    type="button"
                    data-testid="suggestion-adopt"
                    aria-label={`${correctedAddress} を採用`}
                    onClick={() => handleAdopt(suggestion)}
                    style={{
                      flexShrink: 0,
                      minHeight: 40, // 実装値 / AP-P21 操作側 40px 下限
                      padding: "2px 8px",
                      fontSize: "0.6rem",
                      borderRadius: "4px",
                      border: "1px solid var(--accent)",
                      backgroundColor: "var(--accent)",
                      color: "var(--fg-invert, var(--bg))",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    採用
                  </button>
                  {/* コピーボタン（提案アドレスのみコピー / 論点 C 採択 / AP-I11 cleanup 済み） */}
                  <button
                    type="button"
                    data-testid="suggestion-copy"
                    aria-label={
                      copied ? "コピー済み" : `${correctedAddress} をコピー`
                    }
                    onClick={() => handleCopy(suggestion)}
                    style={{
                      flexShrink: 0,
                      minHeight: 40, // 実装値 / AP-P21 操作側 40px 下限
                      padding: "2px 8px",
                      fontSize: "0.6rem",
                      borderRadius: "4px",
                      border: `1px solid ${copied ? "var(--accent)" : "var(--border, var(--fg-soft))"}`,
                      backgroundColor: copied ? "var(--accent)" : "transparent",
                      color: copied
                        ? "var(--fg-invert, var(--bg))"
                        : "var(--accent-strong)",
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
              );
            })}
          </div>
        )}

        {/* ② エラー理由（バッジ直下に即展開 / 論点 B 採択）
            空入力（emailInput.trim() === ""）のときはエラーボックスを出さない。
            中立グレーの「未入力」バッジが状態を十分伝えるため、
            赤い danger 配色のエラーボックスと同時表示すると矛盾シグナルになる。
            （MINOR-1 修正 / cycle-219 T-3 r1） */}
        {result.errors.length > 0 && emailInput.trim() !== "" && (
          <div
            data-testid="email-errors"
            style={{
              padding: "6px 10px",
              borderRadius: "4px",
              backgroundColor: "var(--danger-soft)",
              border: "1px solid var(--danger)",
              color: "var(--danger-strong)",
              fontSize: "0.65rem",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            {result.errors.map((error, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "4px",
                }}
              >
                <span style={{ flexShrink: 0 }}>✗</span>
                <span>{error}</span>
              </div>
            ))}
          </div>
        )}

        {/* ② 警告（有効だが注意 / warning 色でエラーと色分け） */}
        {result.warnings.length > 0 && (
          <div
            data-testid="email-warnings"
            style={{
              padding: "6px 10px",
              borderRadius: "4px",
              backgroundColor: "var(--warning-soft)",
              border: "1px solid var(--warning)",
              color: "var(--warning-strong)",
              fontSize: "0.65rem",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            {result.warnings.map((warning, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "4px",
                }}
              >
                <span style={{ flexShrink: 0 }}>⚠</span>
                <span>{warning}</span>
              </div>
            ))}
          </div>
        )}

        {/* ③ パーツ内訳 + 折りたたみ（有効時のみ / 論点 B ③④） */}
        {result.valid && emailInput.trim() !== "" && (
          <div style={{ flexShrink: 0 }}>
            {/* パーツ内訳（コンパクト表示 / 有効時のみ） */}
            <div
              style={{
                padding: "6px 10px",
                borderRadius: "4px",
                backgroundColor: "var(--bg-soft, var(--bg))",
                border: "1px solid var(--border)",
                fontSize: "0.65rem",
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <span
                  style={{
                    color: "var(--fg-soft)",
                    fontSize: "0.58rem",
                    fontWeight: 600,
                    display: "block",
                  }}
                >
                  ローカルパート
                </span>
                <span
                  style={{
                    color: "var(--fg)",
                    fontFamily:
                      "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
                  }}
                >
                  {result.localPart}
                </span>
              </div>
              <div>
                <span
                  style={{
                    color: "var(--fg-soft)",
                    fontSize: "0.58rem",
                    fontWeight: 600,
                    display: "block",
                  }}
                >
                  ドメイン
                </span>
                <span
                  style={{
                    color: "var(--fg)",
                    fontFamily:
                      "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
                  }}
                >
                  {result.domain}
                </span>
              </div>
            </div>

            {/* ④ 折りたたみトグル（操作側要素 / AP-P21 (C): minHeight 40px） */}
            <button
              type="button"
              data-testid="details-toggle"
              aria-expanded={detailsOpen}
              onClick={() => setDetailsOpen((prev) => !prev)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "4px 6px",
                marginTop: "4px",
                minHeight: "40px", // 実装値 / AP-P21 操作側 40px 下限
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
              <span>詳細チェック項目</span>
              <span style={{ fontSize: "0.55rem" }}>
                {detailsOpen ? "▲" : "▼"}
              </span>
            </button>

            {/* ④ 詳細チェック内容（折りたたみ内） */}
            {detailsOpen && (
              <div
                data-testid="field-details"
                style={{
                  marginTop: "4px",
                  padding: "6px 10px",
                  borderRadius: "4px",
                  backgroundColor: "var(--bg-soft, var(--bg))",
                  border: "1px solid var(--border, var(--fg-soft))",
                  fontSize: "0.6rem",
                  color: "var(--fg-soft)",
                  lineHeight: 1.6,
                }}
              >
                <div
                  style={{
                    marginBottom: "4px",
                    fontWeight: 600,
                    color: "var(--fg)",
                  }}
                >
                  チェック済み項目
                </div>
                <div>✓ @ の数・位置</div>
                <div>✓ ローカルパート長（64文字以下）</div>
                <div>✓ ドメイン長（253文字以下）</div>
                <div>✓ 先頭・末尾のドット</div>
                <div>✓ 連続ドット</div>
                <div>✓ 使用可能文字（RFC 5321 簡易準拠）</div>
                <div>✓ TLD の存在</div>
                <div>✓ よくあるドメインのタイポ（13 パターン）</div>
                <div
                  style={{
                    marginTop: "6px",
                    paddingTop: "4px",
                    borderTop: "1px solid var(--border)",
                    fontSize: "0.58rem",
                    fontStyle: "italic",
                  }}
                >
                  ※
                  形式チェックのみ。実際のメール到達確認（MX/SMTP）は行いません。
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
          minHeight: "40px", // 実装値 / AP-P21 操作側 40px 下限
        }}
      >
        <Link
          href="/tools/email-validator"
          style={{
            fontSize: "0.7rem",
            color: "var(--accent)",
            textDecoration: "underline",
            textUnderlineOffset: "2px",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            minHeight: "40px",
          }}
        >
          詳細 →
        </Link>
      </div>
    </div>
  );
}

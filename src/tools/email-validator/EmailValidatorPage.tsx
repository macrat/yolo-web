"use client";

/**
 * EmailValidatorPage — email-validator 単一実装（フル機能のページ本体）
 *
 * cycle-225 T-6 再構築。Component.tsx を廃止し共通部品で組み直す。
 *
 * 個別論点解消:
 *   ①-4: 緑「有効」とタイポ提案の矛盾シグナル解消
 *     → suggestions が 1 件以上ある場合は「有効（要確認）」として warning 色で表示。
 *       タイポ提案セクションも warning 色で強調し、単純な「有効（緑）」との区別を明確にする。
 *   ②-15: コピーボタン削除確定（知る対象）
 *     → コピーボタンを実装しない。
 *
 * C-3 ライブリージョン:
 *   - role="status" aria-live="polite" の div 内に実テキストノードのサマリを置く
 *   - 「有効」「有効（要確認）」「無効」のサマリテキストが即時通知される
 *
 * 共通部品の使用:
 *   A-1: Input（@/components/Input）— メールアドレス入力欄
 *   A-4: ErrorMessage（@/components/ErrorMessage）— エラー表示
 *   A-8: ToolPageLayout — 省略（page.tsx 側で使用済み）
 *   A-2, A-3, A-5, A-6, A-7: N/A（セレクト/モード切替/ファイル/コピー/日付入力なし）
 */

import { useState } from "react";
import Input from "@/components/Input";
import ErrorMessage from "@/components/ErrorMessage";
import { validateEmail, type EmailValidationResult } from "./logic";
import styles from "./EmailValidatorPage.module.css";

/** 空入力のときの擬似結果（エラー表示なし） */
const EMPTY_STATE: EmailValidationResult = {
  valid: false,
  localPart: "",
  domain: "",
  errors: [],
  warnings: [],
  suggestions: [],
};

export default function EmailValidatorPage() {
  const [email, setEmail] = useState("");

  /** リアルタイムバリデーション: 空のときは EMPTY_STATE を使う（エラー非表示） */
  const result = email.trim() ? validateEmail(email) : EMPTY_STATE;

  /** タイポ提案の有無（①-4 矛盾シグナル解消の判定に使用） */
  const hasSuggestion = result.suggestions.length > 0;

  return (
    <div className={styles.container}>
      {/* 入力欄 */}
      <div className={styles.inputGroup}>
        <label htmlFor="email-input" className={styles.label}>
          メールアドレスを入力
        </label>
        <Input
          id="email-input"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          autoComplete="off"
          spellCheck={false}
          aria-describedby="email-live-region"
          error={!!(email.trim() && !result.valid)}
        />
      </div>

      {/*
       * ライブリージョン（C-3）:
       * role="status" aria-live="polite" で動的に通知。
       * 実テキストノードのサマリを直接配置（readOnly textarea ラップ禁止）。
       * 結果ボックス全体をライブリージョンとして兼用。
       */}
      <div
        id="email-live-region"
        role="status"
        aria-live="polite"
        aria-atomic="false"
        className={styles.resultsLive}
      >
        {/* 判定バッジ（入力があるときのみ表示） */}
        {email.trim() && (
          <>
            {/*
             * 判定バッジのテキスト「有効」「有効（要確認）」「無効」がライブリージョン内の
             * 実テキストノードとして機能し、C-3 要件を満たす。
             */}
            <div
              className={
                result.valid
                  ? hasSuggestion
                    ? styles.badgeValidWithSuggestion
                    : styles.badgeValid
                  : styles.badgeInvalid
              }
            >
              {/*
               * Lucide スタイル SVG アイコン（aria-hidden="true" で装飾専用宣言）。
               * DESIGN.md §3「絵文字不可・必要なら Lucide 線画アイコン」に準拠。
               * スクリーンリーダーはバッジのテキスト（「有効」「無効」等）のみを読み上げる。
               */}
              {result.valid ? (
                /* CheckCircle2 相当: 円 + チェックマーク（有効 / 有効（要確認）） */
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12l3 3 5-5" />
                </svg>
              ) : (
                /* XCircle 相当: 円 + バツ印（無効） */
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6" />
                  <path d="M9 9l6 6" />
                </svg>
              )}
              <span>
                {result.valid
                  ? hasSuggestion
                    ? "有効（要確認）"
                    : "有効"
                  : "無効"}
              </span>
            </div>

            {/* タイポ提案（①-4: warning 色で強調。コピーボタンなし＝②-15確定） */}
            {result.suggestions.length > 0 && (
              <div className={styles.suggestionPanel}>
                <h3 className={styles.suggestionTitle}>
                  もしかして（タイポの可能性）
                </h3>
                <ul className={styles.suggestionList}>
                  {result.suggestions.map((sug, i) => (
                    <li key={i}>{sug.replace("もしかして: ", "")}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* エラー表示（ErrorMessage 使用 / A-4）
                複数エラーがある場合は各エラーを個別の ErrorMessage として表示する。
                logic.ts が返すエラーメッセージはすべて日本語のため、そのまま渡す。 */}
            {result.errors.length > 0 && (
              <div className={styles.errorPanel}>
                <h3 className={styles.listTitle}>エラー</h3>
                {result.errors.map((err, i) => (
                  <ErrorMessage key={i} message={err} />
                ))}
              </div>
            )}

            {/* 警告リスト */}
            {result.warnings.length > 0 && (
              <div className={styles.warningPanel}>
                <h3 className={styles.listTitle}>警告</h3>
                <ul className={styles.warningList}>
                  {result.warnings.map((warn, i) => (
                    <li key={i}>{warn}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 分析パネル（ローカルパート / ドメイン） */}
            <div className={styles.analysisPanel}>
              <div className={styles.analysisItem}>
                <span className={styles.analysisLabel}>ローカルパート:</span>
                <span className={styles.analysisValue}>
                  {result.localPart || "(空)"}
                </span>
              </div>
              <div className={styles.analysisItem}>
                <span className={styles.analysisLabel}>ドメイン:</span>
                <span className={styles.analysisValue}>
                  {result.domain || "(空)"}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

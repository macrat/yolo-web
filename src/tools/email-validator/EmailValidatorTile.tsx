"use client";

/**
 * EmailValidatorTile — メールアドレスバリデーターの単一正典タイル
 *
 * cycle-228 T-10 で EmailValidatorPage.tsx を Panel ルートのタイルへ作り直したもの。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>。外部ラッパーなし。
 * - **1ツール 1 タイル = full のみ**: バリデーターには独立モードがないため
 *   full バリアントのみ。無理にひねり出さない。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する。
 * - **logic.ts 共有エンジン**: validateEmail / parseEmailParts が唯一のロジック源。
 *
 * ## variant
 *
 * - `"full"` (デフォルト・唯一): バリデーションロジックに独立モードがないため full のみ。
 *   入力欄＋valid/invalid バッジ＋エラー/警告/提案リスト＋解析結果の全機能を表示。
 *
 * ## 使い方
 *
 * ```tsx
 * // 道具箱や詳細ページから同一エクスポートを描画する（同一性の構造的保証）
 * <EmailValidatorTile variant="full" />
 * ```
 *
 * ## アクセシビリティ（C-3 準拠）
 *
 * - role="status" aria-live="polite" のライブリージョンに実テキストノードのサマリを置く
 * - バッジアイコン SVG は aria-hidden="true" で装飾専用を宣言
 * - ①-4: タイポ提案がある場合は「有効（要確認）」として警告色で表示し矛盾シグナルを解消
 * - ②-15: コピーボタンは実装しない（知る対象のため不要）
 */

import { useId, useState } from "react";
import Panel from "@/components/Panel";
import Input from "@/components/Input";
import ErrorMessage from "@/components/ErrorMessage";
import { validateEmail, type EmailValidationResult } from "./logic";
import styles from "./EmailValidatorTile.module.css";

/** variant prop: 表示バリエーション。バリデーターは full のみ。 */
export type EmailValidatorTileVariant = "full";

/** 空入力のときの擬似結果（エラー表示なし） */
const EMPTY_STATE: EmailValidationResult = {
  valid: false,
  localPart: "",
  domain: "",
  errors: [],
  warnings: [],
  suggestions: [],
};

export interface EmailValidatorTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * バリデーターはモード切替の概念がないため full のみ。
   */
  variant?: EmailValidatorTileVariant;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

export default function EmailValidatorTile({
  // variant は "full" 固定のため内部では使用しない（将来の拡張のためシグネチャに残す）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  variant = "full",
  as = "section",
  className,
}: EmailValidatorTileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合防止） ----------
  const uid = useId();
  const inputId = `${uid}-input`;
  const liveRegionId = `${uid}-live-region`;

  // ---------- State ----------
  const [email, setEmail] = useState("");

  // ---------- リアルタイムバリデーション（共有エンジン logic.ts を使用） ----------
  // 空のときは EMPTY_STATE を使い（エラー非表示）、入力があるときのみ検証する
  const result = email.trim() ? validateEmail(email) : EMPTY_STATE;

  /** タイポ提案の有無（①-4 矛盾シグナル解消の判定） */
  const hasSuggestion = result.suggestions.length > 0;

  // ---------- ハンドラ ----------
  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
  }

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）
  return (
    <Panel as={as} className={className}>
      {/* 入力欄 */}
      <div className={styles.inputGroup}>
        <label htmlFor={inputId} className={styles.label}>
          メールアドレスを入力
        </label>
        <Input
          id={inputId}
          type="text"
          value={email}
          onChange={handleEmailChange}
          placeholder="user@example.com"
          autoComplete="off"
          spellCheck={false}
          aria-describedby={liveRegionId}
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
        id={liveRegionId}
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
                <h2 className={styles.suggestionTitle}>
                  もしかして（タイポの可能性）
                </h2>
                <ul className={styles.suggestionList}>
                  {result.suggestions.map((sug, i) => (
                    <li key={i}>{sug.replace("もしかして: ", "")}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* エラー表示（ErrorMessage 使用）
                複数エラーがある場合は各エラーを個別の ErrorMessage として表示する。
                logic.ts が返すエラーメッセージはすべて日本語のため、そのまま渡す。 */}
            {result.errors.length > 0 && (
              <div className={styles.errorPanel}>
                <h2 className={styles.listTitle}>エラー</h2>
                {result.errors.map((err, i) => (
                  <ErrorMessage key={i} message={err} />
                ))}
              </div>
            )}

            {/* 警告リスト */}
            {result.warnings.length > 0 && (
              <div className={styles.warningPanel}>
                <h2 className={styles.listTitle}>警告</h2>
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
    </Panel>
  );
}

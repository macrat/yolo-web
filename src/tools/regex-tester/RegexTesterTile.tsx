"use client";

/**
 * RegexTesterTile — 正規表現テスター 単一正典タイル
 *
 * cycle-228 T-29: RegexTesterPage.tsx → Panel ルートのタイルへ再構築。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>（A-1）。
 * - **1ツール 1 variant**: 正規表現テスターはフル機能のみ提供（variant="full" 固定）。
 *   置換セクション等のトグルは UI 内部状態で管理（variant prop の設定差とは別）。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない（道具箱の複数インスタンス対応）。
 * - **ToolPageLayout 非依存**: "use client" で自己完結し、道具箱に単独で置ける。
 * - **Worker ライフサイクル**: useRegexWorker は useRef のみでインスタンスレベルの状態を持ち、
 *   モジュールスコープの共有状態を持たない。複数インスタンスが各自独立した Worker を持つ。
 *   アンマウント時に terminate + clearTimeout が呼ばれる（D-4）。
 *
 * ## variant
 *
 * - `"full"` (デフォルト・唯一): フル機能。フラグ群・マッチ結果・置換セクション含む。
 *   正規表現テスターは機能が一体不可分のため full のみ提供する。
 *
 * ## Worker ライフサイクルと複数インスタンス独立性
 *
 * useRegexWorker は useRef で activeWorkerRef / timeoutIdRef / debounceIdRef を
 * フック呼び出しスコープ内（インスタンスレベル）に保持している。
 * モジュールスコープの変数は使っていないため、複数インスタンスが同じページに存在しても
 * 各インスタンスが独立した Worker を持ち、互いに干渉しない。
 *
 * ## アクセシビリティ（ARIA）
 *
 * - 出力欄: role="status" aria-live="polite"（マッチ件数サマリ）
 * - マッチ一覧: role="region" aria-label="マッチ結果"（長文・aria-live なし）
 * - エラー表示: ErrorMessage（role="alert" 内包）
 * - サンプル選択フィードバック: aria-live="polite"（sr-only）
 * - useId で全 DOM id をインスタンス一意化（重複防止）
 */

import { useId, useRef, useState } from "react";
import Panel from "@/components/Panel";
import Textarea from "@/components/Textarea";
import Select from "@/components/Select";
import Input from "@/components/Input";
import ErrorMessage from "@/components/ErrorMessage";
import { useRegexWorker } from "./useRegexWorker";
import { REGEX_SAMPLE_INPUTS } from "./meta";
import styles from "./RegexTesterTile.module.css";

/**
 * フラグ4種の定義。
 * description はチェックボックスの下に常時表示する（UX是正(c): タッチ端末でも説明が見える）。
 */
const FLAG_OPTIONS = [
  {
    flag: "g",
    label: "g",
    description: "全てのマッチを検索（グローバル）",
  },
  {
    flag: "i",
    label: "i",
    description: "大文字小文字を区別しない",
  },
  {
    flag: "m",
    label: "m",
    description: "^ / $ を各行の先頭・末尾に適用",
  },
  {
    flag: "s",
    label: "s",
    description: ". が改行を含む全文字にマッチ（dotAll）",
  },
] as const;

/** デフォルトフラグ: g フラグのみ ON */
const DEFAULT_FLAGS = "g";

/** variant prop: full のみ（正規表現テスターは全機能が一体） */
export type RegexTesterTileVariant = "full";

export interface RegexTesterTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * 正規表現テスターはフル機能のみ提供する。
   */
  variant?: RegexTesterTileVariant;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

export default function RegexTesterTile({
  // variant は将来のバリエーション拡張のために受け取るが、
  // 正規表現テスターは full のみのため現時点では未参照
  variant: _v = "full", // eslint-disable-line @typescript-eslint/no-unused-vars
  as = "section",
  className,
}: RegexTesterTileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合防止） ----------
  const uid = useId();
  const sampleSelectId = `${uid}-sample-select`;
  const patternId = `${uid}-pattern`;
  const testStringId = `${uid}-test-string`;
  const replacementId = `${uid}-replacement`;
  const replaceResultLabelId = `${uid}-replace-result-label`;

  // ---------- State ----------
  /** 正規表現パターン（初期値: 空） */
  const [pattern, setPattern] = useState("");
  /** フラグ文字列 */
  const [flags, setFlags] = useState(DEFAULT_FLAGS);
  /** テスト文字列（初期値: 空） */
  const [testString, setTestString] = useState("");
  /** 置換文字列 */
  const [replacement, setReplacement] = useState("");
  /** 置換セクション表示フラグ */
  const [showReplace, setShowReplace] = useState(false);
  /** サンプル選択告知テキスト（aria-live で読み上げ） */
  const [sampleAnnounce, setSampleAnnounce] = useState("");
  /**
   * 告知テキスト連番（同一サンプル連続選択でも aria-live が毎回反応するための連番）
   * useRef で保持し cleanup 不要（整数インクリメントのみ）。
   */
  const sampleAnnounceCounterRef = useRef(0);

  // ---------- Worker（共有エンジン） ----------
  const { matchResult, replaceResult, isProcessing } = useRegexWorker({
    pattern,
    flags,
    testString,
    replacement,
    showReplace,
  });

  // ---------- ハンドラ ----------

  /** フラグトグルハンドラ */
  const toggleFlag = (flag: string) => {
    setFlags((prev) =>
      prev.includes(flag) ? prev.replace(flag, "") : prev + flag,
    );
  };

  /**
   * サンプル選択ハンドラ
   * 選択されたサンプルのパターン・フラグ・テスト文字列を各入力欄に投入する。
   * 同一サンプル連続選択でも aria-live が毎回反応するよう連番を付与する。
   */
  const handleSampleSelect = (indexStr: string) => {
    if (indexStr === "") return;
    const idx = parseInt(indexStr, 10);
    const sample = REGEX_SAMPLE_INPUTS[idx];
    if (!sample) return;
    setPattern(sample.pattern);
    setFlags(sample.flags);
    setTestString(sample.testText);
    sampleAnnounceCounterRef.current += 1;
    setSampleAnnounce(
      `「${sample.label}」のサンプルを投入しました ${sampleAnnounceCounterRef.current}`,
    );
  };

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）
  return (
    <Panel as={as} className={className}>
      <div className={styles.content}>
        {/* === サンプル選択（REGEX_SAMPLE_INPUTS 6種をドロップダウンで投入） === */}
        <div className={styles.field}>
          <label htmlFor={sampleSelectId} className={styles.label}>
            サンプルを試す
          </label>
          <Select
            id={sampleSelectId}
            aria-label="サンプルを選択"
            value=""
            onChange={(e) => handleSampleSelect(e.target.value)}
          >
            <option value="">— サンプルを選択 —</option>
            {REGEX_SAMPLE_INPUTS.map((sample, i) => (
              <option key={i} value={String(i)}>
                {sample.label}
              </option>
            ))}
          </Select>
          {/* サンプル選択フィードバック: sr-only の aria-live 領域で SR ユーザーに告知 */}
          <span
            data-testid="sample-announce"
            aria-live="polite"
            aria-atomic="true"
            className={styles.srOnly}
          >
            {sampleAnnounce}
          </span>
        </div>

        {/* === 正規表現パターン入力行（スラッシュ装飾 + フラグ表示） ===
            patternRow コンテナの :focus-within でフォーカスリングを提供（B-2 準拠）。
            patternInput 自体は outline:none（コンテナが代理）。 */}
        <div className={styles.field}>
          <label htmlFor={patternId} className={styles.label}>
            正規表現パターン
          </label>
          <div className={styles.patternRow}>
            <span className={styles.slash} aria-hidden="true">
              /
            </span>
            <input
              id={patternId}
              type="text"
              className={styles.patternInput}
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="パターンを入力（例: \\d+）"
              spellCheck={false}
              aria-label="正規表現パターン"
            />
            <span className={styles.slash} aria-hidden="true">
              /
            </span>
            <span className={styles.flagsDisplay} aria-hidden="true">
              {flags}
            </span>
          </div>
        </div>

        {/* === フラグチェックボックス群（説明を常時表示） ===
            title ツールチップはタッチ端末で発動しないため、常時表示の平易な説明を配置。
            複数選択の意味が強いため checkbox 可（B-9 準拠）。 */}
        <fieldset className={styles.flagsFieldset}>
          <legend className={styles.flagsLegend}>フラグ</legend>
          <div className={styles.flagsRow}>
            {FLAG_OPTIONS.map((opt) => (
              <label key={opt.flag} className={styles.flagLabel}>
                <input
                  type="checkbox"
                  checked={flags.includes(opt.flag)}
                  onChange={() => toggleFlag(opt.flag)}
                />
                <span className={styles.flagCode}>{opt.label}</span>
                <span className={styles.flagDesc}>{opt.description}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* === テスト文字列入力（Textarea 共通部品使用） === */}
        <div className={styles.field}>
          <label htmlFor={testStringId} className={styles.label}>
            テスト文字列
          </label>
          <Textarea
            id={testStringId}
            variant="mono"
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="テストするテキストを入力..."
            rows={6}
            spellCheck={false}
          />
        </div>

        {/* === 処理中インジケータ === */}
        {isProcessing && (
          <div className={styles.processing} role="status" aria-live="polite">
            処理中...
          </div>
        )}

        {/* === エラー表示（ErrorMessage 共通部品: role="alert" 内包） === */}
        {!isProcessing && matchResult?.error && (
          <ErrorMessage message={matchResult.error} />
        )}

        {/* === マッチ件数サマリ（C-3: role="status" aria-live="polite"） === */}
        <div role="status" aria-live="polite" aria-label="マッチ件数サマリ">
          {!isProcessing &&
            matchResult?.success &&
            matchResult.matches.length > 0 && (
              <span>マッチ: {matchResult.matches.length}件</span>
            )}
          {!isProcessing &&
            matchResult?.success &&
            pattern &&
            matchResult.matches.length === 0 &&
            testString && <span className={styles.noMatch}>マッチなし</span>}
        </div>

        {/* === マッチ一覧（長文のため role="region"、aria-live なし） === */}
        {!isProcessing &&
          matchResult?.success &&
          matchResult.matches.length > 0 && (
            <div
              className={styles.matchInfo}
              role="region"
              aria-label="マッチ結果"
            >
              <h3 className={styles.matchHeading}>
                マッチ結果: {matchResult.matches.length}件
              </h3>
              <div className={styles.matchList}>
                {matchResult.matches.slice(0, 50).map((m, i) => (
                  <div key={i} className={styles.matchItem}>
                    <span className={styles.matchIndex}>#{i + 1}</span>
                    <code className={styles.matchText}>{m.match}</code>
                    <span className={styles.matchPos}>位置: {m.index}</span>
                    {m.groups.length > 0 && (
                      <span className={styles.matchGroups}>
                        グループ:{" "}
                        {m.groups
                          .map((g, gi) => `$${gi + 1}="${g}"`)
                          .join(", ")}
                      </span>
                    )}
                  </div>
                ))}
                {matchResult.matches.length > 50 && (
                  <p className={styles.truncated}>
                    ...他 {matchResult.matches.length - 50} 件のマッチ
                  </p>
                )}
              </div>
            </div>
          )}

        {/* === 置換セクション === */}
        <div className={styles.replaceSection}>
          <button
            type="button"
            onClick={() => setShowReplace(!showReplace)}
            className={styles.toggleButton}
          >
            {showReplace ? "置換を非表示" : "置換を表示"}
          </button>

          {showReplace && (
            <>
              <div className={styles.field}>
                <label htmlFor={replacementId} className={styles.label}>
                  置換文字列
                </label>
                {/* Input 共通部品: border-radius/border色/focus outline/min-height(44px) が
                    DESIGN トークン準拠で自動的に揃う（B-7・C-1 準拠） */}
                <Input
                  id={replacementId}
                  type="text"
                  value={replacement}
                  onChange={(e) => setReplacement(e.target.value)}
                  placeholder="置換後の文字列（$1 などのグループ参照可）"
                  spellCheck={false}
                />
              </div>

              {/* 置換成功時: 置換結果
                  <span id> + <pre aria-labelledby> で紐付け（アクセシビリティ） */}
              {!isProcessing && replaceResult?.success && (
                <div className={styles.field}>
                  <span id={replaceResultLabelId} className={styles.label}>
                    置換結果
                  </span>
                  <pre
                    className={styles.replaceOutput}
                    aria-labelledby={replaceResultLabelId}
                  >
                    {replaceResult.output}
                  </pre>
                </div>
              )}

              {/* 置換エラー */}
              {!isProcessing && replaceResult?.error && (
                <ErrorMessage message={replaceResult.error} />
              )}
            </>
          )}
        </div>
      </div>
    </Panel>
  );
}

"use client";

/**
 * RegexTesterPage — 正規表現テスター 単一実装（フル機能ページ本体）
 *
 * cycle-225 / B-490 A群 単一タイル化による再構築。
 * Component.tsx のフル機能を共通部品（Textarea/ErrorMessage/ToolPageLayout）で組み直し。
 *
 * 個別論点（cycle-225.md）解消内容:
 * - ①-14: 既定空状態解消 → 初期状態は pattern / testString とも空
 * - ②-9: outline:none 解消 → patternInput の outline は patternRow の :focus-within で管理
 *         (patternInput 自体は outline:none だがコンテナがフォーカスリングを提供する)
 * - ②-4: 置換機能復元 → showReplace トグル + replacement 入力 + 置換結果表示
 * - ②-15: コピーボタン撤去確認 → regex-tester は「知る対象」のためコピーボタンなし
 *
 * UX是正（cycle-225 UXゲート指摘）:
 * - (a): meta.ts description を実態（マッチ一覧表示）に合わせる（meta.ts 側で対処）
 * - (b): REGEX_SAMPLE_INPUTS のサンプル投入機能を復元（機能後退是正）
 * - (c): フラグ説明を title ツールチップだけでなく常時表示テキストに変更
 * - (低): エラーメッセージに修正方法を添える（logic.ts 側で対処）
 *
 * タイマー AP-I11 準拠:
 * - debounceIdRef / timeoutIdRef / activeWorkerRef を useRef で保持
 * - useEffect cleanup で clearTimeout / worker.terminate を呼ぶ
 *
 * ARIA:
 * - 出力欄: role="status" aria-live="polite"（マッチ件数サマリ）
 * - マッチ一覧: role="region" aria-label="マッチ結果"（長文）
 * - エラー表示: ErrorMessage（role="alert" 内包）
 */

import { useRef, useState } from "react";
import Textarea from "@/components/Textarea";
import Select from "@/components/Select";
import Input from "@/components/Input";
import ErrorMessage from "@/components/ErrorMessage";
import { useRegexWorker } from "./useRegexWorker";
import { REGEX_SAMPLE_INPUTS } from "./meta";
import styles from "./RegexTesterPage.module.css";

/**
 * フラグ4種の定義。
 * description は title ツールチップのみでなく、チェックボックスの下に常時表示する（UX是正(c)）。
 * タッチ端末では title ツールチップは発動しないため、常時表示の平易な説明が必要。
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

export default function RegexTesterPage() {
  /** 正規表現パターン（初期値: 空 = ①-14 既定空状態解消） */
  const [pattern, setPattern] = useState("");
  /** フラグ文字列 */
  const [flags, setFlags] = useState(DEFAULT_FLAGS);
  /** テスト文字列（初期値: 空 = ①-14 既定空状態解消） */
  const [testString, setTestString] = useState("");
  /** 置換文字列 */
  const [replacement, setReplacement] = useState("");
  /** 置換セクション表示フラグ */
  const [showReplace, setShowReplace] = useState(false);
  /** サンプル選択告知テキスト（aria-live で読み上げ） */
  const [sampleAnnounce, setSampleAnnounce] = useState("");
  /**
   * 告知テキスト連番（指摘3対応）
   * 同一サンプルを連続で選び直したとき、state 文字列が同一になって
   * React が再レンダーをスキップし、aria-live が反応しなくなる問題を防ぐ。
   * 告知テキストに末尾不可視連番を付与することで毎回 state が変化する。
   * useRef で保持し、cleanup 不要（整数インクリメントのみ）。
   */
  const sampleAnnounceCounterRef = useRef(0);

  const { matchResult, replaceResult, isProcessing } = useRegexWorker({
    pattern,
    flags,
    testString,
    replacement,
    showReplace,
  });

  /** フラグトグルハンドラ */
  const toggleFlag = (flag: string) => {
    setFlags((prev) =>
      prev.includes(flag) ? prev.replace(flag, "") : prev + flag,
    );
  };

  /**
   * サンプル選択ハンドラ（UX是正(b): REGEX_SAMPLE_INPUTS を UI から参照）
   * 選択されたサンプルのパターン・フラグ・テスト文字列を各入力欄に投入する。
   * reviewer指摘3: 選択行為のフィードバックとして aria-live でサンプル名を告知する。
   */
  const handleSampleSelect = (indexStr: string) => {
    if (indexStr === "") return;
    const idx = parseInt(indexStr, 10);
    const sample = REGEX_SAMPLE_INPUTS[idx];
    if (!sample) return;
    setPattern(sample.pattern);
    setFlags(sample.flags);
    setTestString(sample.testText);
    // 指摘3: 連番を付与して同一サンプル連続選択でも aria-live が毎回反応するようにする。
    // 末尾の連番は視覚的に表示されるが、.srOnly で非表示のため来訪者の目には触れない。
    sampleAnnounceCounterRef.current += 1;
    setSampleAnnounce(
      `「${sample.label}」のサンプルを投入しました ${sampleAnnounceCounterRef.current}`,
    );
  };

  return (
    <div className={styles.container}>
      {/* === サンプル選択（UX是正(b): REGEX_SAMPLE_INPUTS 投入機能復元） ===
          REGEX_SAMPLE_INPUTS（6種）を Select で選択するとパターン・フラグ・テスト文字列を一括投入。
          meta.ts の SSoT を UI から直接参照し、デッドコード状態を解消する。 */}
      <div className={styles.field}>
        <label htmlFor="regex-sample-select" className={styles.label}>
          サンプルを試す
        </label>
        <Select
          id="regex-sample-select"
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
        {/* reviewer指摘3: サンプル選択フィードバック — 使い捨て投入設計でも SR ユーザーに
            「どのサンプルを投入したか」を aria-live="polite" で一度だけ告知する。
            視覚的には select が「— サンプルを選択 —」に戻るため、告知テキストは
            スクリーンリーダー専用に sr-only で非表示にする。 */}
        {/* aria-live のみ（role="status" は付与しない）。
            ページ内に role="status" は1つ（マッチ件数サマリ）に統一し、
            既存テストの getByRole("status") が複数ヒットしないようにする。
            aria-live="polite" だけでも SR は読み上げる。 */}
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
          ②-9 outline:none 解消: patternRow コンテナの :focus-within でフォーカスリングを提供。
          patternInput 自体は outline:none（コンテナが代理）。この設計はコンテナ全体に
          フォーカスリングを表示する正規表現エディタの慣習的 UX である。 */}
      <div className={styles.field}>
        <label htmlFor="regex-pattern" className={styles.label}>
          正規表現パターン
        </label>
        <div className={styles.patternRow}>
          <span className={styles.slash} aria-hidden="true">
            /
          </span>
          <input
            id="regex-pattern"
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

      {/* === フラグチェックボックス群（UX是正(c): 説明を常時表示） ===
          title ツールチップはタッチ端末で発動しないため、各フラグの説明を
          チェックボックスの下に常時表示テキストとして配置する。 */}
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
        <label htmlFor="regex-test-string" className={styles.label}>
          テスト文字列
        </label>
        <Textarea
          id="regex-test-string"
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

      {/* === エラー表示（ErrorMessage 共通部品使用） === */}
      {!isProcessing && matchResult?.error && (
        <ErrorMessage message={matchResult.error} />
      )}

      {/* === マッチ結果表示 ===
          role="status" aria-live="polite": 動的更新をスクリーンリーダーへ通知 */}
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
                      {m.groups.map((g, gi) => `$${gi + 1}="${g}"`).join(", ")}
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

      {/* === 置換セクション（②-4 置換機能復元） === */}
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
              <label htmlFor="regex-replacement" className={styles.label}>
                置換文字列
              </label>
              {/* 指摘2: 自作 <input> → Input 共通部品に置換。
                  border-radius/border色/focus outline/min-height(44px) が
                  DESIGN トークン準拠で自動的に揃う。
                  replaceInput に独自装飾要件がないため、共通部品で完全代替可能。 */}
              <Input
                id="regex-replacement"
                type="text"
                value={replacement}
                onChange={(e) => setReplacement(e.target.value)}
                placeholder="置換後の文字列（$1 などのグループ参照可）"
                spellCheck={false}
              />
            </div>

            {/* 置換成功時: 置換結果
                reviewer指摘1: ラベル <span> に id を付与し、<pre> に aria-labelledby で
                紐付ける。フォームの他要素（パターン/テスト文字列/置換文字列）は
                <label htmlFor> で紐付けられており、置換「結果」だけが無関連になっていた
                整合性の問題を解消する。 */}
            {!isProcessing && replaceResult?.success && (
              <div className={styles.field}>
                <span id="replace-result-label" className={styles.label}>
                  置換結果
                </span>
                <pre
                  className={styles.replaceOutput}
                  aria-labelledby="replace-result-label"
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
  );
}

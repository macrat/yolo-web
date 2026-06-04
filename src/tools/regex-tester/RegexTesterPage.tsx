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
 * タイマー AP-I11 準拠:
 * - debounceIdRef / timeoutIdRef / activeWorkerRef を useRef で保持
 * - useEffect cleanup で clearTimeout / worker.terminate を呼ぶ
 *
 * ARIA:
 * - 出力欄: role="status" aria-live="polite"（マッチ件数サマリ）
 * - マッチ一覧: role="region" aria-label="マッチ結果"（長文）
 * - エラー表示: ErrorMessage（role="alert" 内包）
 */

import { useState } from "react";
import Textarea from "@/components/Textarea";
import ErrorMessage from "@/components/ErrorMessage";
import { useRegexWorker } from "./useRegexWorker";
import styles from "./RegexTesterPage.module.css";

/** フラグ4種の定義（Component.tsx から継承） */
const FLAG_OPTIONS = [
  { flag: "g", label: "g (全体)", description: "全てのマッチを検索" },
  { flag: "i", label: "i (大小無視)", description: "大文字小文字を区別しない" },
  { flag: "m", label: "m (複数行)", description: "^/$を各行に適用" },
  { flag: "s", label: "s (dotAll)", description: ".が改行にもマッチ" },
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

  return (
    <div className={styles.container}>
      {/* === 正規表現パターン入力行（スラッシュ装飾 + フラグ表示） ===
          ②-9 outline:none 解消: patternRow コンテナの :focus-within でフォーカスリングを提供。
          patternInput 自体は outline:none（コンテナが代理）。この設計はコンテナ全体に
          フォーカスリングを表示する正規表現エディタの慣習的 UX である。 */}
      <div className={styles.patternRow}>
        <span className={styles.slash} aria-hidden="true">
          /
        </span>
        <input
          type="text"
          className={styles.patternInput}
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="正規表現パターン"
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

      {/* === フラグチェックボックス群 === */}
      <div className={styles.flagsRow} role="group" aria-label="正規表現フラグ">
        {FLAG_OPTIONS.map((opt) => (
          <label
            key={opt.flag}
            className={styles.flagLabel}
            title={opt.description}
          >
            <input
              type="checkbox"
              checked={flags.includes(opt.flag)}
              onChange={() => toggleFlag(opt.flag)}
              aria-label={opt.flag}
            />
            {opt.label}
          </label>
        ))}
      </div>

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
              <input
                id="regex-replacement"
                type="text"
                value={replacement}
                onChange={(e) => setReplacement(e.target.value)}
                placeholder="置換後の文字列（$1 などのグループ参照可）"
                spellCheck={false}
                className={styles.replaceInput}
              />
            </div>

            {/* 置換成功時: 置換結果 */}
            {!isProcessing && replaceResult?.success && (
              <div className={styles.field}>
                <span className={styles.label}>置換結果</span>
                <pre className={styles.replaceOutput}>
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

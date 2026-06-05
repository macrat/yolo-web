"use client";

/**
 * TextReplacePage — テキスト置換ツール 単一実装（フル機能のページ本体）
 *
 * cycle-225 / B-490 T-6 で Component.tsx から再構築。
 * 共通部品8種を必須再利用。DESIGN トークン準拠・WCAG AA 対応。
 *
 * 個別論点の解消:
 * - ②-4: 正規表現機能復元（ToggleSwitch で useRegex を切り替え可能に）
 * - ①-13: 空状態の正しい処理（入力空時は結果空、コピーボタン disabled）
 * - ①-20: placeholder の仕様詰め込み解消（簡素な placeholder に整理）
 * - ③-6(1): 省略オプション（useRegex / caseSensitive / globalReplace）をトグルで提供
 * - ①-21: リアルタイム変換（useMemo で即時反映）
 * - T-4b: コピーボタンあり（変換系・持ち帰り対象）
 * - A-4: ErrorMessage に渡すエラー文言は日本語化済み（logic.ts 側の英語フォールバックも修正済み）
 * - C-3: ライブリージョン（role="status"）内に実テキストノードのサマリを配置
 *        （readOnly textarea のラップではなく、textarea の外に置いた summary div）
 */

import { useState, useMemo } from "react";
import { replaceText, type ReplaceOptions } from "./logic";
import Textarea from "@/components/Textarea";
import Input from "@/components/Input";
import ErrorMessage from "@/components/ErrorMessage";
import ToggleSwitch from "@/components/ToggleSwitch";
import Button from "@/components/Button";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import styles from "./TextReplacePage.module.css";

export default function TextReplacePage() {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [replacement, setReplacement] = useState("");
  const [options, setOptions] = useState<ReplaceOptions>({
    useRegex: false,
    caseSensitive: true,
    globalReplace: true,
  });

  const { copy, copiedKey } = useCopyToClipboard();

  // リアルタイム変換（①-21）
  const result = useMemo(
    () => replaceText(input, search, replacement, options),
    [input, search, replacement, options],
  );

  // エラー文言の日本語化（A-4 要件）
  // logic.ts の RegExp エラーはブラウザが英語で返すため日本語に変換する
  function toJapaneseError(rawError: string | undefined): string | undefined {
    if (!rawError) return undefined;
    // 正規表現パターンが無効な場合のブラウザ標準エラー
    if (
      rawError.includes("Invalid regular expression") ||
      rawError.toLowerCase().includes("invalid")
    ) {
      return "正規表現パターンが無効です。パターンを確認してください。";
    }
    // logic.ts が既に日本語で返している場合はそのまま使用
    return rawError;
  }

  const errorMessage = toJapaneseError(result.error);

  // サマリテキスト（C-3 ライブリージョンに入れる実テキストノード）
  function getSummaryText(): string {
    if (result.error) return "";
    if (!search) return "";
    if (!input) return "";
    return `${result.count}件置換しました`;
  }

  const summaryText = getSummaryText();

  return (
    <div className={styles.container}>
      {/* 入力テキスト */}
      <div className={styles.field}>
        <label htmlFor="text-replace-input" className={styles.label}>
          入力テキスト
        </label>
        <Textarea
          id="text-replace-input"
          variant="mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="置換するテキストを入力"
          rows={8}
          spellCheck={false}
        />
      </div>

      {/* 検索文字列 / 置換文字列 */}
      <div className={styles.searchRow}>
        <div className={styles.field}>
          <label htmlFor="text-replace-search" className={styles.label}>
            検索文字列
          </label>
          <Input
            id="text-replace-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              options.useRegex ? "正規表現パターン" : "検索する文字列"
            }
            spellCheck={false}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="text-replace-replacement" className={styles.label}>
            置換文字列
          </label>
          <Input
            id="text-replace-replacement"
            type="text"
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            placeholder="置換後の文字列"
            spellCheck={false}
          />
        </div>
      </div>

      {/* オプション（③-6(1) 省略オプションのタイル提供） */}
      <div className={styles.optionsRow}>
        <ToggleSwitch
          label="正規表現"
          checked={options.useRegex}
          onChange={(e) =>
            setOptions((prev) => ({ ...prev, useRegex: e.target.checked }))
          }
        />
        <ToggleSwitch
          label="大文字小文字を区別"
          checked={options.caseSensitive}
          onChange={(e) =>
            setOptions((prev) => ({
              ...prev,
              caseSensitive: e.target.checked,
            }))
          }
        />
        <ToggleSwitch
          label="すべて置換"
          checked={options.globalReplace}
          onChange={(e) =>
            setOptions((prev) => ({
              ...prev,
              globalReplace: e.target.checked,
            }))
          }
        />
      </div>

      {/* 正規表現モード時の補足説明 */}
      {options.useRegex && (
        <div className={styles.warning} role="note" data-testid="regex-hint">
          <p className={styles.warningLine}>
            正規表現モードがオンです。分からなければオフのまま通常置換できます。
          </p>
          <p className={styles.warningLine}>
            よく使うパターン例：<code>\d+</code>（数字の連続）、<code>\s+</code>
            （空白・タブ）、<code>[A-Za-z]+</code>（英字）。 置換文字列で{" "}
            <code>$1</code> と書くと括弧内（キャプチャグループ）を参照できます。
          </p>
        </div>
      )}

      {/* エラー表示（A-4: ErrorMessage 使用・日本語化済み） */}
      {errorMessage && <ErrorMessage message={errorMessage} />}

      {/* 置換結果 */}
      <div className={styles.field}>
        <div className={styles.outputHeader}>
          <label htmlFor="text-replace-output" className={styles.label}>
            置換結果
          </label>
          {/* コピーボタン（T-4b: 変換系はコピーあり。出力空のとき disabled） */}
          <Button
            size="small"
            onClick={() => copy(result.output)}
            disabled={!result.output}
          >
            {copiedKey ? COPIED_LABEL : "コピー"}
          </Button>
        </div>
        <Textarea
          id="text-replace-output"
          variant="mono"
          value={result.output}
          readOnly
          placeholder="結果がここに表示されます"
          rows={8}
        />
      </div>

      {/*
        C-3 ライブリージョン: 実テキストノードのサマリを配置。
        readOnly textarea を role="status" でラップするだけでは
        スクリーンリーダーに読まれないため、独立した div に配置する。
      */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={styles.statusRegion}
      >
        {summaryText}
      </div>
    </div>
  );
}

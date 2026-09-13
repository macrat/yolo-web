"use client";

/**
 * TextReplaceTile — テキスト置換ツールの単一正典タイル
 *
 * cycle-228 T-5 で TextReplacePage.tsx を Panel ルートのタイルへ再実装。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>。外部ラッパーなし。
 * - **1ツール 1 タイル**: text-replace は正規表現モード等の「設定差」で表現できる
 *   独立したモードがないため variant は "full" のみ。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない（A-6 要件）。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する（"use client" 自己完結）。
 * - **logic.ts 共有エンジン**: replaceText が唯一のロジック源。再実装・改変禁止。
 *
 * ## variant
 *
 * - `"full"` (デフォルト): 検索/置換 Input＋3 ToggleSwitch（正規表現/大小文字/全置換）
 *   ＋置換件数表示の完全な UI。
 *   text-replace は logic に独立した出力モードがないため full のみで良い。
 *
 * ## 使い方
 *
 * ```tsx
 * // 道具箱や詳細ページから同一エクスポートを描画する（同一性の構造的保証）
 * <TextReplaceTile variant="full" />
 * ```
 *
 * ## アクセシビリティ（C-3 準拠）
 *
 * - 出力 textarea は readOnly で表示専用
 * - role="status" aria-live="polite" の div にサマリテキストを置く
 *   （readOnly textarea は値変化をスクリーンリーダーが読み上げないため）
 * - エラー（不正な正規表現等）は日本語で ErrorMessage（role="alert"）に表示
 */

import { useId, useMemo, useState } from "react";
import Panel from "@/components/Panel";
import Button from "@/components/Button";
import Textarea from "@/components/Textarea";
import Input from "@/components/Input";
import ErrorMessage from "@/components/ErrorMessage";
import ToggleSwitch from "@/components/ToggleSwitch";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import { replaceText, type ReplaceOptions } from "./logic";
import styles from "./TextReplaceTile.module.css";

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type TextReplaceTileVariant = "full";

export interface TextReplaceTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": 検索/置換Input＋3 ToggleSwitch（正規表現/大小文字/全置換）＋置換件数表示
   *   text-replace は logic に独立した出力モードがないため full のみ。
   */
  variant?: TextReplaceTileVariant;
  /** 初期入力値（デフォルト: ""） */
  defaultInput?: string;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

/** エラー文言を日本語に変換する（A-4 準拠: 英語生エラーを露出しない） */
function toJapaneseError(rawError: string | undefined): string | undefined {
  if (!rawError) return undefined;
  // ブラウザが返す正規表現エラーは英語のため日本語に変換する
  if (
    rawError.includes("Invalid regular expression") ||
    rawError.toLowerCase().includes("invalid")
  ) {
    return "正規表現パターンが無効です。パターンを確認してください。";
  }
  // logic.ts が既に日本語で返している場合はそのまま使用
  return rawError;
}

export default function TextReplaceTile({
  variant = "full",
  defaultInput = "",
  as = "section",
  className,
}: TextReplaceTileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合防止） ----------
  // A-6: 現行 TextReplacePage.tsx のハードコード id（source-text / search-input 等）を
  // useId ベースに移行する
  const uid = useId();
  const inputId = `${uid}-input`;
  const searchId = `${uid}-search`;
  const replacementId = `${uid}-replacement`;
  const outputId = `${uid}-output`;

  // ---------- State ----------
  const [input, setInput] = useState(defaultInput);
  const [search, setSearch] = useState("");
  const [replacement, setReplacement] = useState("");
  const [options, setOptions] = useState<ReplaceOptions>({
    useRegex: false,
    caseSensitive: true,
    globalReplace: true,
  });

  const { copy, copiedKey } = useCopyToClipboard();

  // ---------- リアルタイム変換（共有エンジン logic.ts を使用・再実装禁止） ----------
  const result = useMemo(
    () => replaceText(input, search, replacement, options),
    [input, search, replacement, options],
  );

  const errorMessage = toJapaneseError(result.error);

  // ライブリージョン用サマリテキスト（C-3: 実テキストノードのサマリ）
  const statusSummary = (() => {
    if (result.error) return "";
    if (!search) return "";
    if (!input) return "";
    return `${result.count}件置換しました`;
  })();

  const output = result.error ? "" : result.output;

  // ---------- ハンドラ ----------
  async function handleCopy() {
    if (!output) return;
    await copy(output);
  }

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）
  // variant は "full" のみだが、将来の拡張に備えて variant prop は残す
  void variant; // 現在は full のみ、将来のバリエーション追加時に使用

  return (
    <Panel as={as} className={className}>
      {/* 入力テキスト */}
      <div className={styles.field}>
        <label htmlFor={inputId} className={styles.fieldLabel}>
          入力テキスト
        </label>
        <Textarea
          id={inputId}
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
          <label htmlFor={searchId} className={styles.fieldLabel}>
            検索文字列
          </label>
          <Input
            id={searchId}
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
          <label htmlFor={replacementId} className={styles.fieldLabel}>
            置換文字列
          </label>
          <Input
            id={replacementId}
            type="text"
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            placeholder="置換後の文字列"
            spellCheck={false}
          />
        </div>
      </div>

      {/* オプション（3 ToggleSwitch: 正規表現・大文字小文字区別・全置換） */}
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

      {/* 正規表現モード時の補足説明（平易な日本語・G-2 要件） */}
      {options.useRegex && (
        <div className={styles.regexHint} role="note" data-testid="regex-hint">
          <p className={styles.regexHintLine}>
            正規表現モードがオンです。分からなければオフのまま通常置換できます。
          </p>
          <p className={styles.regexHintLine}>
            よく使うパターン例：<code>\d+</code>（数字の連続）、<code>\s+</code>
            （空白・タブ）、<code>[A-Za-z]+</code>（英字）。 置換文字列で{" "}
            <code>$1</code> と書くと括弧内（キャプチャグループ）を参照できます。
          </p>
        </div>
      )}

      {/* エラー表示（A-4 準拠: ErrorMessage・日本語化済み） */}
      {errorMessage && <ErrorMessage message={errorMessage} />}

      {/* 出力欄 */}
      <div className={styles.field}>
        <div className={styles.outputHeader}>
          <label htmlFor={outputId} className={styles.fieldLabel}>
            置換結果
          </label>
          {/* コピーボタン（出力空のとき disabled） */}
          <Button
            size="small"
            onClick={handleCopy}
            disabled={!output}
            aria-label={copiedKey ? COPIED_LABEL : "コピー"}
          >
            {copiedKey ? COPIED_LABEL : "コピー"}
          </Button>
        </div>

        {/*
          C-3 準拠: readOnly textarea は role="status" 対象外。
          別途サマリ div を置いてスクリーンリーダーへ通知する。
          出力 textarea の外（前）に置くことで DOM 順も正しい。
        */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={styles.statusSummary}
        >
          {statusSummary}
        </div>

        <Textarea
          id={outputId}
          variant="mono"
          value={output}
          readOnly
          placeholder="結果がここに表示されます"
          rows={8}
        />
      </div>
    </Panel>
  );
}

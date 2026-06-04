"use client";

import { useState, useMemo, useCallback } from "react";
import Textarea from "@/components/Textarea";
import SegmentedControl from "@/components/SegmentedControl";
import ErrorMessage from "@/components/ErrorMessage";
import Button from "@/components/Button";
import ToggleSwitch from "@/components/ToggleSwitch";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import { encodeBase64, decodeBase64, toUrlSafe } from "./logic";
import styles from "./Base64Tool.module.css";

type Mode = "encode" | "decode";

/** エンコード/デコードのモード切替オプション */
const MODE_OPTIONS: { label: string; value: Mode }[] = [
  { label: "エンコード", value: "encode" },
  { label: "デコード", value: "decode" },
];

/**
 * Base64Tool — Base64エンコード・デコードツールのフル機能UI（単一実装）。
 *
 * 個別論点（①-7）: URL-safe Base64（RFC 4648 section 5）に対応。
 * - エンコード時: URL-safe オプション ON で '+' → '-'、'/' → '_' を出力
 * - デコード時: URL-safe 文字 '-'/'_' およびパディングなしを自動認識（logic.ts 内包）
 *
 * C-3 ライブリージョン: 出力 textarea の外に短いサマリを
 * role="status" aria-live="polite" で置き、変換完了をスクリーンリーダーに通知。
 *
 * リアルタイム変換（①-21）: 手動「変換」ボタンを廃止し、
 * 入力・モード・URL-safe の変化で即座に再計算する。
 */
export default function Base64Tool() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const [urlSafe, setUrlSafe] = useState(false);

  const { copy, copiedKey } = useCopyToClipboard();

  // 入力・モード・URL-safe が変わるたびに変換結果を再計算（リアルタイム変換 ①-21）
  const result = useMemo(() => {
    if (input === "") return null;
    if (mode === "encode") {
      const r = encodeBase64(input);
      if (!r.success) return r;
      return {
        success: true as const,
        output: urlSafe ? toUrlSafe(r.output) : r.output,
        error: undefined,
      };
    }
    // デコード: logic.ts が URL-safe 文字とパディング欠損を自動正規化
    return decodeBase64(input);
  }, [input, mode, urlSafe]);

  // エラー文言の日本語変換（A-4: ErrorMessage には必ず日本語を渡す）
  const errorMessage =
    result?.success === false
      ? "不正な Base64 文字列です。入力内容を確認してください。"
      : undefined;

  const outputValue = result?.success ? result.output : "";
  const isEmpty = outputValue === "";

  // サマリテキスト（C-3: ライブリージョンに実テキストノードを置く）
  const summaryText = useMemo(() => {
    if (input === "" || result === null) return "";
    if (result.success === false) return "変換エラー";
    return mode === "encode" ? "エンコード完了" : "デコード完了";
  }, [input, result, mode]);

  const handleCopy = useCallback(async () => {
    if (isEmpty) return;
    await copy(outputValue);
  }, [copy, outputValue, isEmpty]);

  const handleModeChange = useCallback((v: string) => {
    setMode(v as Mode);
  }, []);

  const inputLabel = mode === "encode" ? "テキスト入力" : "Base64入力";
  const outputLabel = mode === "encode" ? "Base64出力" : "テキスト出力";
  const inputPlaceholder =
    mode === "encode"
      ? "エンコードするテキストを入力..."
      : "デコードするBase64文字列を入力（標準形・URL-safe形・パディングなし、いずれも対応）...";

  return (
    <div className={styles.container}>
      {/* モード切替（SegmentedControl。C-2: aria-label 必須） */}
      <SegmentedControl
        options={MODE_OPTIONS}
        value={mode}
        onChange={handleModeChange}
        aria-label="変換モード"
      />

      {/* URL-safe オプション（エンコード専用。デコード時は自動認識のため非表示）
          デコードモードでトグルを操作可能なまま表示すると、操作しても出力が変わらない
          「死んだコントロール」になり来訪者が混乱するため、encode 時のみ描画する。
          DESIGN.md §5: 単一の ON/OFF トグルは ToggleSwitch を使う（②-11） */}
      {mode === "encode" && (
        <div className={styles.optionRow}>
          <ToggleSwitch
            label="URL-safe 形式で出力"
            checked={urlSafe}
            onChange={(e) => setUrlSafe(e.target.checked)}
            aria-describedby="url-safe-desc"
          />
          <span id="url-safe-desc" className={styles.optionDesc}>
            （+ → -, / → _。JWT や URL クエリ向け）
          </span>
        </div>
      )}

      {/* 入力欄（A-1: Textarea 共通部品を使用） */}
      <div className={styles.field}>
        <label htmlFor="base64-input" className={styles.label}>
          {inputLabel}
        </label>
        <Textarea
          id="base64-input"
          variant="mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={inputPlaceholder}
          rows={6}
          spellCheck={false}
        />
      </div>

      {/* エラー表示（A-4: 日本語メッセージを ErrorMessage 経由で表示） */}
      {errorMessage && <ErrorMessage message={errorMessage} />}

      {/* 出力欄（A-1: Textarea 共通部品を使用） */}
      <div className={styles.field}>
        <div className={styles.outputHeader}>
          <label htmlFor="base64-output" className={styles.label}>
            {outputLabel}
          </label>
          {/* コピーボタン（T-4b: 変換系はコピーあり・A-6: useCopyToClipboard 使用） */}
          <Button
            size="small"
            onClick={handleCopy}
            disabled={isEmpty}
            aria-label="出力をコピー"
          >
            {copiedKey ? COPIED_LABEL : "コピー"}
          </Button>
        </div>
        <Textarea
          id="base64-output"
          variant="mono"
          value={outputValue}
          readOnly
          placeholder="結果がここに表示されます"
          rows={6}
        />
        {/* C-3: ライブリージョン（実テキストノードのサマリ）。
            readOnly textarea の外に置く。SR が変換完了を読み上げる。 */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={styles.liveRegion}
        >
          {summaryText}
        </div>
      </div>
    </div>
  );
}

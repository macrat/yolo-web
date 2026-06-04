"use client";

import { useState } from "react";
import SegmentedControl from "@/components/SegmentedControl";
import Textarea from "@/components/Textarea";
import Button from "@/components/Button";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import { convert, type ConvertMode, type ConvertOptions } from "./logic";
import styles from "./FullwidthConverterPage.module.css";

/** モード選択の定義 */
const MODE_OPTIONS: { label: string; value: ConvertMode }[] = [
  { label: "半角に変換", value: "toHalfwidth" },
  { label: "全角に変換", value: "toFullwidth" },
];

/** 変換オプション名の日本語ラベル */
const OPTION_LABELS: Record<keyof ConvertOptions, string> = {
  alphanumeric: "英数字",
  katakana: "カタカナ",
  symbol: "記号・スペース",
};

/** オプションのキーを固定順で列挙（React key安定のため） */
const OPTION_KEYS = ["alphanumeric", "katakana", "symbol"] as const;

/**
 * FullwidthConverterPage — 全角半角変換ツールの単一実装（フル機能）。
 *
 * 機能:
 * - モード切替: 半角に変換 / 全角に変換（SegmentedControl）
 * - オプション: 英数字 / カタカナ / 記号・スペース を個別ON/OFF
 * - 入力欄: テキスト入力（Textarea）
 * - 出力欄: 変換結果表示（Textarea readOnly）
 * - コピーボタン: 変換結果をクリップボードへ（useCopyToClipboard + COPIED_LABEL）
 * - ライブリージョン: role="status" aria-live="polite" で変換サマリをアナウンス
 *
 * 個別論点:
 * - ①-11: 全ON固定 → オプション個別ON/OFFをデフォルト全ONで提供
 * - ①-13: 空状態 → 初期状態では出力が空・コピーボタンはdisabled
 * - ①-21: 手動変換ボタン → リアルタイム変換（入力即反映）
 */
export default function FullwidthConverterPage() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ConvertMode>("toHalfwidth");
  const [options, setOptions] = useState<ConvertOptions>({
    alphanumeric: true,
    katakana: true,
    symbol: true,
  });

  const { copy, copiedKey } = useCopyToClipboard();

  // リアルタイム変換（①-21: 手動変換ボタンなし）
  const output = convert(input, mode, options);

  // ライブリージョン用のサマリテキスト（C-3要件）
  // 変換後に文字数を通知する実テキストノードを提供
  const summaryText =
    output.length > 0 ? `変換しました（${output.length}文字）` : "";

  function handleModeChange(value: string): void {
    setMode(value as ConvertMode);
  }

  function handleOptionChange(key: keyof ConvertOptions): void {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleCopy(): Promise<void> {
    if (!output) return;
    await copy(output);
  }

  return (
    <div className={styles.container}>
      {/* モード切替（SegmentedControl: C-2 aria-label必須） */}
      <SegmentedControl
        options={MODE_OPTIONS}
        value={mode}
        onChange={handleModeChange}
        aria-label="変換モード"
      />

      {/* 変換オプション（英数字・カタカナ・記号を個別ON/OFF: ①-11解消） */}
      <div className={styles.optionsRow} role="group" aria-label="変換対象">
        {OPTION_KEYS.map((key) => (
          <label key={key} className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={options[key]}
              onChange={() => handleOptionChange(key)}
            />
            {OPTION_LABELS[key]}
          </label>
        ))}
      </div>

      {/* 入力欄 */}
      <div className={styles.field}>
        <label htmlFor="fullwidth-input" className={styles.fieldLabel}>
          入力テキスト
        </label>
        <Textarea
          id="fullwidth-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="変換するテキストを入力..."
          rows={6}
          spellCheck={false}
        />
      </div>

      {/* 出力欄 */}
      <div className={styles.field}>
        <div className={styles.outputHeader}>
          <label htmlFor="fullwidth-output" className={styles.fieldLabel}>
            変換結果
          </label>
          {/* コピーボタン（T-4b確定: 変換系はコピーあり） */}
          <Button
            size="small"
            onClick={handleCopy}
            disabled={!output}
            aria-label={copiedKey ? COPIED_LABEL : "コピー"}
          >
            {copiedKey ? COPIED_LABEL : "コピー"}
          </Button>
        </div>
        <Textarea
          id="fullwidth-output"
          value={output}
          readOnly
          placeholder={input ? "" : "結果がここに表示されます"}
          rows={6}
        />
      </div>

      {/*
       * C-3: ライブリージョン — 実テキストノードのサマリを配置。
       * readOnly textarea はフォーム値の変化をスクリーンリーダーが読み上げないため、
       * 別の role="status" 要素に変換サマリを実テキストで配置する。
       * 視覚的には sr-only で隠す（視覚的冗長を避けるため）。
       */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={styles.srOnly}
      >
        {summaryText}
      </div>
    </div>
  );
}

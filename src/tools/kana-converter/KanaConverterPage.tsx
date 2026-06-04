"use client";

import { useState } from "react";
import Textarea from "@/components/Textarea";
import SegmentedControl from "@/components/SegmentedControl";
import Button from "@/components/Button";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import { convertKana, type KanaConvertMode } from "./logic";
import styles from "./KanaConverterPage.module.css";

/** 変換モードの選択肢（SegmentedControl の options として渡す） */
const MODE_OPTIONS: { label: string; value: KanaConvertMode }[] = [
  { value: "hiragana-to-katakana", label: "ひらがな → カタカナ" },
  { value: "katakana-to-hiragana", label: "カタカナ → ひらがな" },
  { value: "to-fullwidth-katakana", label: "半角カナ → 全角カナ" },
  { value: "to-halfwidth-katakana", label: "全角カナ → 半角カナ" },
];

/**
 * KanaConverterPage — ひらがな・カタカナ変換ツールのページ本体（単一実装）。
 *
 * 機能:
 * - SegmentedControl で4種の変換モードを切替（リアルタイム変換・ボタン不要）
 * - Textarea に入力すると即時変換（①-21 リアルタイム化）
 * - 変換結果をコピーするボタン（T-4b確定・持ち帰り対象）
 * - 結果が空のときコピーボタンを disabled
 * - C-3準拠: role="status" aria-live="polite" でサマリテキストをライブ通知
 *   （readOnly textarea は フォーム値変更をスクリーンリーダーに届けないため、
 *    別途サマリ用の div[role=status] を設ける）
 */
export default function KanaConverterPage() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<KanaConvertMode>("hiragana-to-katakana");
  const { copy, copiedKey } = useCopyToClipboard();

  // 入力が変わるたびにリアルタイム変換（convertKana は純粋同期関数・失敗経路なし）
  const output = convertKana(input, mode);
  const hasOutput = output.length > 0;

  // C-3: ライブリージョン用サマリテキスト（実テキストノード必須）
  const summaryText = hasOutput ? `変換しました（${output.length}文字）` : "";

  function handleCopy(): void {
    if (!hasOutput) return;
    void copy(output);
  }

  return (
    <div className={styles.container}>
      {/* 変換モード切替（①-21 リアルタイム化・②-11 SegmentedControl 化） */}
      <div className={styles.modeControl}>
        <span id="kana-mode-label" className={styles.modeLabel}>
          変換モード
        </span>
        <SegmentedControl
          options={MODE_OPTIONS}
          value={mode}
          onChange={(v) => setMode(v as KanaConvertMode)}
          aria-labelledby="kana-mode-label"
        />
      </div>

      {/* 入出力パネル */}
      <div className={styles.panels}>
        {/* 入力パネル */}
        <div className={styles.panel}>
          <label htmlFor="kana-input" className={styles.panelLabel}>
            入力テキスト
          </label>
          <Textarea
            id="kana-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="変換するテキストを入力..."
            rows={8}
            spellCheck={false}
            aria-label="入力テキスト"
          />
        </div>

        {/* 出力パネル */}
        <div className={styles.panel}>
          <div className={styles.outputHeader}>
            <label htmlFor="kana-output" className={styles.panelLabel}>
              変換結果
            </label>
            {/* コピーボタン（T-4b 確定・変換系=持ち帰り対象） */}
            <Button
              size="small"
              onClick={handleCopy}
              disabled={!hasOutput}
              aria-label={copiedKey ? COPIED_LABEL : "コピー"}
            >
              {copiedKey ? COPIED_LABEL : "コピー"}
            </Button>
          </div>
          {/* readOnly textarea は値変更をスクリーンリーダーに届けないため
              role="status" は付与しない（C-3 参照）。
              代わりに別途サマリ用 div[role=status] を配置する。 */}
          <Textarea
            id="kana-output"
            value={output}
            readOnly
            placeholder="結果がここに表示されます"
            rows={8}
            aria-label="変換結果"
          />
        </div>
      </div>

      {/* C-3 ライブリージョン: 変換結果のサマリを実テキストノードで通知する。
          視覚的には非表示（sr-only）。
          readOnly textarea ラップは不可（フォーム値変化はスクリーンリーダーに未通知）。 */}
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

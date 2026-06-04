"use client";

import { useState, useMemo, useId } from "react";
import { convertBase, formatBinary, formatHex, type NumberBase } from "./logic";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import Input from "@/components/Input";
import SegmentedControl from "@/components/SegmentedControl";
import ErrorMessage from "@/components/ErrorMessage";
import Button from "@/components/Button";
import styles from "./NumberBaseConverterPage.module.css";

/** 入力基数の選択肢 */
const BASE_OPTIONS: {
  label: string;
  value: string;
  numBase: NumberBase;
  placeholder: string;
}[] = [
  { label: "2進数 (BIN)", value: "2", numBase: 2, placeholder: "例: 11111111" },
  { label: "8進数 (OCT)", value: "8", numBase: 8, placeholder: "例: 377" },
  { label: "10進数 (DEC)", value: "10", numBase: 10, placeholder: "例: 255" },
  { label: "16進数 (HEX)", value: "16", numBase: 16, placeholder: "例: ff" },
];

/** 出力カード定義 */
interface ResultCard {
  key: string;
  label: string;
  displayValue: string;
  copyValue: string;
}

/**
 * NumberBaseConverterPage — 進数変換の単一実装。
 *
 * 機能:
 * - 入力基数の選択（SegmentedControl: 2/8/10/16進数）
 * - 数値入力（Input: type=text）
 * - 全基数への変換結果表示（4カード。2進/8進/10進/16進）
 * - 各カードにコピーボタン（T-4b: コピーあり確定。持ち帰り対象）
 * - エラー表示（ErrorMessage）
 *
 * 設計方針:
 * - 確定提示方式: 入力欄を最初から表示
 * - AP-I11: タイマーは useCopyToClipboard フック内で useRef+useEffect cleanup 済み
 * - C-3: role="status" aria-live="polite" に実テキストノードのサマリを配置
 *   （readOnly 出力 textarea をラップするだけでは SR に読み上げられないため分離）
 * - A-4: ロジック由来のエラーメッセージは logic.ts が日本語で返す
 * - T-4b: コピーあり確定。各基数ごとに key を使って copiedKey を識別する
 */
export default function NumberBaseConverterPage() {
  const [input, setInput] = useState("");
  const [fromBaseStr, setFromBaseStr] = useState<string>("10");
  const inputLabelId = useId();

  // T-4b: コピーあり確定。useCopyToClipboard フックを使用（独自実装しない）
  // 複数ターゲット: 各基数カードを key で識別する
  const { copy, copiedKey } = useCopyToClipboard();

  const fromBase = parseInt(fromBaseStr, 10) as NumberBase;
  const currentBaseOption =
    BASE_OPTIONS.find((o) => o.value === fromBaseStr) ?? BASE_OPTIONS[2];

  // 入力値から変換結果を計算
  const result = useMemo(() => convertBase(input, fromBase), [input, fromBase]);

  // 出力カード定義（2進数は視認性のためフォーマット済み表示、コピー値は生値）
  const cards: ResultCard[] = [
    {
      key: "binary",
      label: "2進数 (BIN)",
      displayValue: formatBinary(result.binary),
      copyValue: result.binary,
    },
    {
      key: "octal",
      label: "8進数 (OCT)",
      displayValue: result.octal,
      copyValue: result.octal,
    },
    {
      key: "decimal",
      label: "10進数 (DEC)",
      displayValue: result.decimal,
      copyValue: result.decimal,
    },
    {
      key: "hexadecimal",
      label: "16進数 (HEX)",
      displayValue: formatHex(result.hexadecimal),
      copyValue: result.hexadecimal,
    },
  ];

  // C-3: 変換成功/失敗をスクリーンリーダーに通知するサマリテキスト
  const statusSummary =
    result.success && input.trim()
      ? `変換しました`
      : result.error
        ? "入力が無効です"
        : "";

  return (
    <div className={styles.container}>
      {/* 入力基数の選択 (SegmentedControl) */}
      <SegmentedControl
        options={BASE_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
        value={fromBaseStr}
        onChange={(val) => {
          setFromBaseStr(val);
          setInput("");
        }}
        aria-label="入力する進数"
      />

      {/* 数値入力欄 */}
      <div className={styles.field}>
        <label htmlFor={inputLabelId} className={styles.fieldLabel}>
          変換する数値
        </label>
        <Input
          id={inputLabelId}
          aria-label="変換する数値"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={currentBaseOption.placeholder}
          spellCheck={false}
          error={!!result.error}
        />
      </div>

      {/* エラー表示: A-4 ErrorMessage を使用。logic.ts が日本語エラーを返す */}
      {result.error && <ErrorMessage message={result.error} />}

      {/* C-3: role="status" aria-live="polite" — 実テキストノードのサマリを配置
          readOnly な表示欄をラップするだけではフォーム値の変化がSRに読み上げられないため、
          別途サマリテキストを持つライブリージョンを設ける */}
      <div
        role="status"
        aria-live="polite"
        aria-label="変換結果サマリ"
        className={styles.srOnly}
      >
        {statusSummary}
      </div>

      {/* 変換結果カード (4基数) */}
      <div className={styles.resultGrid}>
        {cards.map((card) => {
          const isCopied = copiedKey === card.key;
          const hasValue = !!card.copyValue;
          return (
            <div key={card.key} className={styles.resultCard}>
              <div className={styles.resultCardLabel}>{card.label}</div>
              <div
                className={styles.resultCardValue}
                data-testid={`result-${card.key}`}
              >
                {card.displayValue || "—"}
              </div>
              <div className={styles.resultCardActions}>
                {/* T-4b: コピーボタンあり確定。出力が空のとき disabled */}
                <Button
                  size="small"
                  onClick={async () => {
                    if (hasValue) {
                      await copy(card.copyValue, card.key);
                    }
                  }}
                  disabled={!hasValue}
                  aria-label={isCopied ? COPIED_LABEL : "コピー"}
                >
                  {isCopied ? COPIED_LABEL : "コピー"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

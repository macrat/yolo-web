"use client";

/**
 * NumberBaseConverterTile — 進数変換の単一正典タイル
 *
 * cycle-228 T-9: NumberBaseConverterPage.tsx を Panel ルートのタイルへ作り直したもの。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>。外部ラッパーなし。
 * - **1ツール n タイル = variant**: full / bin-hex は同一コンポーネントの
 *   設定差で表現。別実装を作らない（分裂ゼロ）。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する。
 * - **logic.ts 共有エンジン**: convertBase / formatBinary / formatHex が唯一のロジック源。
 *
 * ## variant
 *
 * - `"full"` (デフォルト): SegmentedControl（2/8/10/16 基数選択）を表示し、
 *   4基数すべての結果カードを表示する。各カードにコピーボタン付き。
 * - `"bin-hex"`: 入力基数を2進数に固定し、16進数結果を中心に表示する。
 *   T-31 で道具箱に恒久展示される多モード変換系の代表。
 *   SegmentedControl を非表示にし、「2進数 → 16進数」の変換器として一目で分かる。
 *
 * ## アクセシビリティ（C-3 準拠）
 *
 * - 出力カードの値は role="status" aria-live="polite" のライブリージョンから
 *   テキストサマリで通知する（readOnly 出力欄の変化は SR が読み上げないため）。
 */

import { useState, useMemo, useId } from "react";
import Panel from "@/components/Panel";
import { convertBase, formatBinary, formatHex, type NumberBase } from "./logic";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import Input from "@/components/Input";
import SegmentedControl from "@/components/SegmentedControl";
import ErrorMessage from "@/components/ErrorMessage";
import Button from "@/components/Button";
import styles from "./NumberBaseConverterTile.module.css";

/** 入力基数の選択肢（variant=full 用） */
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

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type NumberBaseConverterTileVariant = "full" | "bin-hex";

export interface NumberBaseConverterTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": 基数選択 SegmentedControl + 4基数すべての結果カード
   * - "bin-hex": 入力基数を2進数に固定し、16進数結果を中心に表示（固定 variant）
   */
  variant?: NumberBaseConverterTileVariant;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

export default function NumberBaseConverterTile({
  variant = "full",
  as = "section",
  className,
}: NumberBaseConverterTileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合防止） ----------
  const uid = useId();
  const inputId = `${uid}-input`;

  // ---------- variant から固定基数を決定 ----------
  // "full" は SegmentedControl でユーザーが切り替え可能。
  // "bin-hex" は2進数に固定（ユーザーが変更できない）。
  const isBinHex = variant === "bin-hex";

  // ---------- State ----------
  // full の場合のみ基数を state で管理。bin-hex は 2 に固定。
  const [fromBaseStr, setFromBaseStr] = useState<string>("10");
  const [input, setInput] = useState("");

  // T-4b: 複数ターゲット: 各基数カードを key で識別する
  const { copy, copiedKey } = useCopyToClipboard();

  // 実際に使う基数: bin-hex は2進数固定、full はセレクト値を使用
  const fromBase = (isBinHex ? 2 : parseInt(fromBaseStr, 10)) as NumberBase;
  const currentBaseOption =
    BASE_OPTIONS.find((o) => o.value === fromBaseStr) ?? BASE_OPTIONS[2];

  // ---------- リアルタイム変換（共有エンジン logic.ts を使用） ----------
  const result = useMemo(() => convertBase(input, fromBase), [input, fromBase]);

  // ---------- 出力カード定義 ----------
  // 2進数は視認性のためフォーマット済み表示、コピー値は生値（formatBinary なし）
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

  // ---------- ハンドラ ----------
  function handleBaseChange(val: string): void {
    // isBinHex の場合はここに到達しない（SegmentedControl が非表示）
    setFromBaseStr(val);
    setInput("");
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setInput(e.target.value);
  }

  // C-3: 変換成功/失敗をスクリーンリーダーに通知するサマリテキスト
  const statusSummary =
    result.success && input.trim()
      ? "変換しました"
      : result.error
        ? "入力が無効です"
        : "";

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）
  return (
    <Panel as={as} className={className}>
      {/* variant=full のみ: 入力基数選択 SegmentedControl */}
      {!isBinHex && (
        <div className={styles.baseControl}>
          <SegmentedControl
            options={BASE_OPTIONS.map((o) => ({
              label: o.label,
              value: o.value,
            }))}
            value={fromBaseStr}
            onChange={handleBaseChange}
            aria-label="入力する進数"
          />
        </div>
      )}

      {/* variant=bin-hex のみ: 方向ラベル（2進数 → 16進数） */}
      {isBinHex && <div className={styles.directionLabel}>2進数 → 16進数</div>}

      {/* 数値入力欄 */}
      <div className={styles.field}>
        <label htmlFor={inputId} className={styles.fieldLabel}>
          変換する数値
        </label>
        <Input
          id={inputId}
          aria-label={isBinHex ? "変換する数値（2進数）" : "変換する数値"}
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder={
            isBinHex ? "例: 11111111" : currentBaseOption.placeholder
          }
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

      {/* variant=full: 変換結果カード（4基数） */}
      {!isBinHex && (
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
      )}

      {/* variant=bin-hex: 16進結果を中心に強調表示 */}
      {isBinHex &&
        (() => {
          const hexCard = cards.find((c) => c.key === "hexadecimal")!;
          const isCopied = copiedKey === hexCard.key;
          const hasValue = !!hexCard.copyValue;
          return (
            <div className={styles.hexResult}>
              <div className={styles.hexResultHeader}>
                <span className={styles.hexResultLabel}>{hexCard.label}</span>
                <Button
                  size="small"
                  onClick={async () => {
                    if (hasValue) {
                      await copy(hexCard.copyValue, hexCard.key);
                    }
                  }}
                  disabled={!hasValue}
                  aria-label={isCopied ? COPIED_LABEL : "コピー"}
                >
                  {isCopied ? COPIED_LABEL : "コピー"}
                </Button>
              </div>
              <div
                className={styles.hexResultValue}
                data-testid="result-hexadecimal"
              >
                {hexCard.displayValue || "—"}
              </div>
            </div>
          );
        })()}
    </Panel>
  );
}
